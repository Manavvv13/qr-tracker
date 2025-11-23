const HeroSection = () => {
  return (
    <div className="relative h-full bg-gradient-to-br from-primary via-primary to-accent overflow-hidden">
      {/* Geometric Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-96 h-96 border-2 border-white rotate-45 rounded-3xl"></div>
        <div className="absolute top-32 right-32 w-80 h-80 border-2 border-white rotate-45 rounded-3xl"></div>
        <div className="absolute top-44 right-44 w-64 h-64 border-2 border-white rotate-45 rounded-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-12 text-white">
        {/* Icon */}
        <div className="w-16 h-16 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
          </svg>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center max-w-xl">
          <h1 className="text-6xl font-bold mb-4 leading-tight">
            Hello
            <br />
            QR Tracker!
            <span className="inline-block ml-2 animate-bounce">👋</span>
          </h1>
          <p className="text-xl text-white/90 leading-relaxed">
            Track and manage your QR codes efficiently. Get highly productive through automation and save tons of time!
          </p>
        </div>

        {/* Footer */}
        <div className="text-sm text-white/70">
          © 2024 QR Tracker. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
