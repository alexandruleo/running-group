'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-white/20">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
          Oops!
        </h2>
        <p className="text-gray-600 mb-6 text-lg">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-8 py-4 rounded-xl hover:scale-105 transition-all shadow-lg font-bold"
        >
          🔄 Try Again
        </button>
      </div>
    </div>
  );
}
