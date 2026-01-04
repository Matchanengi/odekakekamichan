import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Spot {
  id: number;
  name: string;
  kana: string;
  description: string;
  images: string[];
  details: {
    hours: string;
    closedDays: string;
    parking: string;
    price: string;
    contact: string;
  };
}

type SortOrder = 'asc' | 'desc';

export function SightseeingPage() {
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const spots: Spot[] = [
    {
      id: 1,
      name: '龍河洞',
      kana: 'りゅうがどう',
      description: '国指定天然記念物・史跡の石灰石の鍾乳洞。山頂付近に湧まった雨水が、１億７５００万年の年月を経て石灰岩を浸食し削り上げた神秘の洞穴は全長約４kmに及ぶ。約１kmの探勝コースでは天降石、千枚岩などの石柱、石筍を見ることができその造形は見事な大自然の芸術。また弥生人の穴居遺跡もあり、彼らが置き忘れた土器が石灰岩にまかれた神の壺は古代のロマンを誘う。その他にもナビゲーターと一緒に貸う暗な洞穴へヘッドランプの灯りで進む、冒険コースも併設されており、あなたもインディージョ���ンズの気分が味わえる。是非挑戦して下さい。',
      images: [
        'https://images.unsplash.com/photo-1764250406095-be6b157a2fd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXZlJTIwc3RhbGFjdGl0ZXMlMjBsaW1lc3RvbmV8ZW58MXx8fHwxNjcxMTA5NjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1667333112033-85256c4317ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXZpbmclMjBleHBsb3JlciUyMHVuZGVyZ3JvdW5kfGVufDF8fHx8MTc2NzExMDk2NHww&ixlib=rb-4.1.0&q=80&w=1080'
      ],
      details: {
        hours: '[3月～11月] 8：30～17：00\n[12月～2月] 8：30～16：30',
        closedDays: '年中無休',
        parking: '600台',
        price: '大人/¥1,200　中学生/¥700　小学生/¥550\n※冒険コースは観光コース料金の1,000円増（完全予約制）\nヘッドランプ・ヘルメットは無料貸出。レインウェア・靴レンタル料1,000円',
        contact: 'TEL：0887-53-2144\nFAX：0887-53-2145'
      }
    },
    {
      id: 2,
      name: '轟の滝',
      kana: 'とどろのたき',
      description: '落差82メートル、青く輝く3段の滝壺には玉織姫にまつわる平家伝説があり、桜、新緑、紅葉と四季を通した景勝地として賑わいます。歌人・吉井勇も訪れた滝で、県指定文化財（名勝・天然記念物）に指定されています。「日本の滝100選」にも選ばれた香美市のシンボルとも言うべき滝です。周辺には遊歩道が整備されており、マイナスイオンを浴びながら散策が楽しめます。春には桜と滝のコントラストが美しく、秋には紅葉が滝を彩ります。',
      images: [
        'https://images.unsplash.com/photo-1760638135404-308b3a556cc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlcmZhbGwlMjBncmVlbiUyMGZvcmVzdHxlbnwxfHx8fDE3NjcxMTA5NjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1629677978337-1c88feb64c83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlcmZhbGwlMjByYWluYm93JTIwbWlzdHxlbnwxfHx8fDE3NjcxMTA5NjV8MA&ixlib=rb-4.1.0&q=80&w=1080'
      ],
      details: {
        hours: '24時間（見学自由）',
        closedDays: 'なし',
        parking: '20台',
        price: '無料',
        contact: 'TEL：0887-57-9007（香美市観光協会）'
      }
    }
  ];

  const sortedSpots = [...spots].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.kana.localeCompare(b.kana, 'ja');
    } else {
      return b.kana.localeCompare(a.kana, 'ja');
    }
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="bg-cyan-400 rounded-3xl p-4 sm:p-8 mx-4 my-6">
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        <h2 className="text-2xl sm:text-3xl mb-4 text-blue-600">観光地</h2>
        
        <p className="text-blue-600 mb-2">観光地にある観光地を紹介します</p>
        <p className="text-blue-600 mb-6">現在紹介されている観光地は24ヶ所です。</p>

        {/* Sort Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleSortOrder}
            className="bg-cyan-400 text-white px-6 py-3 rounded-lg hover:bg-cyan-500 transition-colors flex items-center gap-2"
          >
            <ArrowUpDown size={20} />
            あいうえお順（{sortOrder === 'asc' ? '昇順' : '降順'}）
          </button>
        </div>

        {/* Spots List */}
        <div className="space-y-8">
          {sortedSpots.map((spot, index) => (
            <div key={spot.id} className="border-2 border-gray-300 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center">
                <div className="bg-cyan-400 text-white px-8 py-4 text-2xl">
                  No.{index + 1}
                </div>
                <div className="flex-1 px-6 py-4 text-xl border-l-2 border-gray-300">
                  {spot.name}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 bg-white">
                {/* Description */}
                <p className="text-blue-600 mb-6 leading-relaxed whitespace-pre-line">
                  {spot.description}
                </p>

                {/* Images */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {spot.images.map((image, imgIndex) => (
                    <div key={imgIndex} className="aspect-video overflow-hidden rounded-lg">
                      <ImageWithFallback
                        src={image}
                        alt={`${spot.name} ${imgIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* Details Table */}
                <div className="border-2 border-cyan-400 rounded-lg overflow-hidden">
                  {/* Hours */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 border-b-2 border-cyan-400">
                    <div className="bg-cyan-400 text-white px-6 py-4 text-center border-b-2 sm:border-b-0 sm:border-r-2 border-cyan-400">
                      営業時間
                    </div>
                    <div className="col-span-2 px-6 py-4 bg-blue-50 whitespace-pre-line">
                      {spot.details.hours}
                    </div>
                  </div>

                  {/* Closed Days */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 border-b-2 border-cyan-400">
                    <div className="bg-cyan-400 text-white px-6 py-4 text-center border-b-2 sm:border-b-0 sm:border-r-2 border-cyan-400">
                      定休日
                    </div>
                    <div className="col-span-2 px-6 py-4 bg-blue-50">
                      {spot.details.closedDays}
                    </div>
                  </div>

                  {/* Parking */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 border-b-2 border-cyan-400">
                    <div className="bg-cyan-400 text-white px-6 py-4 text-center border-b-2 sm:border-b-0 sm:border-r-2 border-cyan-400">
                      駐車場
                    </div>
                    <div className="col-span-2 px-6 py-4 bg-blue-50">
                      {spot.details.parking}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 border-b-2 border-cyan-400">
                    <div className="bg-cyan-400 text-white px-6 py-4 text-center border-b-2 sm:border-b-0 sm:border-r-2 border-cyan-400">
                      料金
                    </div>
                    <div className="col-span-2 px-6 py-4 bg-blue-50 whitespace-pre-line">
                      {spot.details.price}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-3">
                    <div className="bg-cyan-400 text-white px-6 py-4 text-center border-b-2 sm:border-b-0 sm:border-r-2 border-cyan-400">
                      お問い合わせ
                    </div>
                    <div className="col-span-2 px-6 py-4 bg-blue-50 whitespace-pre-line">
                      {spot.details.contact}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}