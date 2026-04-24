import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { message } = await req.json();
    
    const responses = [
      "That's an interesting perspective!",
      "I understand. Tell me more about that.",
      "How can I help you with this topic?",
      "I see. Let's explore that further.",
      "That's a great question!",
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    return new NextResponse(randomResponse, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    return new NextResponse('Error processing your request', { status: 500 });
  }
}
