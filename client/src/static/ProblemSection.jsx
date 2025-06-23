import { Clock, Users, FileText } from "lucide-react";

export default function ProblemSection() {
  const problems = [
    {
      title: "Inefficient Recruitment",
      description:
        "Traditional recruitment processes are time-consuming and often fail to identify top talent efficiently, leading to missed opportunities and extended hiring cycles.",
      icon: Clock,
      color: "from-[#DDEB9D] to-[#A0C878]",
    },
    {
      title: "Biased Hiring",
      description:
        "Human bias can lead to unfair hiring decisions, overlooking qualified candidates from diverse backgrounds and limiting organizational growth.",
      icon: Users,
      color: "from-[#A0C878] to-[#DDEB9D]",
    },
    {
      title: "Manual Workload",
      description:
        "Recruiters spend countless hours on repetitive tasks like screening resumes and scheduling interviews, reducing time for strategic activities.",
      icon: FileText,
      color: "from-[#FAF6E9] to-[#A0C878]",
    },
  ];

  return (
    <section className="py-20 px-6 bg-[#FFFDF6]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1f2937] mb-6">
            The Problem
          </h2>
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-semibold text-[#A0C878] mb-4">
              AI-Driven Recruitment Automation
            </h3>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Modern hiring still suffers from delays, bias, and burnout. Our AI
              system targets these root issues with precision and delivers
              measurable improvements.
            </p>
          </div>
        </div>

        {/* Problem Cards */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {problems.map(({ title, description, icon: Icon, color }, index) => (
            <div
              key={index}
              className="bg-[#FAF6E9] rounded-xl p-8 shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-2"
            >
              <div
                className={`w-16 h-16 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center mb-6`}
              >
                <Icon className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
              <p className="text-gray-700">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
