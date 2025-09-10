import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }
    
    const apiKey = process.env.LLM_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured for web search" },
        { status: 500 }
      );
    }
    
    const response = await fetch('https://api.302.ai/search1api/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to search web: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Format the search results for better readability
    if (data.results && Array.isArray(data.results)) {
      const formattedResults = data.results.slice(0, 5).map((result: any) => ({
        title: result.title || '无标题',
        url: result.url || '',
        snippet: result.snippet || result.description || '无描述',
      }));
      
      return NextResponse.json({
        query: query,
        results: formattedResults,
        totalResults: data.results.length,
        searchedAt: new Date().toISOString(),
      });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in web search API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}