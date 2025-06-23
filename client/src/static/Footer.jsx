// Footer Component
export default function Footer() {
  return (
    <footer className="bg-[#FFFDF6] border-t border-[#DDEB9D] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-[#A0C878] to-[#DDEB9D] rounded-lg mr-3"></div>
              <span className="text-2xl font-bold text-[#2D2D2D]">
                AutoScreen.ai
              </span>
            </div>
            <p className="text-[#666666] max-w-md">
              Revolutionizing recruitment with AI-powered automation and
              intelligent candidate screening.
            </p>
          </div>
          <div>
            <h4 className="text-[#2D2D2D] font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-[#666666]">
              <li>
                <a href="#" className="hover:text-[#2D2D2D] transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#2D2D2D] transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#2D2D2D] transition-colors">
                  API
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#2D2D2D] font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-[#666666]">
              <li>
                <a href="#" className="hover:text-[#2D2D2D] transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#2D2D2D] transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#2D2D2D] transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#DDEB9D] pt-8 text-center">
          <p className="text-[#666666]">
            © 2024 AutoScreen.ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
