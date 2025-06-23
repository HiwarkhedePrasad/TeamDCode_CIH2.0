import { Clock, Users, FileText } from "lucide-react";

export default function ProblemSection() {
  const problems = [
    {
      title: "Inefficient Recruitment",
      description:
        "Traditional recruitment processes are time-consuming and often fail to identify top talent efficiently, leading to missed opportunities and extended hiring cycles.",
      icon: Clock,
      color: "from-red-500 to-orange-500",
    },
    {
      title: "Biased Hiring",
      description:
        "Human bias can lead to unfair hiring decisions, overlooking qualified candidates from diverse backgrounds and limiting organizational growth.",
      icon: Users,
      color: "from-blue-500 to-purple-500",
    },
    {
      title: "Manual Workload",
      description:
        "Recruiters spend countless hours on repetitive tasks like screening resumes and scheduling interviews, reducing time for strategic activities.",
      icon: FileText,
      color: "from-green-500 to-teal-500",
    },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The Problem
          </h2>
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-semibold text-purple-700 mb-4">
              AI-Driven Recruitment Automation
            </h3>
            <p className="text-xl text-gray-600 leading-relaxed">
              Modern hiring still suffers from delays, bias, and burnout. Our AI
              system targets these root issues with precision and delivers
              measurable improvements.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map(({ title, description, icon: Icon, color }, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div
                className={`w-16 h-16 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center mb-6`}
              >
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
