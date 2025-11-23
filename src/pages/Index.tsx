import HeroSection from "@/components/HeroSection";
import LoginForm from "@/components/LoginForm";

const Index = () => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Hero */}
      <div className="hidden lg:block">
        <HeroSection />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <LoginForm />
      </div>
    </div>
  );
};

export default Index;
