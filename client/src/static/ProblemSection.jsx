export default function ProblemSection() {
  const problems = [
    {
      title: "Inefficient Recruitment",
      description:
        "Traditional recruitment processes are time-consuming and often fail to identify top talent efficiently.",
      iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      title: "Biased Hiring",
      description:
        "Human bias can lead to unfair hiring decisions, overlooking qualified candidates from diverse backgrounds.",
      iconPath:
        "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    },
    {
      title: "Manual Workload",
      description:
        "Recruiters spend countless hours on repetitive tasks like screening resumes and scheduling interviews.",
      iconPath:
        "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-sm text-gray-600 font-medium mb-4">
            The Problem
          </h2>
          <h3 className="text-4xl font-bold text-gray-900 mb-8">
            Inefficient and Biased Recruitment
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map(({ title, description, iconPath }, i) => (
            <div className="text-center" key={i}>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={iconPath}
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                {title}
              </h4>
              <p className="text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
