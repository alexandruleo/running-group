import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-white/20">
        <div className="text-7xl mb-4">🏃💨</div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
          404 - Lost!
        </h2>
        <p className="text-gray-600 mb-6 text-lg">
          Looks like you've run off the trail. Let's get you back on track.
        </p>
        <Link
          href="/"
          className="inline-block bg-gradient-to-r from-purple-500 to-blue-600 text-white px-8 py-4 rounded-xl hover:scale-105 transition-all shadow-lg font-bold"
        >
          🏠 Go Home
        </Link>
      </div>
    </div>
  );
}
