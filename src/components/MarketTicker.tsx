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
    <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2 flex items-center gap-2">
      <div className="flex items-center gap-1 text-sm text-zinc-500 shrink-0">
        <span>Top Securities</span>
        <i className="ri-arrow-down-s-line text-base" />
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
            <span className="flex items-center gap-0.5">
              <i className={item.color === "red" ? "ri-arrow-down-s-fill" : "ri-arrow-up-s-fill"} />
              {Math.abs(item.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center shrink-0 ml-auto">
        <button className="text-zinc-400 hover:text-zinc-900 transition-colors">
          <i className="ri-arrow-left-s-line text-lg" />
        </button>
        <button className="text-zinc-400 hover:text-zinc-900 transition-colors">
          <i className="ri-arrow-right-s-line text-lg" />
        </button>
      </div>
    </div>
  );
}
