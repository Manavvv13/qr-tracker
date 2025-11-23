import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { QrCode, LogOut, Download, Trash2, Edit2, Check, X } from "lucide-react";
import { io } from "socket.io-client";

interface QRCodeData {
  id: number;
  original_url: string;
  redirect_id: string;
  filename: string;
  scan_count: number;
  custom_name?: string;
}

const API_BASE = `http://${window.location.hostname}:5000`;

const Dashboard = () => {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [url, setUrl] = useState("");
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/qrcodes`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setQrCodes(data.sort((a, b) => a.id - b.id));
      } else navigate("/");
    } catch {
      toast({ title: "Error", description: "Could not connect to server", variant: "destructive" });
    }
  };

  useEffect(() => {
  const socket = io(`http://${window.location.hostname}:5000`);

  socket.on("scan_update", (data: { id: number; scan_count: number }) => {
    setQrCodes(prev =>
      prev.map(q => q.id === data.id ? { ...q, scan_count: data.scan_count } : q)
    );
  });

  return () => {
    socket.disconnect();
  };
}, []);


  const saveEdit = async (qr: QRCodeData) => {
    const formData = new FormData();
    formData.append("qr_id", qr.id.toString());
    formData.append("custom_name", editName);

    try {
      const response = await fetch(`${API_BASE}/update_name`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        setQrCodes(qrCodes.map((q) => (q.id === qr.id ? { ...q, custom_name: editName } : q)));
        toast({ title: "Success", description: "QR name updated" });
      } else toast({ title: "Error", description: "Update failed", variant: "destructive" });
    } catch {
      toast({ title: "Error", description: "Could not connect to server", variant: "destructive" });
    }

    setEditingId(null);
  };

  const handleGenerateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("url", url);
      formData.append("count", count.toString());

      const response = await fetch(`${API_BASE}/generate_qrs`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        toast({ title: "Success", description: `Generated ${count} QR code(s)!` });
        setUrl("");
        setCount(1);
        fetchQRCodes();
      } else toast({ title: "Error", description: "Failed to generate QR codes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (qrId: number) => {
    try {
      const formData = new FormData();
      formData.append("qr_id", qrId.toString());

      const response = await fetch(`${API_BASE}/delete_qr`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        setQrCodes(qrCodes.filter((qr) => qr.id !== qrId));
        toast({ title: "Success", description: "QR code deleted" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete QR code", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, { credentials: "include" });
      navigate("/");
    } finally {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#060b13] text-white">
      {/* Header */}
      <header className="border-b border-[#0d111a] bg-[#070d16]/90 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <QrCode className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-semibold">QR Tracker</h1>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-sm flex gap-2 text-blue-300 hover:text-white">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-6 py-10 space-y-10">
        {/* Stats + Quick Generate */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-[#0b1323] border-none text-white">
            <CardContent className="p-6">
              <p className="text-sm text-gray-400">ACTIVE LINKS</p>
              <p className="text-4xl mt-2">{qrCodes.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0b1323] border-none text-white">
            <CardContent className="p-6">
              <p className="text-sm text-gray-400">TOTAL SCANS</p>
              <p className="text-4xl mt-2">
                {qrCodes.reduce((acc, v) => acc + v.scan_count, 0)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#0b1323] border-none text-white">
            <CardContent className="p-6 space-y-3">
              <p className="text-sm text-gray-400">Quick Generate</p>
              <form onSubmit={handleGenerateQR} className="flex gap-2">
                <Input
                  placeholder="https://site.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-[#0e1729] border-none text-white"
                  required
                />
                <Input
                  type="number"
                  min={1}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-16 bg-[#0e1729] border-none text-white"
                  required
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4">
                  Create
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* QR LIST */}
        {qrCodes.length === 0 ? (
          <div className="border border-[#0e1729] rounded-lg py-28 text-center text-gray-400 text-lg">
            No QR codes found
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {qrCodes.map((qr) => (
              <Card key={qr.id} className="bg-[#0b1323] border-none text-white">
                <CardContent className="p-6 flex flex-col items-center">
                  <img src={`${API_BASE}/static/qrs/${qr.filename}`} className="w-44 h-44 mb-4" />

                  {/* NAME / EDIT INPUT */}
                  {editingId === qr.id ? (
                    <div className="flex w-full gap-2 mb-3">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-[#0e1729] border-none text-white"
                      />
                      <Button size="icon" variant="ghost" onClick={() => saveEdit(qr)}>
                        <Check className="w-4 h-4 text-green-400" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center w-full mb-3">
                      <p className="font-semibold truncate">{qr.custom_name || qr.redirect_id}</p>
                      <Button size="icon" variant="ghost" onClick={() => setEditingId(qr.id)}>
                        <Edit2 className="w-4 h-4 text-gray-300" />
                      </Button>
                    </div>
                  )}

                  <p className="text-sm text-gray-400 truncate w-full">{qr.original_url}</p>

                  <p className="text-sm font-medium mt-3 mb-4">
                    Scans: <span className="text-blue-400">{qr.scan_count}</span>
                  </p>

                  <div className="flex w-full gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-[#0e1729] border-none text-white"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = `${API_BASE}/static/qrs/${qr.filename}`;
                        link.download = qr.filename;
                        link.click();
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(qr.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
