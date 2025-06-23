import { ArrowRight } from "lucide-react"; // Make sure this import is present
// CTA Section Component
export default function CTASection() {
  return (
    <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Ready to Transform Your
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
            {" "}
            Recruitment Process?
          </span>
        </h2>
        <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto leading-relaxed">
          Request a demo today and discover how AutoScreen.ai can help you hire
          better candidates faster than ever before.
        </p>
        <button className="group bg-white text-purple-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 shadow-2xl">
          Request Demo
          <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
}
