export default function Navbar() {
  const navItems = ["Product", "Solutions", "Resources", "Pricing"];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg mr-3 flex items-center justify-center">
            <span className="text-white font-bold text-lg">■</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            AutoScreen.ai
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </div>

        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105">
          Request Demo
        </button>
      </div>
    </nav>
  );
}
