export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-blue-600">🚌 おでかけかみちゃん</h1>
          <p className="text-gray-600">香美市営バス予約システム</p>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect Bus
          </h2>
          <p className="text-xl text-gray-600">
            Search from thousands of routes across the country
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From
              </label>
              <input
                type="text"
                placeholder="Enter city"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <input
                type="text"
                placeholder="Enter city"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200">
            Search Buses 🔍
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-4xl font-bold text-blue-600">500+</div>
            <div className="text-gray-600 mt-2">Bus Operators</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-4xl font-bold text-blue-600">1000+</div>
            <div className="text-gray-600 mt-2">Routes Available</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-4xl font-bold text-blue-600">50K+</div>
            <div className="text-gray-600 mt-2">Happy Travelers</div>
          </div>
        </div>
      </main>
    </div>
  );
}