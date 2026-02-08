import Link from 'next/link';
import { Runner } from '@/types/database';

interface RunnerCardProps {
  runner: Runner;
}

export function RunnerCard({ runner }: RunnerCardProps) {
  return (
    <Link href={`/runners/${runner.id}`}>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-5 hover:shadow-2xl hover:scale-105 transition-all border border-white/20">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg ring-2 ring-white">
            {runner.avatar_url ? (
              <img
                src={runner.avatar_url}
                alt={runner.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {runner.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 truncate">
              {runner.name}
              {runner.is_admin && (
                <span className="ml-2 text-xs bg-gradient-to-r from-purple-500 to-blue-600 text-white px-2 py-1 rounded-full font-bold">
                  ⭐ Admin
                </span>
              )}
            </h3>
            {runner.bio && (
              <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                {runner.bio}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
