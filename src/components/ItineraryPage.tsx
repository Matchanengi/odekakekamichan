import { useState } from "react";
import { ArrowDown } from "lucide-react";

/**
 * 目的地のデータ型定義
 */
interface Destination {
  id: number;
  name: string;
}

/**
 * 旅程表（Itinerary）ページコンポーネント
 * * 【重要】このファイルは現在、他のメイン機能（予約や観光マップ）から
 * 直接参照・利用されていない可能性が高い「プロトタイプ」または「未使用」のコンポーネントです。
 * 旅行プランに基づいた並び替え機能のUIサンプルとして実装されています。
 */
export function ItineraryPage() {
  /**
   * 旅程データの初期値（現在はハードコードされたサンプルデータ）
   * 実際の運用時は API や親コンポーネントから取得する形になります。
   */
  const [destinations, setDestinations] = useState<Destination[]>([
    { id: 1, name: '吉井勇記念館' },
    { id: 2, name: '轟の滝' },
    { id: 3, name: '西熊渓谷' },
    { id: 4, name: '大荒の滝' }
  ]);

  /**
   * 指定されたインデックスの要素を一つ「前（上）」に移動させる
   * @param index 対象の配列添字
   */
  const moveUp = (index: number) => {
    // 先頭の場合はそれ以上上に行けないため処理しない
    if (index === 0) return;
    
    const newDestinations = [...destinations];
    // 分割代入（ES6）を用いた要素の入れ替え
    [newDestinations[index - 1], newDestinations[index]] = 
    [newDestinations[index], newDestinations[index - 1]];
    
    setDestinations(newDestinations);
  };

  /**
   * 指定されたインデックスの要素を一つ「後（下）」に移動させる
   * @param index 対象の配列添字
   */
  const moveDown = (index: number) => {
    // 末尾の場合はそれ以上下に行けないため処理しない
    if (index === destinations.length - 1) return;
    
    const newDestinations = [...destinations];
    // 分割代入を用いた要素の入れ替え
    [newDestinations[index], newDestinations[index + 1]] = 
    [newDestinations[index + 1], newDestinations[index]];
    
    setDestinations(newDestinations);
  };

  return (
    <div className="bg-cyan-400 rounded-3xl p-4 sm:p-8 mx-4 my-6">
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        {/* ヘッダーセクション */}
        <h2 className="text-2xl sm:text-3xl mb-4 text-blue-600">旅程表</h2>
        <p className="text-blue-600 mb-8">旅行プランで選定された場所をもとに作成しています。</p>

        {/* 旅程リスト表示エリア */}
        <div className="space-y-6">
          {destinations.map((dest, index) => (
            <div key={dest.id}>
              {/* 目的地カード：スマホ等でも崩れないよう flex-wrap を使用 */}
              <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                
                {/* 目的地名：中央揃えの白いボックス */}
                <div className="flex-1 min-w-[250px] border-2 border-black rounded-lg px-6 py-4 bg-white text-center">
                  {dest.name}
                </div>
                
                {/* 操作ボタン：順序を入れ替えるアクション */}
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  {/* 一番上でなければ「前にする」ボタンを表示 */}
                  {index > 0 && (
                    <button
                      onClick={() => moveUp(index)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                    >
                      前にする
                    </button>
                  )}
                  {/* 一番下でなければ「後にする」ボタンを表示 */}
                  {index < destinations.length - 1 && (
                    <button
                      onClick={() => moveDown(index)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                    >
                      後にする
                    </button>
                  )}
                </div>
              </div>

              {/* 目的地間の矢印アイコン（最後の要素の後には表示しない） */}
              {index < destinations.length - 1 && (
                <div className="flex justify-center my-4">
                  <ArrowDown className="text-cyan-400" size={48} strokeWidth={3} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}