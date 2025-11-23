import HeroSection from "@/components/HeroSection";
import RegistrationForm from "@/components/RegistrationForm";

const Register = () => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Hero */}
      <div className="hidden lg:block">
        <HeroSection />
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <RegistrationForm />
      </div>
    </div>
  );
};

export default Register;
