import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Media from '@/models/Media';

export async function POST(req) {
  try {
    await dbConnect();
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to MongoDB (works on Vercel)
    const media = await Media.create({
      filename: file.name,
      contentType: file.type,
      data: buffer,
    });

    // Return the URL to fetch the image from our new API route
    const fileUrl = `/api/images/${media._id}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
