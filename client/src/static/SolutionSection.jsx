export default function SolutionSection() {
  const agents = [
    {
      name: "Juno",
      desc: "AI agent for initial candidate screening and qualification.",
      color: "from-pink-200 to-pink-300",
    },
    {
      name: "Parsey",
      desc: "AI agent for parsing resumes and extracting key information.",
      color: "from-teal-600 to-teal-700",
    },
    {
      name: "Matcha",
      desc: "AI agent for matching candidates to specific job requirements.",
      color: "from-orange-200 to-orange-300",
    },
    {
      name: "Shortlister",
      desc: "AI agent for shortlisting candidates based on skills and experience.",
      color: "from-green-200 to-green-300",
    },
    {
      name: "Schedula",
      desc: "AI agent for automating interview scheduling and reminders.",
      color: "from-gray-200 to-gray-300",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-sm text-gray-600 font-medium mb-4">
            Our Solution
          </h2>
          <h3 className="text-4xl font-bold text-gray-900 mb-8">
            AI-Driven Recruitment Automation
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {agents.map(({ name, desc, color }, i) => (
            <div className="text-center" key={i}>
              <div
                className={`w-24 h-32 bg-gradient-to-b ${color} rounded-lg mx-auto mb-4 flex items-end justify-center pb-2`}
              >
                <div className="w-16 h-16 bg-white rounded-full"></div>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                {name}
              </h4>
              <p className="text-xs text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
