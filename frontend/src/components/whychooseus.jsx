export default function FeaturesSection() {
  const features = [
    {
      icon: "⚡",
      title: "24-48 Hour Delivery",
      description: "Lightning-fast turnaround times ensure your projects are completed when you need them, without compromising quality.",
      gradient: "from-blue-600 to-blue-800",
      iconBg: "from-blue-500 to-blue-700"
    },
    {
      icon: "📦",
      title: "Product Ready",
      description: "Receive fully finished, market-ready products that meet the highest industry standards and specifications.",
      gradient: "from-sky-600 to-blue-700",
      iconBg: "from-sky-500 to-blue-600"
    },
    {
      icon: "🚪",
      title: "Doorstep Delivery",
      description: "Convenient delivery right to your location, saving you time and ensuring safe arrival of your materials.",
      gradient: "from-indigo-600 to-blue-800",
      iconBg: "from-indigo-500 to-blue-700"
    },
    {
      icon: "🖨️",
      title: "Print-Ready Files",
      description: "Professional-grade files optimized for printing, formatted to exact specifications with no additional prep needed.",
      gradient: "from-blue-700 to-slate-800",
      iconBg: "from-blue-600 to-slate-700"
    },
    {
      icon: "💰",
      title: "Instant Quotation",
      description: "Get transparent pricing immediately with our quick quote system. No hidden fees, no surprises.",
      gradient: "from-slate-600 to-blue-800",
      iconBg: "from-slate-500 to-blue-700"
    },
    {
      icon: "📮",
      title: "Premium Packaging",
      description: "Secure, professional packaging that protects your products and creates an impressive unboxing experience.",
      gradient: "from-blue-800 to-indigo-800",
      iconBg: "from-blue-700 to-indigo-700"
    }
  ];

  return (
    <section className="relative py-24 px-4 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Subtle background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-600 rounded-full blur-3xl"></div>
      </div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle, rgb(59, 130, 246) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <span className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold tracking-wide uppercase shadow-lg">
              Our Features
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight">
            Why Choose Us
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto">
            Experience excellence in every aspect of our service
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative"
            >
              {/* Subtle shadow layer */}
              <div className={`absolute -inset-0.5 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500`}></div>
              
              {/* Card */}
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 border border-slate-200 group-hover:border-blue-300 h-full">
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${feature.gradient} rounded-t-2xl`}></div>
                
                {/* Icon container */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-all duration-300`}>
                    {feature.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-blue-700 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative corner elements */}
                <div className="absolute top-4 right-4 w-20 h-20 border-t-2 border-r-2 border-blue-200 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 w-20 h-20 border-b-2 border-l-2 border-blue-200 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          ))}
        </div>


       
      </div>
    </section>
  );
}