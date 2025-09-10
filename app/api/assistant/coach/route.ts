import type { BrandInputData } from "@/services";
import { LLM } from "@/services";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * 会话式采集品牌信息的教练式接口
 * 输入：{ messages: Array<{ role: 'user' | 'assistant', content: string }>, partial?: BrandInputData }
 * 输出：{ success, assistant: string, partial: BrandInputData, isReady: boolean, missingFields: string[] }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = (body?.messages || []) as Array<{
      role: "user" | "assistant";
      content: string;
    }>;
    const partial = (body?.partial || {}) as Partial<BrandInputData>;

    const llm = new LLM();

    const systemGoal = `你是一名品牌战略与研究的访谈教练，目标是一步步引导用户提供完成“品牌价值评估”所需的数据结构（BrandInputData）。
- 采用中文、对话式、每次只问一个关键问题，问题要具体、简洁、可回答。
- 根据用户已有回答主动推测和填充字段，但务必标注“(如有偏差请更正)”以便用户修正。
- 在合理时主动总结已收集要点，提示还缺少哪些关键信息。
- 当关键信息已具备时，将isReady置为true。
- BrandInputData 的核心字段：brand_name、brand_assets（含 brand_image、user_personas）、可选：financial_data、competitive_analysis、market_research、communication、experience、customer_feedback。
返回JSON，禁止输出除JSON外的任何内容。`;

    const instruction = {
      role: "system",
      content: `${systemGoal}\n\n当前已收集的部分数据（partial）：\n${JSON.stringify(
        partial,
        null,
        2
      )}\n\n对话历史（仅供参考）：\n${messages
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n")}`,
    } as const;

    const outputSchema = `请严格返回如下JSON结构：\n{\n  "assistant": "string，下一句要问用户的问题或总结（中文，简洁）",\n  "partial": BrandInputData对象，尽量补全并保持字段名准确,\n  "isReady": boolean,\n  "missingFields": string[]  // 仍缺的关键字段路径，如"brand_name"、"brand_assets.brand_image.title"\n}`;

    const prompt = `${instruction.content}\n\n${outputSchema}`;

    let json: any;
    try {
      json = await llm.json(prompt);
    } catch (e: any) {
      // 兜底：若LLM失败，返回一个基础问题
      return NextResponse.json({
        success: true,
        assistant: "我们先从基础开始：请告诉我你的品牌名称是什么？",
        partial,
        isReady: false,
        missingFields: ["brand_name", "brand_assets"],
      });
    }

    // 最小校验：确保结构存在
    const assistant =
      typeof json?.assistant === "string" && json.assistant.trim()
        ? json.assistant.trim()
        : "请继续补充你的品牌关键信息。";
    const mergedPartial: BrandInputData | Partial<BrandInputData> = {
      ...partial,
      ...(json?.partial || {}),
    } as any;

    // 就绪判定（保底规则）：至少包含 brand_name 与 brand_assets
    let isReady = Boolean(json?.isReady);
    const missing: string[] = Array.isArray(json?.missingFields)
      ? json.missingFields
      : [];
    if (!mergedPartial?.brand_name) {
      isReady = false;
      if (!missing.includes("brand_name")) missing.push("brand_name");
    }
    if (!mergedPartial?.brand_assets) {
      isReady = false;
      if (!missing.includes("brand_assets")) missing.push("brand_assets");
    }

    return NextResponse.json({
      success: true,
      assistant,
      partial: mergedPartial,
      isReady,
      missingFields: missing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "会话教练接口异常" },
      { status: 500 }
    );
  }
}
