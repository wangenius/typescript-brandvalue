// Function implementations for AI chat

import { FunctionCall } from '@/types/function-calling';

// Get current time function
export async function getCurrentTime(args: { timezone?: string; format?: string }) {
  const timezone = args.timezone || 'Asia/Shanghai';
  const format = args.format || 'full';
  
  try {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    
    switch (format) {
      case 'date':
        return new Intl.DateTimeFormat('zh-CN', {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(now);
        
      case 'time':
        return new Intl.DateTimeFormat('zh-CN', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(now);
        
      case 'iso':
        return now.toISOString();
        
      case 'full':
      default:
        return new Intl.DateTimeFormat('zh-CN', options).format(now);
    }
  } catch (error) {
    return `获取时间失败: ${error instanceof Error ? error.message : '未知错误'}`;
  }
}

// Read web content function - uses internal API route
export async function readWebContent(args: { url: string }, baseUrl?: string) {
  const { url } = args;
  
  if (!url) {
    throw new Error('URL is required');
  }
  
  try {
    // In edge runtime, we need to call our own API endpoint
    const apiUrl = baseUrl ? `${baseUrl}/api/functions/web-reader` : '/api/functions/web-reader';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to read web content: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error reading web content:', error);
    return {
      error: true,
      message: `无法读取网页内容: ${error instanceof Error ? error.message : '未知错误'}`,
      url: url,
    };
  }
}

// Search web function - uses internal API route
export async function searchWeb(args: { query: string }, baseUrl?: string) {
  const { query } = args;
  
  if (!query) {
    throw new Error('Query is required');
  }
  
  try {
    // In edge runtime, we need to call our own API endpoint
    const apiUrl = baseUrl ? `${baseUrl}/api/functions/web-search` : '/api/functions/web-search';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to search web: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching web:', error);
    return {
      error: true,
      message: `无法搜索网页: ${error instanceof Error ? error.message : '未知错误'}`,
      query: query,
    };
  }
}

// Function executor
export async function executeFunction(functionCall: FunctionCall, context?: { baseUrl?: string }): Promise<any> {
  const { name, arguments: argsString } = functionCall;
  
  try {
    const args = JSON.parse(argsString);
    
    switch (name) {
      case 'getCurrentTime':
        return await getCurrentTime(args);
        
      case 'readWebContent':
        return await readWebContent(args, context?.baseUrl);
        
      case 'searchWeb':
        return await searchWeb(args, context?.baseUrl);
        
      default:
        throw new Error(`Unknown function: ${name}`);
    }
  } catch (error) {
    console.error(`Error executing function ${name}:`, error);
    throw error;
  }
}