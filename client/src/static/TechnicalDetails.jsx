import { Brain, Target, Users, Shield } from "lucide-react";

export default function TechnicalDetails() {
  const techFeatures = [
    {
      icon: Brain,
      title: "Natural Language Processing",
      desc: "Advanced NLP for understanding context and intent",
    },
    {
      icon: Target,
      title: "Machine Learning Models",
      desc: "Continuously improving algorithms for better matching",
    },
    {
      icon: Users,
      title: "Multi-Agent Systems",
      desc: "Coordinated AI agents working in perfect harmony",
    },
    {
      icon: Shield,
      title: "Data Security",
      desc: "Enterprise-grade security and compliance standards",
    },
  ];

  return (
    <section className="py-20 px-6 bg-[#FAF6E9]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#2D2D2D] mb-6">
            Technical Excellence
          </h2>
          <p className="text-xl text-[#555555] max-w-4xl mx-auto leading-relaxed">
            AutoScreen.ai leverages advanced AI techniques, including natural
            language processing (NLP), machine learning (ML), and multi-agent
            systems, to automate and optimize the recruitment process. Our
            platform ensures data privacy and security, complying with industry
            standards and regulations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {techFeatures.map(({ icon: Icon, title, desc }, index) => (
            <div
              key={index}
              className="bg-[#FFFDF6] rounded-xl p-6 border border-[#DDEB9D] hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-[#A0C878] to-[#DDEB9D] rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-[#2D2D2D] mb-2">{title}</h3>
              <p className="text-[#555555] text-sm">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#FFFDF6] rounded-2xl p-8 border border-[#DDEB9D]">
          <div className="flex items-center mb-4">
            <Shield className="w-8 h-8 text-[#A0C878] mr-3" />
            <h3 className="text-2xl font-bold text-[#2D2D2D]">
              Security & Compliance
            </h3>
          </div>
          <p className="text-[#555555] leading-relaxed">
            Built with enterprise-grade security features including end-to-end
            encryption, GDPR compliance, SOC 2 Type II certification, and
            regular security audits to ensure your candidate data remains
            protected at all times.
          </p>
        </div>
      </div>
    </section>
  );
}
