import { createClient } from '@/lib/supabase/server';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Runner } from '@/types/database';

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const user = await currentUser();
  const supabase = await createClient();

  // Fetch runner profile
  const { data: runner, error } = await supabase
    .from('runners')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !runner) {
    notFound();
  }

  // Check if this is the current user's profile
  const isOwnProfile = user?.id === runner.clerk_user_id;

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-4 border border-white/20">
          <div className="flex items-start gap-4">
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xl ring-4 ring-white">
              {runner.avatar_url ? (
                <img
                  src={runner.avatar_url}
                  alt={runner.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {runner.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                  {runner.name}
                  {runner.is_admin && (
                    <span className="ml-2 text-sm bg-gradient-to-r from-purple-500 to-blue-600 text-white px-3 py-1 rounded-full font-bold">
                      ⭐ Admin
                    </span>
                  )}
                </h1>
                {isOwnProfile && (
                  <Link
                    href={`/runners/${id}/edit`}
                    className="text-sm bg-gradient-to-r from-purple-500 to-blue-600 text-white px-5 py-2 rounded-xl hover:scale-105 transition-all shadow-lg font-bold"
                  >
                    ✏️ Edit Profile
                  </Link>
                )}
              </div>
              <p className="text-gray-600 text-sm mt-1">{runner.email}</p>
            </div>
          </div>

          {runner.bio && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-700">{runner.bio}</p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <Link
          href="/runners"
          className="inline-block bg-white/95 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all text-purple-600 hover:text-purple-700 font-bold border border-white/20"
        >
          ← Back to all runners
        </Link>
      </div>
    </div>
  );
}
