import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { messages, partial } = await req.json();
    
    // 获取 API 配置
    const apiKey = process.env.LLM_API_KEY;
    const baseURL = process.env.LLM_BASE_URL;
    const model = process.env.LLM_MODEL || "gpt-3.5-turbo";
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    // 创建 OpenAI 客户端
    const openai = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    });
    
    // 构建系统提示词
    const systemPrompt = `你是一个专业的品牌评估顾问。你需要通过对话收集用户的品牌信息，包括：
- 品牌名称
- 品牌描述
- 主要产品或服务
- 目标客户群体
- 品牌理念和价值观
- 财务数据（如有）

请自然地引导对话，一次询问1-2个相关问题。当你认为已经收集到足够信息进行品牌评估时，请在回复中包含 [READY_FOR_EVALUATION] 标记。

已收集的信息：
${JSON.stringify(partial || {}, null, 2)}`;

    // 构建消息数组
    const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPrompt
      },
      ...messages.map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      }))
    ];
    
    // 创建流式响应
    const stream = await openai.chat.completions.create({
      model,
      messages: chatMessages,
      stream: true,
      temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.3"),
    });
    
    // 创建一个 ReadableStream 来返回数据
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              // 发送数据，使用 SSE 格式
              const data = `data: ${JSON.stringify({ content })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }
          // 发送结束信号
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
    
    // 返回流式响应
    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
    
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "聊天服务暂时不可用" }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}