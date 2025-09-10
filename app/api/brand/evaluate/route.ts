import { brand_valuate, BrandInputData, BrandZCalculator } from "@/services";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const calculator = new BrandZCalculator();

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BrandInputData & { stream?: boolean };

    if (!body || !body.brand_name || !body.brand_assets) {
      return NextResponse.json(
        {
          success: false,
          error: "请提供完整的品牌数据，包括brand_name和brand_assets字段",
        },
        { status: 400 }
      );
    }

    const { stream = false } = body;
    const calculator = new BrandZCalculator();

    // 如果启用流式返回
    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            // 发送初始状态
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              step: 0,
              totalSteps: 3,
              status: "开始品牌评估",
              progress: 0
            })}\n\n`));

            // 步骤1：品牌一致性评估
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              step: 1,
              totalSteps: 3,
              status: "正在进行品牌一致性评估...",
              progress: 33
            })}\n\n`));

            const consistencyResult = await calculator.evaluateConsistency(body);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              step: 1,
              totalSteps: 3,
              status: "✅ 品牌一致性评估完成",
              progress: 33,
              data: { consistencyResult }
            })}\n\n`));

            // 步骤2：BrandZ价值评估
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              step: 2,
              totalSteps: 3,
              status: "正在进行BrandZ价值评估...",
              progress: 66
            })}\n\n`));

            const brandzResult = await calculator.evaluateBrandZValue(
              body,
              consistencyResult.total_score
            );
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              step: 2,
              totalSteps: 3,
              status: "✅ BrandZ价值评估完成",
              progress: 66,
              data: { brandzResult }
            })}\n\n`));

            // 步骤3：生成综合报告
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              step: 3,
              totalSteps: 3,
              status: "正在生成综合报告...",
              progress: 90
            })}\n\n`));

            const comprehensiveReport = calculator.generateComprehensiveReport(
              body,
              consistencyResult,
              brandzResult
            );

            // 发送最终结果
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              step: 3,
              totalSteps: 3,
              status: "✅ 品牌评估完成",
              progress: 100,
              completed: true,
              data: comprehensiveReport
            })}\n\n`));

            controller.close();
          } catch (error: any) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              error: error?.message || "品牌评估失败"
            })}\n\n`));
            controller.close();
          }
        }
      });

      return new NextResponse(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // 非流式返回（保持原有逻辑）
    // 1. 品牌一致性评估
    const consistencyResult = await calculator.evaluateConsistency(body);

    // 2. BrandZ价值评估
    const brandzResult = await calculator.evaluateBrandZValue(
      body,
      consistencyResult.total_score
    );

    // 3. 生成综合报告
    const comprehensiveReport = calculator.generateComprehensiveReport(
      body,
      consistencyResult,
      brandzResult
    );
    return NextResponse.json({
      success: true,
      data: comprehensiveReport,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "服务器内部错误" },
      { status: 500 }
    );
  }
}
