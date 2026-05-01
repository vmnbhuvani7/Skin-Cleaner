import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Media from '@/models/Media';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const media = await Media.findById(id);

    if (!media) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Return the image buffer with the correct content type
    return new NextResponse(media.data, {
      headers: {
        'Content-Type': media.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
