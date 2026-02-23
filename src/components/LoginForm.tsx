import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// 🔥 Auto-detect backend IP
const API_BASE = import.meta.env.VITE_API_URL;

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Error",
          description: "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not connect to server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">QR Tracker</h1>
      </div>

      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
        <p className="text-muted-foreground">
          Don't have an account?{" "}
          <a href="/register" className="text-foreground font-semibold underline hover:text-accent transition-colors">
            Create a new account now.
          </a>
          <br />
          It's FREE! Takes less than a minute.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-accent transition-colors"
          />
        </div>

        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-accent transition-colors"
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 rounded-lg font-semibold transition-all hover:scale-[1.02]"
        >
          {loading ? "Logging in..." : "Login Now"}
        </Button>
      </form>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        © 2024 QR Tracker. All rights reserved.
      </div>
    </div>
  );
};

export default LoginForm;
