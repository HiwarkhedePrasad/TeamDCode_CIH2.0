import { Clock, Target, CheckCircle } from "lucide-react";

export default function ImpactSection() {
  const stats = [
    { label: "Faster Hiring", value: "50%", color: "purple", icon: Clock },
    { label: "Reduced Manual Work", value: "75%", color: "blue", icon: Target },
    {
      label: "Eliminated Bias",
      value: "100%",
      color: "green",
      icon: CheckCircle,
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: "from-purple-500 to-pink-500",
      blue: "from-blue-500 to-cyan-500",
      green: "from-green-500 to-emerald-500",
    };
    return colors[color];
  };

  return (
    <section className="py-20 px-6 bg-gray-900">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Measurable Impact
        </h2>
        <p className="text-xl text-gray-300 mb-16 max-w-2xl mx-auto">
          See the transformative results our clients achieve with AutoScreen.ai
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {stats.map(({ label, value, color, icon: Icon }, index) => (
            <div key={index} className="relative group">
              <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 transform hover:scale-105">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${getColorClasses(
                    color
                  )} rounded-full flex items-center justify-center mx-auto mb-6`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-bold text-white mb-2">
                  {value}
                </div>
                <div className="text-gray-300 font-medium">{label}</div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
