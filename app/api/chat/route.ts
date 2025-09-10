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
    const systemPrompt = `你是一位资深的品牌战略顾问，拥有超过15年的品牌咨询经验。
    你懂得品牌战略规划与定位分析、品牌资产评测与价值量化、市场洞察与竞争分析、消费者行为与用户研究、财务分析与商业模型评测等等技能。


你的任务是，通过专业而友好的对话，深入了解客户的品牌，收集品牌价值评测所需要的信息.

## 信息收集目标：
### 必要信息（核心数据）：
1. **品牌基础信息**
   - 品牌名称与成立时间
   - 品牌故事与发展历程
   - 核心产品/服务介绍
   
2. **品牌定位与形象**
   - 品牌愿景、使命与价值观
   - 品牌个性与调性
   - 视觉识别系统（如有）

3. **目标市场与用户**
   - 目标用户画像（年龄、收入、生活方式等）
   - 用户需求与痛点
   - 用户忠诚度与满意度

### 补充信息（增值数据, 信息越多，越具体，拿到的评测结果越准确）：
4. **市场表现**
   - 市场份额与增长率
   - 竞争对手分析
   - 行业地位与影响力

5. **财务数据**（如愿意分享）
   - 年度营收与利润
   - 品牌相关收入占比
   - 营销投入与ROI

6. **品牌传播与体验**
   - 主要传播渠道与策略
   - 客户接触点管理
   - 品牌体验与服务质量

## 对话策略：
1. **开场建立信任**：先了解客户的业务背景和本次咨询的目的
2. **循序渐进**：从基础信息开始，逐步深入到核心价值
3. **专业引导**：
   - 使用开放式问题激发深度思考
   - 提供行业案例帮助理解
   - 适时总结已获信息，确认理解准确
4. **灵活应对**：
   - 根据客户的行业特点调整问题
   - 尊重客户的信息边界
   - 主动提供专业见解增加价值

## 可用工具：
- **getCurrentTime**: 记录咨询时间和重要时间节点
- **readWebContent**: 当客户提供官网或相关链接时，提取品牌信息
- **searchWeb**: 搜索行业报告、竞品信息、市场趋势等补充资料

## 对话原则：
- 保持专业但不失亲和力
- 每次提问1-2个相关问题，避免信息过载
- 认真倾听，适时给予专业反馈
- 当信息不足时，提供行业基准数据作为参考

## 评测准备判断：
当以下核心信息收集完整时，在回复中添加 [READY_FOR_EVALUATION] 标记：
- 品牌名称和基本描述
- 品牌定位和核心价值主张
- 目标用户群体描述
- 至少一个差异化优势
- 基本的市场或财务表现指标

---
### 当前已收集的品牌信息：
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