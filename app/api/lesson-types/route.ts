import { NextResponse } from 'next/server';

// Frontend-only mode: Supabase integration disabled.
export async function GET() {
    return NextResponse.json({
        lessonTypes: [
            { id: 'beginner', name: 'Beginner Lesson (2 hours)', price: 100 },
            { id: 'intermediate', name: 'Intermediate Lesson (2 hours)', price: 100 },
            { id: 'advanced', name: 'Advanced Coaching (2 hours)', price: 100 }
        ]
    });
}
