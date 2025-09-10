import { NextRequest } from "next/server";
import OpenAI from "openai";
import { availableFunctions, ToolCall } from "@/types/function-calling";
import { executeFunction } from "@/lib/functions";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { messages, partial } = await req.json();

    // 获取 API 配置
    const apiKey = process.env.LLM_API_KEY;
    const baseURL = process.env.LLM_BASE_URL;
    const model = process.env.LLM_MODEL || "gpt-3.5-turbo";

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
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

你可以使用以下工具来帮助对话：
1. getCurrentTime - 获取当前时间，可以用于记录对话时间或提供时间相关信息
2. readWebContent - 读取网页内容，当用户提供网址时可以提取相关品牌信息
3. searchWeb - 搜索网络信息，当需要查找品牌相关资料、竞争对手信息或行业动态时使用

请自然地引导对话，一次询问1-2个相关问题。当你认为已经收集到足够信息进行品牌评估时，请在回复中包含 [READY_FOR_EVALUATION] 标记。

已收集的信息：
${JSON.stringify(partial || {}, null, 2)}`;

    // 构建消息数组
    let chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...messages.map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    // 创建一个 ReadableStream 来返回数据
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let shouldContinue = true;
          
          while (shouldContinue) {
            // 创建流式响应
            const stream = await openai.chat.completions.create({
              model,
              messages: chatMessages,
              stream: true,
              temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.3"),
              tools: availableFunctions.map((func) => ({
                type: "function" as const,
                function: func,
              })),
              tool_choice: "auto",
            });

            let functionCalls: ToolCall[] = [];
            let currentToolCallId = "";
            let currentFunctionName = "";
            let currentFunctionArguments = "";
            let hasToolCalls = false;

            for await (const chunk of stream) {
              const delta = chunk.choices[0]?.delta;

              // 处理普通内容
              if (delta?.content) {
                const data = `data: ${JSON.stringify({
                  content: delta.content,
                })}\n\n`;
                controller.enqueue(encoder.encode(data));
              }

              // 处理函数调用
              if (delta?.tool_calls) {
                hasToolCalls = true;
                for (const toolCall of delta.tool_calls) {
                  if (toolCall.id) {
                    // 如果有之前的函数调用，先保存
                    if (currentToolCallId && currentFunctionName) {
                      functionCalls.push({
                        id: currentToolCallId,
                        type: "function",
                        function: {
                          name: currentFunctionName,
                          arguments: currentFunctionArguments,
                        },
                      });
                    }
                    // 新的函数调用
                    currentToolCallId = toolCall.id;
                    currentFunctionName = toolCall.function?.name || "";
                    currentFunctionArguments = toolCall.function?.arguments || "";
                  } else if (toolCall.function?.arguments) {
                    // 继续收集函数参数
                    currentFunctionArguments += toolCall.function.arguments;
                  }
                }
              }

              // 检查是否结束
              const finishReason = chunk.choices[0]?.finish_reason;
              if (finishReason === "stop") {
                shouldContinue = false;
              }
            }

            // 保存最后一个函数调用
            if (currentToolCallId && currentFunctionName) {
              functionCalls.push({
                id: currentToolCallId,
                type: "function",
                function: {
                  name: currentFunctionName,
                  arguments: currentFunctionArguments,
                },
              });
            }

            // 如果有函数调用，执行它们
            if (functionCalls.length > 0) {
              // 首先添加助手的函数调用消息
              chatMessages.push({
                role: "assistant",
                content: null,
                tool_calls: functionCalls.map(fc => ({
                  id: fc.id,
                  type: "function",
                  function: fc.function,
                })),
              });

              // 执行函数调用
              for (const functionCall of functionCalls) {
                try {
                  // 发送函数调用开始信号
                  const startData = `data: ${JSON.stringify({
                    functionCall: {
                      name: functionCall.function.name,
                      status: "executing",
                    },
                  })}\n\n`;
                  controller.enqueue(encoder.encode(startData));

                  // 执行函数，传入请求的 URL 以便内部调用
                  const url = req.nextUrl.clone();
                  url.pathname = "/";
                  const baseUrl = url.origin;
                  const result = await executeFunction(functionCall.function, {
                    baseUrl,
                  });

                  // 发送函数结果
                  const resultData = `data: ${JSON.stringify({
                    functionResult: {
                      name: functionCall.function.name,
                      result: result,
                    },
                  })}\n\n`;
                  controller.enqueue(encoder.encode(resultData));

                  // 将函数结果添加到消息中
                  chatMessages.push({
                    role: "tool",
                    content: JSON.stringify(result),
                    tool_call_id: functionCall.id,
                  });
                } catch (error) {
                  console.error(
                    `Error executing function ${functionCall.function.name}:`,
                    error
                  );
                  const errorData = `data: ${JSON.stringify({
                    functionError: {
                      name: functionCall.function.name,
                      error:
                        error instanceof Error
                          ? error.message
                          : "Unknown error",
                    },
                  })}\n\n`;
                  controller.enqueue(encoder.encode(errorData));
                  
                  // 添加错误消息
                  chatMessages.push({
                    role: "tool",
                    content: JSON.stringify({ 
                      error: error instanceof Error ? error.message : "Unknown error" 
                    }),
                    tool_call_id: functionCall.id,
                  });
                }
              }

              // 继续对话循环，获取基于函数结果的响应
              shouldContinue = true;
            } else {
              // 没有函数调用，结束循环
              shouldContinue = false;
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
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "聊天服务暂时不可用" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}