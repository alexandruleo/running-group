import { createClient } from '@/lib/supabase/server';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { EventCreateForm } from '@/components/events/EventCreateForm';

export default async function CreateEventPage() {
  const user = await currentUser();
  const supabase = await createClient();

  if (!user) {
    redirect('/sign-in');
  }

  // Check if user is admin
  const { data: runner } = await supabase
    .from('runners')
    .select('id, is_admin')
    .eq('clerk_user_id', user.id)
    .single();

  if (!runner?.is_admin) {
    redirect('/events');
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create New Event
          </h1>
          <EventCreateForm runnerId={runner.id} />
        </div>
      </div>
    </div>
  );
}
