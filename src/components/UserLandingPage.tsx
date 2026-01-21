import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // 矢印アイコンのインポート

import { type UserPage } from "../App";

/**
 * UserLandingPageコンポーネントのプロップス定義
 */
interface UserLandingPageProps {
  // ページ遷移を制御するための関数
  onNavigate: (page: UserPage) => void;
}

/**
 * ユーザー向けランディングページコンポーネント
 * * 主な機能:
 * 1. キャッチコピーの表示
 * 2. 画像スライドショー（自動再生機能付き）
 */
export function UserLandingPage({ onNavigate }: UserLandingPageProps) {
  // 実装上、引数を受け取っているが関数内で使用していない場合の警告を回避
  void onNavigate; 

  // --- 状態管理 (State) ---
  // 現在表示しているスライドの番号（0, 1, 2...）を管理
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

  // --- 自動再生機能 (Side Effect) ---
  useEffect(() => {
    // 3秒（3000ms）ごとに次のスライドへ進むタイマーを設定
    const interval = setInterval(() => {
      // (現在の番号 + 1) を スライド数で割った余りを計算することで 0→1→2→0... とループさせる
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    // コンポーネントが破棄（アンマウント）される時にタイマーを解除（メモリリーク防止）
    return () => clearInterval(interval);
  }, [slides.length]);

  // --- 操作用関数 ---
  // 次のスライドへ
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // 前のスライドへ
  const prevSlide = () => {
    setCurrentSlide(
      // -1したときにマイナスにならないよう、スライド数を足してから余りを計算する
      (prev) => (prev - 1 + slides.length) % slides.length,
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* 外側の水色枠 (大きな角丸) */}
        <div className="bg-cyan-400 rounded-[3rem] p-6 sm:p-10">
          
          {/* 内側の白枠 (コンテンツエリア) */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-10">
            
            {/* テキストセクション */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-base sm:text-xl font-bold text-blue-900 mb-4">
                まだ見たことない景色をあなたに
              </h2>
              <div className="text-sm sm:text-base text-blue-800 space-y-1">
                <p>あなたは香美市の全の風景を見たことがありますか？</p>
                <p>まだ見たことのない景色を見に行きましょう！</p>
              </div>
            </div>

            {/* スライドショーセクション */}
            <div className="relative overflow-hidden">
              {/* スライダー本体：現在の index * 100% 分だけ左にずらすことでスライドを実現 */}
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`,
                }}
              >
                {slides.map((slide) => (
                  <div key={slide.id} className="min-w-full px-2">
                    {/* 画像のアスペクト比：スマホは 16:9、PC(sm以上)は 21:9 */}
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

              {/* 矢印ナビゲーション：左 */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg transition-all"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-700" />
              </button>

              {/* 矢印ナビゲーション：右 */}
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg transition-all"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-700" />
              </button>

              {/* 下部のドットインジケーター */}
              <div className="flex justify-center gap-2 mt-6">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      // 現在のスライドのみ横長(w-8)にして色を強調する
                      currentSlide === index
                        ? "bg-cyan-700 w-8"
                        : "bg-cyan-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            {/* スライドショーここまで */}

          </div>
        </div>
      </div>
    </div>
  );
}