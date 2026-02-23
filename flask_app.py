from dotenv import load_dotenv
load_dotenv()
from flask_socketio import SocketIO

from flask import Flask, request, jsonify, session, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import qrcode, os, uuid, socket

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "your_secret_key")
socketio = SocketIO(app, cors_allowed_origins="*")

app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True

CORS(app, supports_credentials=True, origins="*")

app.config['UPLOAD_FOLDER'] = 'static/qrs'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)

class QRCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'))
    original_url = db.Column(db.Text, nullable=False)
    redirect_id = db.Column(db.String(50), unique=True, nullable=False)
    filename = db.Column(db.String(100), nullable=False)
    scan_count = db.Column(db.Integer, default=0)
    custom_name = db.Column(db.String(100))
    admin = db.relationship('Admin', backref=db.backref('qrs', lazy=True))

with app.app_context():
    db.create_all()

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

def get_base_url():
    return os.environ.get("BASE_URL")

@app.route('/')
def home():
    return jsonify({"message": "QR Tracker API is running"}), 200

@app.route('/register', methods=['POST'])
def register():
    email = request.form.get('email')
    password_raw = request.form.get('password')
    if not email or not password_raw:
        return jsonify({"message": "Email and password are required"}), 400
    existing = Admin.query.filter_by(email=email).first()
    if existing:
        return jsonify({"message": "Email already exists"}), 400
    password_hashed = generate_password_hash(password_raw)
    admin = Admin(email=email, password=password_hashed)
    db.session.add(admin)
    db.session.commit()
    return jsonify({"message": "Success"}), 200

@app.route('/login', methods=['POST'])
def login():
    email = request.form.get('email')
    password = request.form.get('password')
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400
    admin = Admin.query.filter_by(email=email).first()
    if admin and check_password_hash(admin.password, password):
        session['admin_id'] = admin.id
        return jsonify({"message": "Success"}), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/logout', methods=['POST', 'GET'])
def logout():
    session.pop('admin_id', None)
    return jsonify({"message": "Logged out"}), 200

@app.route('/me', methods=['GET'])
def me():
    logged_in = 'admin_id' in session
    return jsonify({"logged_in": logged_in}), 200

@app.route('/api/qrcodes', methods=['GET'])
def get_qrcodes():
    if 'admin_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    qr_list = QRCode.query.filter_by(admin_id=session['admin_id']).all()
    qr_data = [{
        'id': qr.id,
        'original_url': qr.original_url,
        'redirect_id': qr.redirect_id,
        'filename': qr.filename,
        'scan_count': qr.scan_count,
        'custom_name': qr.custom_name
    } for qr in qr_list]
    return jsonify(qr_data), 200

@app.route('/generate_qrs', methods=['POST'])
def generate_qrs():
    if 'admin_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    original_url = request.form.get('url')
    count_str = request.form.get('count')
    if not original_url or not count_str:
        return jsonify({"error": "url and count are required"}), 400
    try:
        count = int(count_str)
    except ValueError:
        return jsonify({"error": "count must be an integer"}), 400
    base_url = get_base_url()
    for _ in range(count):
        uid = str(uuid.uuid4())[:8]
        redirect_url = f"{base_url}/r/{uid}"
        filename = f"{uid}.png"
        path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        qrcode.make(redirect_url).save(path)
        qr = QRCode(admin_id=session['admin_id'], original_url=original_url, redirect_id=uid, filename=filename)
        db.session.add(qr)
    db.session.commit()
    return jsonify({'success': True, 'count': count}), 200

@app.route('/update_name', methods=['POST'])
def update_name():
    if 'admin_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    qr_id = request.form.get('qr_id')
    custom_name = request.form.get('custom_name')
    qr = QRCode.query.filter_by(id=qr_id, admin_id=session['admin_id']).first()
    if qr:
        qr.custom_name = custom_name
        db.session.commit()
        return jsonify({"message": "Success"}), 200
    return jsonify({"error": "QR not found"}), 404

@app.route('/delete_qr', methods=['POST'])
def delete_qr():
    if 'admin_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    qr_id = request.form.get('qr_id')
    if not qr_id:
        return jsonify({"error": "qr_id is required"}), 400
    qr = QRCode.query.filter_by(id=qr_id, admin_id=session['admin_id']).first()
    if not qr:
        return jsonify({"error": "Not found"}), 404
    qr_path = os.path.join(app.config['UPLOAD_FOLDER'], qr.filename)
    if os.path.exists(qr_path):
        os.remove(qr_path)
    db.session.delete(qr)
    db.session.commit()
    return jsonify({"message": "Success"}), 200

@app.route('/r/<qr_id>')
def redirect_to_original(qr_id):
    qr = QRCode.query.filter_by(redirect_id=qr_id).first()
    if qr:
        qr.scan_count += 1
        db.session.commit()
        socketio.emit('scan_update', {
            'id': qr.id,
            'scan_count': qr.scan_count
        })
        return redirect(qr.original_url)
    return 'Invalid QR code.', 404

@app.route('/init')
def init():
    db.create_all()
    return "Tables created.", 200

if __name__ == "__main__":
    socketio.run(app)

