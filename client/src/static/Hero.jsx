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
    <section className="relative overflow-hidden min-h-screen bg-white">
      {/* Soft gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 pointer-events-none" />

      {/* Background image with subtle overlay */}
      <img
        src="/bg-homePage.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-5 z-0"
      />

      {/* Gentle floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-3 h-3 bg-blue-100 rounded-full animate-pulse opacity-40" />
        <div
          className="absolute top-40 right-20 w-4 h-4 bg-purple-100 rounded-full animate-bounce opacity-30"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-40 left-20 w-2 h-2 bg-pink-100 rounded-full animate-pulse opacity-50"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-60 right-10 w-5 h-5 bg-indigo-50 rounded-full animate-bounce opacity-40"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
          {/* Trust badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-gray-700 text-sm font-medium mb-8 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          ></div>

          {/* Main heading with better visual hierarchy */}
          <h1
            className={`text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-gray-900 transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <span className="block text-gray-800">Meet your new</span>
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-extrabold">
              AI hiring team
            </span>
            <span className="block text-gray-600 text-3xl md:text-4xl lg:text-5xl font-medium mt-2">
              that gets people
            </span>
          </h1>

          {/* Simplified subtitle */}
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

          {/* Feature highlights */}
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
                className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300"
              >
                <feature.icon className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 font-medium">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 transition-all duration-1000 delay-500 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <button className="group relative px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-600/25">
              <div className="flex items-center gap-2">
                <span>See it in action</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>

            <button className="group flex items-center gap-3 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 hover:scale-105">
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span>Watch 2-min demo</span>
            </button>
          </div>

          {/* Social proof - rotating testimonials */}
          <div
            className={`max-w-2xl mx-auto transition-all duration-1000 delay-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative h-24 overflow-hidden">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-1000 ${
                    index === currentTestimonial
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <blockquote className="text-lg text-gray-600 italic mb-4">
                    "{testimonial.text}"
                  </blockquote>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {testimonial.avatar}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? "bg-blue-600 w-6"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Agents preview - floating cards */}
      <div className="absolute top-1/4 left-8 hidden xl:block">
        <div className="space-y-4">
          {[
            {
              name: "Juno",
              status: "Screening candidates",
              color: "bg-green-500",
            },
            {
              name: "Parsey",
              status: "Analyzing resumes",
              color: "bg-blue-500",
            },
          ].map((agent, index) => (
            <div
              key={agent.name}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 min-w-[200px] animate-pulse hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: `${index * 0.5}s` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 ${agent.color} rounded-full animate-pulse`}
                />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {agent.name}
                  </div>
                  <div className="text-xs text-gray-500">{agent.status}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-1/3 right-8 hidden xl:block">
        <div className="space-y-4">
          {[
            {
              name: "Matcha",
              status: "Matching skills",
              color: "bg-purple-500",
            },
            {
              name: "Shortlister",
              status: "Ranking candidates",
              color: "bg-orange-500",
            },
          ].map((agent, index) => (
            <div
              key={agent.name}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 min-w-[200px] animate-pulse hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: `${(index + 2) * 0.5}s` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 ${agent.color} rounded-full animate-pulse`}
                />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {agent.name}
                  </div>
                  <div className="text-xs text-gray-500">{agent.status}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce transition-all duration-1000 delay-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-gray-400">Discover more</span>
          <ArrowDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </section>
  );
}
