export default function Navbar() {
  const navItems = ["Product", "Solutions", "Resources", "Pricing"];

  return (
    <nav className="bg-[#FFFDF6] shadow-sm border-b border-[#FAF6E9] px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-[#DDEB9D] to-[#A0C878] rounded-lg mr-3 flex items-center justify-center">
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
              className="text-gray-700 hover:text-[#A0C878] font-medium transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </div>

        <button className="bg-gradient-to-r from-[#DDEB9D] to-[#A0C878] text-white px-6 py-2 rounded-full font-medium hover:from-[#c9da70] hover:to-[#8bbd5c] transition-all duration-200 transform hover:scale-105">
          Request Demo
        </button>
      </div>
    </nav>
  );
}
