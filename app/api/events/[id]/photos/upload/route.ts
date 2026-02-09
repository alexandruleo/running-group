import { createServiceClient } from '@/lib/supabase/service';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Get current runner
    const { data: runner, error: runnerError } = await supabase
      .from('runners')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();

    if (runnerError || !runner) {
      return NextResponse.json({ error: 'Runner not found' }, { status: 404 });
    }

    // Get event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if user is registered for this event
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('runner_id', runner.id)
      .eq('status', 'registered')
      .single();

    if (regError || !registration) {
      return NextResponse.json(
        { error: 'You must be registered for this event to upload photos' },
        { status: 403 }
      );
    }

    // Check if event has started
    const eventDate = new Date(event.event_date);
    const now = new Date();

    if (eventDate > now) {
      return NextResponse.json(
        { error: 'Photo uploads are only available during or after the event' },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('photos') as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 }
      );
    }

    // Validate files
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}. Only images (JPEG, PNG, WebP) are allowed` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size is 5MB` },
          { status: 400 }
        );
      }
    }

    // Upload files
    const uploadedPhotos = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${eventId}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('event-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading photo:', uploadError);
        continue;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('event-photos').getPublicUrl(fileName);

      // Save photo record
      const { data: photo, error: photoError } = await supabase
        .from('event_photos')
        .insert({
          event_id: eventId,
          photo_url: publicUrl,
          uploaded_by: runner.id,
        })
        .select()
        .single();

      if (!photoError && photo) {
        uploadedPhotos.push(photo);
      }
    }

    return NextResponse.json({
      success: true,
      photos: uploadedPhotos,
      count: uploadedPhotos.length,
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
