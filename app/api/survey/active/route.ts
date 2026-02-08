import { createClient } from '@/lib/supabase/server';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get current runner
    const { data: runner } = await supabase
      .from('runners')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();

    // Get active survey
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (surveyError || !survey) {
      return NextResponse.json({ survey: null });
    }

    // Get responses with runner info
    const { data: responses } = await supabase
      .from('survey_responses')
      .select(`
        *,
        runner:runners(*)
      `)
      .eq('survey_id', survey.id);

    return NextResponse.json({
      survey: {
        ...survey,
        responses: responses || [],
      },
      currentRunnerId: runner?.id,
    });
  } catch (error) {
    console.error('Error fetching active survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
