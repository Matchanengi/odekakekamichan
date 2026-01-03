import { useState } from "react";
import { ArrowDown } from "lucide-react";

interface Destination {
  id: number;
  name: string;
}

export function ItineraryPage() {
  const [destinations, setDestinations] = useState<Destination[]>([
    { id: 1, name: '吉井勇記念館' },
    { id: 2, name: '轟の滝' },
    { id: 3, name: '西熊渓谷' },
    { id: 4, name: '大荒の滝' }
  ]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newDestinations = [...destinations];
    [newDestinations[index - 1], newDestinations[index]] = 
    [newDestinations[index], newDestinations[index - 1]];
    setDestinations(newDestinations);
  };

  const moveDown = (index: number) => {
    if (index === destinations.length - 1) return;
    const newDestinations = [...destinations];
    [newDestinations[index], newDestinations[index + 1]] = 
    [newDestinations[index + 1], newDestinations[index]];
    setDestinations(newDestinations);
  };

  return (
    <div className="bg-cyan-400 rounded-3xl p-4 sm:p-8 mx-4 my-6">
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        <h2 className="text-2xl sm:text-3xl mb-4 text-blue-600">旅程表</h2>
        
        <p className="text-blue-600 mb-8">旅行プランで選定された場所をもとに作成しています。</p>

        {/* Itinerary List */}
        <div className="space-y-6">
          {destinations.map((dest, index) => (
            <div key={dest.id}>
              {/* Destination Item */}
              <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                {/* Destination Name */}
                <div className="flex-1 min-w-[250px] border-2 border-black rounded-lg px-6 py-4 bg-white text-center">
                  {dest.name}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  {index > 0 && (
                    <button
                      onClick={() => moveUp(index)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                    >
                      前にする
                    </button>
                  )}
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

              {/* Arrow Between Items */}
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
