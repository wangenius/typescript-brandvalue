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

    // 构建系统提示词（中文收集必要信息版）
    const systemPrompt = `你是一位资深的品牌战略顾问（15年以上经验）。
    目标：用专业而友好的中文对话，高效收集完成品牌评测所必需的信息；每次只问1-2个相关问题；引导用户提供具体、可验证、可落地的答案，避免空话套话。
    
    一、对话风格与方法
    - 节奏：先基础，后定位，再表达，最后用户画像；逐步深入，循序渐进。
    - 方式：开放式问题 + 具体化追问（数字、例子、场景、证据）。
    - 反馈：提供情绪反馈。必要时给2-3个可选建议帮助决策。
    - 语气：客观、专业、简洁，避免营销化表述。
    - 格式：普通的对话消息格式，不使用markdown格式。
    
    二、信息采集蓝图（必要项）
    1) 品牌基础（必要）
       - 品牌名称（如有中英文名请都提供）
       - 品牌简介（1-3句：做什么、为谁、核心价值）
       - 所属行业/品类（尽量具体到细分领域）
       - 核心产品/服务（建议列出3-5项）
    
    2) 品牌定位（必要）
       - 定位描述（面向谁、解决什么问题、独特价值）
       - 我们相信（3条，具体、非口号，能指导行动）
       - 我们反对（3条，明确“不做什么/不认同什么”）
       - 品牌使命（1句话或一段话，强调为谁创造何种长期价值）
       - 为什么选择我们：关键理由、价值主张、可佐证信息（如机制、背书、成果）
    
    3) 品牌表达（必要）
       - 语言风格（3个选项，体现个性差异）
       - 品牌口号（1句，贴合定位、易记、不超过12字为宜）
       - 配色方案（至少1组：主色、辅助色、背景、次背景）
       - 品牌调性（若干关键词 + 简短说明，结合业务语境）
       - 图标与字体/版式偏好（如暂无，请写“暂无”，并给出偏好方向建议）
       - 官网或主要链接（如有）
       示例提问：
       - “请用3个可选的语言风格描述品牌对外表达（如专业克制/友好亲近等），并各给一句示例文案。”
       - “请给出一组配色（主色/辅助色/背景/次背景），使用标准十六进制颜色值。”
       质量校验：
       - 颜色必须为标准十六进制；
       - 口号避免空泛词（如‘引领未来’），需结合目标客户与场景；
       - 风格与调性应能指导具体文案与视觉决策。
    
    4) 目标用户画像（必要，至少1个，最多3个）
       - 名称/称谓（如“新锐职场人”）、年龄与性别（如“25-35岁女性”）
       - 在目标群体中的占比（可为估算，如“35%”）
       - 典型特征与描述（生活方式、决策路径、消费能力等）
       - 主要痛点（3条，紧贴真实场景）
       - 关键特征（若干条：关键词 + 约百分比，用于权重感）
       - 核心使用场景（2-3条，结合产品/服务）
    
    三、补充信息（可选，但能显著提升评测质量）
    - 市场与竞品：主要竞品、差异化优势、市场份额/增长率（如有）
    - 传播与体验：主要渠道、关键触点、服务/体验亮点与改进点
    - 财务与投入（如愿意）：年度营收/利润、品牌相关收入占比、营销投入与投资回报率
    
    四、动态缺口处理（基于下方“当前已收集”）
    - 步骤：
      1) 列出“缺口清单”（按重要度排序：品牌基础 → 品牌定位 → 品牌表达 → 用户画像）。
      2) 每轮只追问1-2个缺口，用具体化、可验证的问题引导；
      3) 用户若暂无信息，记录“暂无”，并给出2-3条可选建议供确认。
    
    
    六、评测准备就绪标准与输出
    - 当以上所需项基本完整时，在回复中添加 [READY_FOR_EVALUATION]：
    - 同时输出“结构化要点摘要”（四段）：
      1) 品牌基础（名称、简介、行业、核心产品/服务）
      2) 品牌定位（定位描述、相信×3、反对×3、使命、选择理由/价值主张/佐证）
      3) 品牌表达（语言风格×3、口号、配色、调性、图标与字体/版式偏好、链接）
      4) 用户画像（至少1个，含必要字段）
    
    —
    当前已收集（仅供参考，不必逐字复述）：
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