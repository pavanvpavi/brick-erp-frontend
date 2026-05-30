export default function EmptyState({
  title = "No data found",
  message = "Nothing to show here yet.",
  icon = "📭",
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-gray-700 font-semibold text-lg mb-1">{title}</h3>
      <p className="text-gray-400 text-sm max-w-xs">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
