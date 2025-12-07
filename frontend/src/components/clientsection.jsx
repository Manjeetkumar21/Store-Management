export default function ClientsSection() {
  const clients = [
    {
      name: "TechCorp",
      logo: "https://via.placeholder.com/200x80/3b82f6/ffffff?text=TechCorp"
    },
    {
      name: "DesignPro",
      logo: "https://via.placeholder.com/200x80/6366f1/ffffff?text=DesignPro"
    },
    {
      name: "PrintMaster",
      logo: "https://via.placeholder.com/200x80/4f46e5/ffffff?text=PrintMaster"
    },
    {
      name: "MediaWorks",
      logo: "https://via.placeholder.com/200x80/0ea5e9/ffffff?text=MediaWorks"
    },
    {
      name: "BrandHub",
      logo: "https://via.placeholder.com/200x80/475569/ffffff?text=BrandHub"
    },
    {
      name: "CreativeStudio",
      logo: "https://via.placeholder.com/200x80/1e40af/ffffff?text=CreativeStudio"
    }
  ];

  return (
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle, rgb(59, 130, 246) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <span className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold tracking-wide uppercase shadow-lg">
              Our Clients
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Trusted by Industry Leaders
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Join hundreds of satisfied clients worldwide
          </p>
        </div>

        {/* Scrolling logos container */}
        <div className="relative">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 via-blue-50/80 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 via-blue-50/80 to-transparent z-10 pointer-events-none"></div>

          {/* Scrolling wrapper */}
          <div className="overflow-hidden  py-4">
            <div className="flex animate-scroll hover:pause">
              {/* First set of logos */}
              {clients.map((client, index) => (
                <div
                  key={`client-1-${index}`}
                  className="flex-shrink-0 mx-4 group"
                >
                  <div className="relative bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 group-hover:border-blue-300 group-hover:-translate-y-1 w-64 h-32 flex items-center justify-center">
                    <img
                      src={client.logo}
                      alt={client.name}
                      className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                    />
                    {/* Top accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {clients.map((client, index) => (
                <div
                  key={`client-2-${index}`}
                  className="flex-shrink-0 mx-4 group"
                >
                  <div className="relative bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 group-hover:border-blue-300 group-hover:-translate-y-1 w-64 h-32 flex items-center justify-center">
                    <img
                      src={client.logo}
                      alt={client.name}
                      className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                    />
                    {/* Top accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats or additional info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-slate-600">Happy Clients</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-slate-600">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">10k+</div>
            <div className="text-slate-600">Projects Done</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
            <div className="text-slate-600">Satisfaction</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 10s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}