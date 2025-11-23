# QR Tracker - Setup Instructions

This project consists of a React frontend and Flask backend for QR code generation and tracking.

## Backend Setup (Flask)

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Create a .env file:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your SECRET_KEY

3. **Run the Flask server:**
   ```bash
   python flask_app.py
   ```
   The backend will run on `http://localhost:5000`

## Frontend Setup (React)

The frontend is already configured. Just ensure the development server is running.

## How It Works

### Backend Features:
- User registration and login with password hashing
- Session-based authentication
- QR code generation with unique redirect IDs
- Scan count tracking
- QR code deletion with file cleanup
- SQLite database (can be switched to PostgreSQL)

### Frontend Features:
- Beautiful login/register pages
- Dashboard to view all QR codes
- Generate multiple QR codes at once
- View scan counts in real-time
- Download QR codes
- Rename QR codes locally
- Delete QR codes

### API Endpoints:
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /logout` - Logout user
- `GET /api/qrcodes` - Get all QR codes for logged-in user
- `POST /generate_qrs` - Generate new QR codes
- `POST /delete_qr` - Delete a QR code
- `GET /r/<qr_id>` - Redirect and count scans

## Usage

1. Start the Flask backend: `python flask_app.py`
2. The React frontend should already be running in Lovable
3. Register a new account
4. Login and start generating QR codes!
5. Share the QR codes - each scan will be tracked
6. The redirect URL format is: `http://localhost:5000/r/<unique-id>`

## Notes

- QR codes are stored in `static/qrs/` folder
- Database file is `qrtracker.db` (SQLite)
- CORS is enabled for the React frontend
- Sessions are stored server-side with cookies
