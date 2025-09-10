export interface StreamEvent {
  step?: number;
  totalSteps?: number;
  status?: string;
  progress?: number;
  completed?: boolean;
  data?: any;
  error?: string;
}

export class StreamHandler {
  private eventSource: EventSource | null = null;
  
  constructor(
    private onMessage: (event: StreamEvent) => void,
    private onError?: (error: string) => void,
    private onComplete?: () => void
  ) {}

  connect(url: string) {
    this.eventSource = new EventSource(url);
    
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as StreamEvent;
        
        if (data.error) {
          this.onError?.(data.error);
          return;
        }
        
        this.onMessage(data);
        
        if (data.completed) {
          this.onComplete?.();
          this.disconnect();
        }
      } catch (error) {
        this.onError?.('解析服务器响应失败');
      }
    };
    
    this.eventSource.onerror = () => {
      this.onError?.('连接服务器失败');
      this.disconnect();
    };
  }
  
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

export async function streamingFetch(
  url: string, 
  body: any,
  onMessage: (event: StreamEvent) => void,
  onError?: (error: string) => void,
  onComplete?: () => void
) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...body, stream: true }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('无法读取响应流');
    }

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6)) as StreamEvent;
            
            if (data.error) {
              onError?.(data.error);
              return;
            }
            
            onMessage(data);
            
            if (data.completed) {
              onComplete?.();
              return;
            }
          } catch (error) {
            // 忽略解析错误的行
          }
        }
      }
    }
  } catch (error) {
    onError?.(error instanceof Error ? error.message : '请求失败');
  }
}