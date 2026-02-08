import { createClient } from '@/lib/supabase/server';
import { RunnerCard } from '@/components/runners/RunnerCard';
import type { Runner } from '@/types/database';

export default async function RunnersPage() {
  const supabase = await createClient();

  const { data: runners, error } = await supabase
    .from('runners')
    .select('*')
    .order('name');

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 text-red-800 p-4 rounded-lg">
            Error loading runners. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">👥 Runners</h1>
          <p className="text-white/90 mt-2 font-semibold">
            {runners?.length || 0} member{runners?.length !== 1 ? 's' : ''}
          </p>
        </div>

        {runners && runners.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {runners.map((runner: Runner) => (
              <RunnerCard key={runner.id} runner={runner} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No runners yet. Be the first to join!</p>
          </div>
        )}
      </div>
    </div>
  );
}
