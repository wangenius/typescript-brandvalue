import { brand_valuate, BrandInputData, BrandZCalculator } from "@/services";
import { NextRequest, NextResponse } from "next/server";
import { taskManager } from "../../../lib/task-manager";

export const runtime = "nodejs";
const calculator = new BrandZCalculator();

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BrandInputData & {
      stream?: boolean;
      taskId?: string;
    };

    if (!body || !body.brand_name || !body.brand_assets) {
      return NextResponse.json(
        {
          success: false,
          error: "请提供完整的品牌数据，包括brand_name和brand_assets字段",
        },
        { status: 400 }
      );
    }

    const { stream = false, taskId } = body;
    const calculator = new BrandZCalculator();

    // 如果启用流式返回
    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            // 更新任务状态为进行中
            if (taskId) {
              taskManager.updateTaskStatus(taskId, "in_progress");
            }

            // 发送初始状态
            const initialProgress = {
              step: 0,
              totalSteps: 3,
              status: "开始品牌评估",
              progress: 0,
            };
            if (taskId) {
              taskManager.updateTaskProgress(taskId, initialProgress);
            }
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(initialProgress)}\n\n`)
            );

            // 步骤1：品牌一致性评估
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  step: 1,
                  totalSteps: 3,
                  status: "正在进行品牌一致性评估...",
                  progress: 10,
                })}\n\n`
              )
            );

            const consistencyStartTime = Date.now();
            const consistencyResult = await calculator.evaluateConsistency(
              body
            );
            const consistencyTime = (
              (Date.now() - consistencyStartTime) /
              1000
            ).toFixed(1);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  step: 1,
                  totalSteps: 3,
                  status: `✅ 品牌一致性评估完成 (用时${consistencyTime}秒)`,
                  progress: 40,
                  data: { consistencyResult },
                  timing: { consistencyTime: consistencyTime },
                })}\n\n`
              )
            );

            // 步骤2：BrandZ价值评估
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  step: 2,
                  totalSteps: 3,
                  status: "正在进行BrandZ价值评估...",
                  progress: 50,
                })}\n\n`
              )
            );

            const brandzStartTime = Date.now();
            const brandzResult = await calculator.evaluateBrandZValue(
              body,
              consistencyResult.total_score
            );
            const brandzTime = ((Date.now() - brandzStartTime) / 1000).toFixed(
              1
            );

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  step: 2,
                  totalSteps: 3,
                  status: `✅ BrandZ价值评估完成 (用时${brandzTime}秒)`,
                  progress: 75,
                  data: { brandzResult },
                  timing: { brandzTime: brandzTime },
                })}\n\n`
              )
            );

            // 步骤3：生成综合报告
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  step: 3,
                  totalSteps: 3,
                  status: "正在生成综合报告...",
                  progress: 85,
                })}\n\n`
              )
            );

            const reportStartTime = Date.now();
            const comprehensiveReport = calculator.generateComprehensiveReport(
              body,
              consistencyResult,
              brandzResult
            );
            const reportTime = ((Date.now() - reportStartTime) / 1000).toFixed(
              1
            );

            // 发送最终结果
            const totalTime = consistencyTime + brandzTime + reportTime;
            const finalResult = {
              step: 3,
              totalSteps: 3,
              status: `✅ 品牌评估完成 (总用时${totalTime}秒)`,
              progress: 100,
              completed: true,
              data: comprehensiveReport,
              timing: {
                consistencyTime: consistencyTime,
                brandzTime: brandzTime,
                reportTime: reportTime,
                totalTime: totalTime,
              },
            };

            if (taskId) {
              taskManager.setTaskResult(taskId, comprehensiveReport);
            }

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(finalResult)}\n\n`)
            );
            controller.close();
          } catch (error: any) {
            if (taskId) {
              taskManager.setTaskError(
                taskId,
                error?.message || "品牌评估失败"
              );
            }
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  error: error?.message || "品牌评估失败",
                })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new NextResponse(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
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
