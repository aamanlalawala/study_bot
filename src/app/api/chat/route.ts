import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Call Gemini API
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'API error' }, { status: response.status });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';
    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}