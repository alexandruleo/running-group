import { createClient } from '@/lib/supabase/server';
import { currentUser } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { EventEditForm } from '@/components/events/EventEditForm';

interface EventEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventEditPage({ params }: EventEditPageProps) {
  const { id } = await params;
  const user = await currentUser();
  const supabase = await createClient();

  if (!user) {
    redirect('/sign-in');
  }

  // Check if user is admin
  const { data: runner } = await supabase
    .from('runners')
    .select('is_admin')
    .eq('clerk_user_id', user.id)
    .single();

  if (!runner?.is_admin) {
    redirect('/events');
  }

  // Fetch event
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !event) {
    notFound();
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white mb-6 drop-shadow-lg">
          ✏️ Edit Event
        </h1>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <EventEditForm event={event} />
        </div>
      </div>
    </div>
  );
}
