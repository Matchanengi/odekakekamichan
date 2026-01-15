import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { type UserPage } from "../App";

interface UserLandingPageProps {
  onNavigate: (page: UserPage) => void;
}

export function UserLandingPage({ onNavigate }: UserLandingPageProps) {
  void onNavigate; // 未使用エラー対策
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1765614244374-6800042984d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHRyYWRpdGlvbmFsJTIwY3VsdHVyZSUyMGZlc3RpdmFsfGVufDF8fHx8MTc2Njk3ODk2OHww&ixlib=rb-4.1.0&q=80&w=1080",
      alt: "日本の伝統文化",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1764932877848-58a406f53ff3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHNocmluZSUyMGNoZXJyeSUyMGJsb3Nzb21zfGVufDF8fHx8MTc2Njk3ODk2OXww&ixlib=rb-4.1.0&q=80&w=1080",
      alt: "神社と桜",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1706091372393-963a17f481d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMG1vdW50YWluJTIwbGFuZHNjYXBlJTIwbmF0dXJlfGVufDF8fHx8MTc2Njk3ODk2OXww&ixlib=rb-4.1.0&q=80&w=1080",
      alt: "山の風景",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + slides.length) % slides.length,
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Main Content Container */}
        <div className="bg-cyan-400 rounded-[3rem] p-6 sm:p-10">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-10">
            {/* Title Section */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-base sm:text-xl font-bold text-blue-900 mb-4">
                まだ見たことない景色をあなたに
              </h2>
              <div className="text-sm sm:text-base text-blue-800 space-y-1">
                <p>
                  あなたは香美市の全の風景を見たことがありますか？
                </p>
                <p>
                  まだ見たことのない景色を見に行きましょう！
                </p>
              </div>
            </div>

            {/* Slideshow Section */}
            <div className="relative overflow-hidden">
              {/* Slider Container */}
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`,
                }}
              >
                {slides.map((slide) => (
                  <div
                    key={slide.id}
                    className="min-w-full px-2"
                  >
                    <div className="aspect-[16/9] sm:aspect-[21/9] overflow-hidden rounded-lg">
                      <img
                        src={slide.image}
                        alt={slide.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg transition-all"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-700" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg transition-all"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-700" />
              </button>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentSlide === index
                        ? "bg-cyan-700 w-8"
                        : "bg-cyan-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}