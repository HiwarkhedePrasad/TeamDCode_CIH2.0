/* File: src/components/Hero.jsx */

export default function Hero() {
  return (
    <section
      className="hero-bg relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #f3e7d1 0%, #e8d5b7 25%, #7a9b8e 50%, #a8b5a0 75%, #f3e7d1 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-center justify-between">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              AI-powered multi-agent system for job screening and interviews
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Automate your entire recruitment process with our AI agents.
              Reduce time-to-hire, eliminate bias, and find the best candidates
              faster.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="relative">
              <div className="flex space-x-4">
                <div className="w-16 h-20 bg-orange-300 rounded-full opacity-80"></div>
                <div className="w-16 h-20 bg-green-600 rounded-full opacity-80"></div>
                <div className="w-16 h-20 bg-yellow-400 rounded-full opacity-80"></div>
                <div className="w-16 h-20 bg-gray-400 rounded-full opacity-80"></div>
              </div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500 rounded-full opacity-30"></div>
              <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-orange-400 rounded-full opacity-40"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
