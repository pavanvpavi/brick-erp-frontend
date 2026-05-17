export default function DateRangeFilter({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onGenerate,
  loading,
  buttonLabel = "Generate Report",
}) {
  const setThisMonth = () => {
    const now = new Date();
    onStartChange(
      new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0],
    );
    onEndChange(now.toISOString().split("T")[0]);
  };

  const setLastMonth = () => {
    const now = new Date();
    onStartChange(
      new Date(now.getFullYear(), now.getMonth() - 1, 1)
        .toISOString()
        .split("T")[0],
    );
    onEndChange(
      new Date(now.getFullYear(), now.getMonth(), 0)
        .toISOString()
        .split("T")[0],
    );
  };

  const setThisQuarter = () => {
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3);
    onStartChange(
      new Date(now.getFullYear(), q * 3, 1).toISOString().split("T")[0],
    );
    onEndChange(now.toISOString().split("T")[0]);
  };

  const setThisYear = () => {
    const now = new Date();
    onStartChange(
      new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0],
    );
    onEndChange(now.toISOString().split("T")[0]);
  };

  return (
    <div className="card mb-6">
      <div className="flex gap-4 items-end flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            className="input-field"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            className="input-field"
            value={endDate}
            onChange={(e) => onEndChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            ["This Month", setThisMonth],
            ["Last Month", setLastMonth],
            ["This Quarter", setThisQuarter],
            ["This Year", setThisYear],
          ].map(([label, fn]) => (
            <button
              key={label}
              type="button"
              onClick={fn}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-gray-100
                text-gray-600 hover:bg-amber-100 hover:text-amber-700 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
        <button onClick={onGenerate} disabled={loading} className="btn-primary">
          {loading ? "Loading..." : buttonLabel}
        </button>
      </div>
    </div>
  );
}
