import { createClient } from '@/lib/supabase/server';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { is_coming } = await request.json();

    if (typeof is_coming !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get current runner
    const { data: runner, error: runnerError } = await supabase
      .from('runners')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();

    if (runnerError || !runner) {
      return NextResponse.json({ error: 'Runner not found' }, { status: 404 });
    }

    // Get active survey
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('id')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (surveyError || !survey) {
      return NextResponse.json({ error: 'No active survey' }, { status: 404 });
    }

    // Upsert response (insert or update)
    const { error: responseError } = await supabase
      .from('survey_responses')
      .upsert(
        {
          survey_id: survey.id,
          runner_id: runner.id,
          is_coming,
        },
        {
          onConflict: 'survey_id,runner_id',
        }
      );

    if (responseError) {
      throw responseError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving survey response:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
