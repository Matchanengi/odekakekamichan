import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { ImageWithFallback } from './figma/ImageWithFallback';

interface TravelPlanPageProps {
  onShowItinerary?: () => void;
}

export function TravelPlanPage({ onShowItinerary }: TravelPlanPageProps) {
  const [destination, setDestination] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleSearch = () => {
    if (destination.trim()) {
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setDestination('');
    setShowResults(false);
  };

  const destinations = [
    {
      id: 1,
      name: '轟の滝',
      description: '落差82メートル、青く輝く3段の滝壺には玉織姫にまつわる平家伝説があり、桜、新緑、紅葉と四季を通した景勝地として賑わいます。歌人・吉井勇も訪れた滝で、県指定文化財（名勝・天然記念物）に指定されています。「日本の滝100選」にも選ばれた香美市のシンボルとも言うべき滝です。',
      images: [
        'https://images.unsplash.com/photo-1742744410671-9b59a50efd31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlcmZhbGwlMjBmb3Jlc3QlMjBqYXBhbnxlbnwxfHx8fDE3NjcxMTAxOTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1706810693459-25f649381663?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMHN0cmVhbSUyMHdhdGVyfGVufDF8fHx8MTc2NzAxODg4Mnww&ixlib=rb-4.1.0&q=80&w=1080'
      ]
    },
    {
      id: 2,
      name: '西熊渓谷',
      description: '土佐生川上流にあり、素晴らしい渓谷美を誇る西熊渓谷は、登山者で賑わう三嶺や白髪山への入り口でもあります。秋の紅葉が特に美しく、紅葉の秋、雪化粧まもなく3たどういった四季それぞれの美しい姿を見せてくれます。',
      images: [
        'https://images.unsplash.com/photo-1698666501734-b084e72616d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YWxsZXklMjBhdXR1bW4lMjBsZWF2ZXN8ZW58MXx8fHwxNzY3MTEwMTkzfDA&ixlib=rb-4.1.0&q=80&w=1080'
      ]
    },
    {
      id: 3,
      name: '大荒の滝',
      description: '落差40mの滝。豊かな滝から移り続けんだ三色の青が織り成す香美市最も美しい、周囲の山岩一面が苔むした美しさとから この名がついたといわれている。深緑から紅葉へと移りゆく自然の自然美を堪能できる。',
      images: [
        'https://images.unsplash.com/photo-1633541672712-f22f14fe683a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlJTIwd2F0ZXJmYWxsJTIwY2F2ZXxlbnwxfHx8fDE3NjcxMTAxOTN8MA&ixlib=rb-4.1.0&q=80&w=1080'
      ]
    }
  ];

  return (
    <div className="bg-cyan-400 rounded-3xl p-4 sm:p-8 mx-4 my-6">
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        <h2 className="text-2xl sm:text-3xl mb-4 text-blue-600">旅行プラン</h2>
        
        <p className="text-blue-600 mb-8">あなたに合った旅行プランを作成します</p>

        {/* Search Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-stretch flex-1 min-w-[300px]">
              <div className="bg-cyan-400 text-white px-6 py-3 rounded-l-lg flex items-center">
                目的地
              </div>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="例:古井勇記念館"
                className="flex-1 border-2 border-l-0 border-black rounded-r-lg px-4 py-2"
              />
            </div>
            
            {!showResults ? (
              <button 
                onClick={handleSearch}
                className="bg-green-600 text-white px-12 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                検索する
              </button>
            ) : (
              <button 
                onClick={handleReset}
                className="bg-green-600 text-white px-12 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                再検索
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <>
            {/* Arrow */}
            <div className="flex justify-center mb-8">
              <ArrowDown className="text-cyan-400" size={60} strokeWidth={3} />
            </div>

            {/* Destination Cards */}
            {destinations.map((dest, index) => (
              <div key={dest.id} className="mb-8">
                <div className="border-2 border-black rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center bg-white">
                    <div className="bg-cyan-400 text-white px-6 py-3">
                      候補地{index + 1}
                    </div>
                    <div className="flex-1 px-4 py-3 border-l-2 border-black">
                      {dest.name}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 bg-white">
                    <p className="text-sm mb-4 leading-relaxed">{dest.description}</p>
                    
                    {/* Images */}
                    <div className={`grid gap-4 mb-4 ${dest.images.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {dest.images.map((img, imgIndex) => (
                        <div key={imgIndex} className="aspect-video overflow-hidden rounded-lg">
                          <ImageWithFallback
                            src={img}
                            alt={`${dest.name} ${imgIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    
                    {/* Add Button */}
                    <div className="flex justify-end">
                      <button className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        この場所を追加する
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom Action Buttons */}
            <div className="flex gap-4 flex-wrap justify-center mt-8">
              <button className="bg-green-600 text-white px-12 py-4 rounded-lg hover:bg-green-700 transition-colors">
                MAPで経路を確認する
              </button>
              <button className="bg-green-600 text-white px-12 py-4 rounded-lg hover:bg-green-700 transition-colors" onClick={onShowItinerary}>
                旅程表を確認する
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}