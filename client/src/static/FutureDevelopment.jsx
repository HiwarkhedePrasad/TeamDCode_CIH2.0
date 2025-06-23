import { Brain, Target, Users, Briefcase } from "lucide-react";

// Future Development Component
export default function FutureDevelopment() {
  const features = [
    {
      icon: Brain,
      title: "Predictive Analytics",
      desc: "Advanced algorithms to predict candidate success rates",
    },
    {
      icon: Target,
      title: "Platform Integration",
      desc: "Seamless connection with major HR and ATS platforms",
    },
    {
      icon: Users,
      title: "Multi-Language Support",
      desc: "Global reach with support for 20+ languages",
    },
    {
      icon: Briefcase,
      title: "Industry Specialization",
      desc: "Tailored solutions for healthcare, tech, finance, and more",
    },
  ];

  return (
    <section className="py-16 px-6 bg-[#FAF6E9]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2D2D2D] mb-4">
            Future Development
          </h2>
          <p className="text-xl text-[#555555] max-w-3xl mx-auto leading-relaxed">
            We are continuously enhancing AutoScreen.ai with cutting-edge
            features and capabilities to stay ahead of the evolving recruitment
            landscape.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }, index) => (
            <div
              key={index}
              className="bg-[#FFFDF6] border border-[#DDEB9D] rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-[#A0C878] to-[#DDEB9D] rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-[#2D2D2D] mb-2">{title}</h3>
              <p className="text-[#555555] text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
