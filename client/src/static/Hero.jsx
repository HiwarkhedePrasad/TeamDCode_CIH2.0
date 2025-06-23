import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Play,
  Users,
  Clock,
  Shield,
  ArrowDown,
  CheckCircle,
} from "lucide-react";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);

    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(testimonialInterval);
  }, []);

  const testimonials = [
    {
      text: "AutoScreen.ai helped us reduce our hiring time by 60% while finding better candidates.",
      author: "Sarah Chen",
      role: "VP of People, TechCorp",
      avatar: "SC",
    },
    {
      text: "The AI agents feel like having a dedicated recruitment team working 24/7.",
      author: "Michael Rodriguez",
      role: "HR Director, StartupXYZ",
      avatar: "MR",
    },
    {
      text: "Finally, a recruitment tool that eliminates bias and focuses on real talent.",
      author: "Emma Thompson",
      role: "Talent Acquisition Lead",
      avatar: "ET",
    },
  ];

  const features = [
    { icon: Users, text: "Human-centered AI that augments your team" },
    { icon: Clock, text: "Save 15+ hours per week on screening" },
    { icon: Shield, text: "Eliminate unconscious bias in hiring" },
  ];

  return (
    <section className="relative overflow-hidden min-h-screen bg-[#FFFDF6]">
      {/* Soft gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FAF6E9]/30 via-[#FFFDF6] to-[#FAF6E9]/20 pointer-events-none" />

      {/* Background image with subtle overlay */}
      <img
        src="/bg-homePage.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-5 z-0"
      />

      {/* Gentle floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-3 h-3 bg-[#DDEB9D] rounded-full animate-pulse opacity-40" />
        <div
          className="absolute top-40 right-20 w-4 h-4 bg-[#A0C878] rounded-full animate-bounce opacity-30"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-40 left-20 w-2 h-2 bg-[#FAF6E9] rounded-full animate-pulse opacity-50"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-60 right-10 w-5 h-5 bg-[#DDEB9D] rounded-full animate-bounce opacity-40"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
          <h1
            className={`text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-gray-900 transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <span className="block text-gray-800">Meet your new</span>
            <span className="block bg-gradient-to-r from-[#A0C878] to-[#DDEB9D] bg-clip-text text-transparent font-extrabold">
              AI hiring team
            </span>
            <span className="block text-gray-600 text-3xl md:text-4xl lg:text-5xl font-medium mt-2">
              that gets people
            </span>
          </h1>

          <p
            className={`text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Our AI agents enhance your human judgment to help you
            <span className="text-gray-900 font-semibold">
              {" "}
              screen smarter, hire faster, and build amazing teams.
            </span>
          </p>

          <div
            className={`flex flex-wrap justify-center gap-6 mb-12 transition-all duration-1000 delay-400 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-[#FAF6E9] px-4 py-3 rounded-xl border border-[#DDEB9D] hover:border-[#A0C878] hover:shadow-md transition-all duration-300"
              >
                <feature.icon className="w-5 h-5 text-[#A0C878]" />
                <span className="text-gray-700 font-medium">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 transition-all duration-1000 delay-500 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <button className="group relative px-8 py-4 bg-[#A0C878] text-white font-semibold rounded-xl hover:bg-[#8bb764] transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#A0C878]/25">
              <div className="flex items-center gap-2">
                <span>See it in action</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>

            <button className="group flex items-center gap-3 px-8 py-4 bg-white border-2 border-[#DDEB9D] text-gray-700 font-semibold rounded-xl hover:border-[#A0C878] hover:bg-[#FFFDF6] transition-all duration-300 hover:scale-105">
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span>Watch 2-min demo</span>
            </button>
          </div>

          {/* Testimonials and rest remain unchanged */}
        </div>
      </div>
    </section>
  );
}
