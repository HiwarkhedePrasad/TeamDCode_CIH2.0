export default function ImpactSection() {
  const stats = [
    { label: "Faster Hiring", value: "50%", color: "purple" },
    { label: "Reduced Manual Work", value: "75%", color: "blue" },
    { label: "Eliminated Bias", value: "100%", color: "green" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-sm text-gray-600 font-medium mb-8">Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map(({ label, value, color }, i) => (
            <div key={i} className={`bg-${color}-50 p-8 rounded-lg`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {label}
              </h3>
              <div className={`text-4xl font-bold text-${color}-600 mb-2`}>
                {value}
              </div>
              <p className={`text-${color}-600`}>-{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
