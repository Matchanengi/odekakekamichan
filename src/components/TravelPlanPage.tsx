import { useState } from "react";
import { ChevronDown } from "lucide-react";
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
    <div className="bg-cyan-400 rounded-3xl p-3 sm:p-8 mx-2 sm:mx-4 my-4 sm:my-6">
      <div className="bg-white rounded-3xl p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl mb-2">旅行プラン検索</h2>
        
        <p className="text-sm sm:text-base mb-6">あなたにぴったりな旅行プランを作成します</p>

        {/* Search Section */}
        <div className="mb-6">
          <div className="mb-4">
            <div className="bg-cyan-400 text-white px-4 py-2 rounded-t-lg inline-block text-sm sm:text-base">
              目的地
            </div>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="吉井勇記念館"
              className="w-full border-2 border-black rounded-lg px-4 py-3 text-base"
            />
          </div>
          
          {!showResults ? (
            <button 
              onClick={handleSearch}
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors w-full sm:w-auto text-base"
            >
              検索する
            </button>
          ) : (
            <button 
              onClick={handleReset}
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors w-full sm:w-auto text-base"
            >
              再検索
            </button>
          )}
        </div>

        {/* Results Section */}
        {showResults && (
          <>
            {/* Arrow */}
            <div className="flex justify-center mb-6">
              <ChevronDown className="text-cyan-400" size={48} strokeWidth={2} />
            </div>

            {/* Destination Cards */}
            {destinations.map((dest, index) => (
              <div key={dest.id} className="mb-6">
                {/* Header */}
                <div className="flex items-center mb-3">
                  <div className="bg-cyan-400 text-white px-4 py-2 rounded text-sm sm:text-base">
                    候補地{index + 1}
                  </div>
                  <div className="ml-3 text-base sm:text-lg">
                    {dest.name}
                  </div>
                </div>
                
                {/* Content */}
                <div className="bg-white">
                  <p className="text-sm leading-relaxed mb-4">{dest.description}</p>
                  
                  {/* Images */}
                  <div className={`grid gap-3 mb-4 ${dest.images.length === 2 ? 'grid-cols-1' : 'grid-cols-1'}`}>
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
                    <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base">
                      この場所を追加する
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom Action Buttons */}
            <div className="flex flex-col gap-3 mt-6">
              <button className="bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 transition-colors w-full text-base">
                MAPで経路を確認する
              </button>
              <button className="bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 transition-colors w-full text-base" onClick={onShowItinerary}>
                旅程表を確認する
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}