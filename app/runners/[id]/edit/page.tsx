import { createClient } from '@/lib/supabase/server';
import { currentUser } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { ProfileEditForm } from '@/components/runners/ProfileEditForm';

interface EditProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  const { id } = await params;
  const user = await currentUser();
  const supabase = await createClient();

  if (!user) {
    redirect('/sign-in');
  }

  // Fetch runner profile
  const { data: runner, error } = await supabase
    .from('runners')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !runner) {
    notFound();
  }

  // Only allow editing own profile
  if (user.id !== runner.clerk_user_id) {
    redirect(`/runners/${id}`);
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Profile
          </h1>
          <ProfileEditForm runner={runner} />
        </div>
      </div>
    </div>
  );
}
