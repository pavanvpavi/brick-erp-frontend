export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="relative w-10 h-10">
        <div
          className="absolute inset-0 rounded-full border-4
          border-amber-100"
        />
        <div
          className="absolute inset-0 rounded-full border-4
          border-amber-600 border-t-transparent animate-spin"
        />
      </div>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

export function InlineSpinner() {
  return (
    <div
      className="w-4 h-4 rounded-full border-2 border-amber-600
      border-t-transparent animate-spin inline-block"
    />
  );
}

export function PageLoadingSpinner() {
  return (
    <div
      className="fixed inset-0 bg-white bg-opacity-80 flex items-center
      justify-center z-50"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-amber-100" />
          <div
            className="absolute inset-0 rounded-full border-4
            border-amber-600 border-t-transparent animate-spin"
          />
        </div>
        <p className="text-sm text-gray-600 font-medium">Please wait...</p>
      </div>
    </div>
  );
}
