import { Clock, Target, CheckCircle } from "lucide-react";

export default function ImpactSection() {
  const stats = [
    {
      label: "Faster Hiring",
      value: "50%",
      color: "green1",
      icon: Clock,
    },
    {
      label: "Reduced Manual Work",
      value: "75%",
      color: "green2",
      icon: Target,
    },
    {
      label: "Eliminated Bias",
      value: "100%",
      color: "green3",
      icon: CheckCircle,
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      green1: "from-[#A0C878] to-[#DDEB9D]",
      green2: "from-[#DDEB9D] to-[#FAF6E9]",
      green3: "from-[#FAF6E9] to-[#FFFDF6]",
    };
    return colors[color];
  };

  return (
    <section className="py-20 px-6 bg-[#FAF6E9]">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-[#2D2D2D] mb-4">
          Measurable Impact
        </h2>
        <p className="text-xl text-[#555] mb-16 max-w-2xl mx-auto">
          See the transformative results our clients achieve with AutoScreen.ai
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {stats.map(({ label, value, color, icon: Icon }, index) => (
            <div key={index} className="relative group">
              <div className="bg-[#FFFDF6] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-[#DDEB9D]">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${getColorClasses(
                    color
                  )} rounded-full flex items-center justify-center mx-auto mb-6`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-bold text-[#2D2D2D] mb-2">
                  {value}
                </div>
                <div className="text-[#666] font-medium">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
