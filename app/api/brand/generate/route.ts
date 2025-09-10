import { NextRequest, NextResponse } from "next/server";
import { BrandAssetGenerator } from "@/services";
import { taskManager } from "../../../lib/task-manager";

export const runtime = "nodejs";

const generator = new BrandAssetGenerator();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, stream = false, taskId } = body || {};

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "请提供有效的品牌内容文本（content字段）" },
        { status: 400 }
      );
    }
    if (content.length > 10000) {
      return NextResponse.json(
        { success: false, error: "品牌内容文本过长，请控制在10000字符以内" },
        { status: 400 }
      );
    }

    console.log("开始分步生成品牌资产...");

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
              totalSteps: 6,
              status: "开始生成品牌资产",
              progress: 0,
            };
            if (taskId) {
              taskManager.updateTaskProgress(taskId, initialProgress);
            }
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(initialProgress)}\n\n`)
            );

            // 步骤1：生成基本品牌信息
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  step: 1,
                  totalSteps: 6,
                  status: "正在生成基本品牌信息...",
                  progress: 16,
                })}\n\n`
              )
            );

            const basicInfo = await generator.generateBasicBrandInfo(content);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  step: 1,
                  totalSteps: 6,
                  status: "✅ 基本品牌信息生成完成",
                  progress: 16,
                  data: { basicInfo },
                })}\n\n`
              )
            );

            // 步骤2-4：并行生成品牌定位、表达和用户画像（性能优化）
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  step: 2,
                  totalSteps: 5,
                  status: "🚀 并行执行：品牌定位 & 表达 & 用户画像分析...",
                  progress: 25,
                  phase: "parallel_generation",
                })}\n\n`
              )
            );

            // 开始并行处理
            const startTime = Date.now();
            const [positioning, expression, personas] = await Promise.all([
              generator.generateBrandPositioning(content, basicInfo.brand_name),
              generator.generateBrandExpression(content, basicInfo.brand_name),
              generator.generateUserPersonas(content, basicInfo.brand_name),
            ]);
            const parallelTime = ((Date.now() - startTime) / 1000).toFixed(1);

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  step: 3,
                  totalSteps: 5,
                  status: `✅ 并行生成完成 (用时${parallelTime}秒)`,
                  progress: 60,
                  data: { positioning, expression, personas },
                  timing: { parallelExecutionTime: parallelTime },
                })}\n\n`
              )
            );

            // 步骤4：组合所有数据
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  step: 4,
                  totalSteps: 5,
                  status: "正在组合品牌资产数据...",
                  progress: 75,
                })}\n\n`
              )
            );

            const brandAsset = generator.assembleBrandAsset(
              basicInfo,
              positioning,
              expression,
              personas
            );

            // 步骤5：验证和补全缺失字段
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  step: 5,
                  totalSteps: 5,
                  status: "正在验证和补全缺失字段...",
                  progress: 90,
                })}\n\n`
              )
            );

            const validationStartTime = Date.now();
            const validatedData = await generator.validateAndFixMissingFields(
              brandAsset,
              content
            );
            const validationTime = (
              (Date.now() - validationStartTime) /
              1000
            ).toFixed(1);

            // 发送最终结果
            const finalResult = {
              step: 5,
              totalSteps: 5,
              status: `✅ 品牌资产生成完成 (验证用时${validationTime}秒)`,
              progress: 100,
              completed: true,
              data: validatedData,
              timing: {
                parallelExecutionTime: parallelTime,
                validationTime: validationTime,
              },
            };

            if (taskId) {
              taskManager.setTaskResult(taskId, validatedData);
            }

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(finalResult)}\n\n`)
            );
            controller.close();
          } catch (error: any) {
            if (taskId) {
              taskManager.setTaskError(
                taskId,
                error?.message || "品牌资产生成失败"
              );
            }
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  error: error?.message || "品牌资产生成失败",
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
    // 步骤1：生成基本品牌信息
    const basicInfo = await generator.generateBasicBrandInfo(content);
    console.log("✅ 基本品牌信息生成完成");
    console.log("基本品牌信息:", basicInfo);

    // 步骤2-4：并行生成品牌定位、表达和用户画像（性能优化）
    console.log("🚀 开始并行生成品牌定位、表达和用户画像...");
    const [positioning, expression, personas] = await Promise.all([
      generator.generateBrandPositioning(content, basicInfo.brand_name),
      generator.generateBrandExpression(content, basicInfo.brand_name),
      generator.generateUserPersonas(content, basicInfo.brand_name),
    ]);

    console.log("✅ 品牌定位生成完成");
    console.log("品牌定位:", positioning);
    console.log("✅ 品牌表达生成完成");
    console.log("品牌表达:", expression);
    console.log("✅ 用户画像生成完成");
    console.log("用户画像:", personas);

    // 步骤5：组合所有数据
    const brandAsset = generator.assembleBrandAsset(
      basicInfo,
      positioning,
      expression,
      personas
    );
    console.log("品牌资产:", brandAsset);

    // 步骤6：验证和补全缺失字段
    const validatedData = await generator.validateAndFixMissingFields(
      brandAsset,
      content
    );
    console.log("✅ 品牌资产验证和补全完成");
    console.log("验证后的品牌资产:", validatedData);

    return NextResponse.json({ success: true, data: brandAsset });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "品牌资产生成失败" },
      { status: 500 }
    );
  }
}
