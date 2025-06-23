import { Users, FileText, Target, CheckCircle, Calendar } from "lucide-react";

export default function SolutionSection() {
  const agents = [
    {
      name: "Juno",
      desc: "AI agent for initial candidate screening and qualification with advanced natural language processing.",
      color: "from-[#A0C878] to-[#DDEB9D]",
      icon: Users,
    },
    {
      name: "Parsey",
      desc: "AI agent for parsing resumes and extracting key information with 99% accuracy across multiple formats.",
      color: "from-[#DDEB9D] to-[#FAF6E9]",
      icon: FileText,
    },
    {
      name: "Matcha",
      desc: "AI agent for matching candidates to specific job requirements using advanced compatibility algorithms.",
      color: "from-[#A0C878] to-[#DDEB9D]",
      icon: Target,
    },
    {
      name: "Shortlister",
      desc: "AI agent for shortlisting candidates based on skills, experience, and cultural fit assessment.",
      color: "from-[#FAF6E9] to-[#DDEB9D]",
      icon: CheckCircle,
    },
    {
      name: "Schedula",
      desc: "AI agent for automating interview scheduling, reminders, and calendar coordination across time zones.",
      color: "from-[#FFFDF6] to-[#FAF6E9]",
      icon: Calendar,
    },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-[#FFFDF6] via-[#FAF6E9] to-[#DDEB9D]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Our Solution
          </h2>
          <h3 className="text-2xl font-semibold text-[#A0C878] mb-4">
            AI-Driven Recruitment Automation
          </h3>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Meet our specialized AI agents, each designed to handle specific
            aspects of the recruitment process with unmatched efficiency and
            accuracy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map(({ name, desc, color, icon: Icon }, index) => (
            <div
              key={index}
              className="bg-white/50 backdrop-blur-sm rounded-xl p-6 hover:bg-white/70 transition-all duration-300 transform hover:scale-105 border border-[#DDEB9D]"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center mb-4`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{name}</h3>
              <p className="text-gray-700 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
