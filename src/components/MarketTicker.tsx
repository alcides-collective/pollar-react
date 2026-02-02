const marketData = [
  { name: "S&P 500", value: "6,939.03", change: -0.43, color: "red" },
  { name: "Nasdaq", value: "23,461.82", change: -0.94, color: "red" },
  { name: "B500", value: "2,504.09", change: -0.48, color: "red" },
  { name: "US 10 Yr", value: "4.22", change: 0.00, color: "green" },
  { name: "Crude Oil", value: "62.12", change: -4.69, color: "red" },
  { name: "FTSE 100", value: "8,591.23", change: 0.32, color: "green" },
  { name: "DAX", value: "22,456.12", change: -0.18, color: "red" },
  { name: "Gold", value: "2,847.50", change: 1.24, color: "green" },
];

export function MarketTicker() {
  return (
    <div className="bg-zinc-50 border-b border-zinc-200">
      <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-zinc-500 shrink-0">
          <span>Top Securities</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {marketData.map((item) => (
            <div
              key={item.name}
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm whitespace-nowrap ${
                item.color === "red"
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              <span className="text-zinc-700">{item.name}</span>
              <span className="font-medium">{item.value}</span>
              <span className="flex items-center">
                {item.color === "red" ? "▼" : "▲"}
                {Math.abs(item.change).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button className="text-zinc-400 hover:text-zinc-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="text-zinc-400 hover:text-zinc-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
