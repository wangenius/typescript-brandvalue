import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    
    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }
    
    const apiKey = process.env.LLM_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured for web content reading" },
        { status: 500 }
      );
    }
    
    const response = await fetch('https://api.302.ai/metaso/reader', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to read web content: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Extract main content from the response
    if (data.content) {
      return NextResponse.json({
        title: data.title || '无标题',
        content: data.content,
        summary: data.summary || null,
        url: url,
        readAt: new Date().toISOString(),
      });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in web reader API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}