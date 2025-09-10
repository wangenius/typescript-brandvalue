import { NextRequest, NextResponse } from "next/server";
import { BrandAssetGenerator, generateBrandAsset } from "@/services";
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
              taskManager.updateTaskStatus(taskId, 'in_progress');
            }

            // 发送初始状态
            const initialProgress = {
              step: 0,
              totalSteps: 6,
              status: "开始生成品牌资产",
              progress: 0
            };
            if (taskId) {
              taskManager.updateTaskProgress(taskId, initialProgress);
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialProgress)}\n\n`));

            // 步骤1：生成基本品牌信息
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              step: 1,
              totalSteps: 6,
              status: "正在生成基本品牌信息...",
              progress: 16
            })}\n\n`));

            const basicInfo = await generator.generateBasicBrandInfo(content);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              step: 1,
              totalSteps: 6,
              status: "✅ 基本品牌信息生成完成",
              progress: 16,
              data: { basicInfo }
            })}\n\n`));

            // 步骤2：生成品牌定位
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              step: 2,
              totalSteps: 6,
              status: "正在生成品牌定位...",
              progress: 33
            })}\n\n`));

            const positioning = await generator.generateBrandPositioning( 
              content,
              basicInfo.brand_name
            );
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              step: 2,
              totalSteps: 6,
              status: "✅ 品牌定位生成完成",
              progress: 33,
              data: { positioning }
            })}\n\n`));

            // 步骤3：生成品牌表达
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              step: 3,
              totalSteps: 6,
              status: "正在生成品牌表达...",
              progress: 50
            })}\n\n`));

            const expression = await generator.generateBrandExpression(
              content,
              basicInfo.brand_name
            );
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              step: 3,
              totalSteps: 6,
              status: "✅ 品牌表达生成完成",
              progress: 50,
              data: { expression }
            })}\n\n`));

            // 步骤4：生成用户画像
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              step: 4,
              totalSteps: 6,
              status: "正在生成用户画像...",
              progress: 66
            })}\n\n`));

            const personas = await generator.generateUserPersonas(
              content,
              basicInfo.brand_name
            );
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              step: 4,
              totalSteps: 6,
              status: "✅ 用户画像生成完成",
              progress: 66,
              data: { personas }
            })}\n\n`));

            // 步骤5：组合所有数据
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              step: 5,
              totalSteps: 6,
              status: "正在组合品牌资产数据...",
              progress: 83
            })}\n\n`));

            const brandAsset = generator.assembleBrandAsset(
              basicInfo,
              positioning,
              expression,
              personas
            );
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              step: 5,
              totalSteps: 6,
              status: "✅ 品牌资产数据组合完成",
              progress: 83
            })}\n\n`));

            // 步骤6：验证和补全缺失字段
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              step: 6,
              totalSteps: 6,
              status: "正在验证和补全缺失字段...",
              progress: 95
            })}\n\n`));

            const validatedData = await generator.validateAndFixMissingFields(
              brandAsset,
              content
            );
            
            // 发送最终结果
            const finalResult = {
              step: 6,
              totalSteps: 6,
              status: "✅ 品牌资产生成完成",
              progress: 100,
              completed: true,
              data: validatedData
            };
            
            if (taskId) {
              taskManager.setTaskResult(taskId, validatedData);
            }
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalResult)}\n\n`));
            controller.close();
          } catch (error: any) {
            if (taskId) {
              taskManager.setTaskError(taskId, error?.message || "品牌资产生成失败");
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              error: error?.message || "品牌资产生成失败"
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
    // 步骤1：生成基本品牌信息
    const basicInfo = await generator.generateBasicBrandInfo(content);
    console.log("✅ 基本品牌信息生成完成");
    console.log("基本品牌信息:", basicInfo);

    // 步骤2：生成品牌定位
    const positioning = await generator.generateBrandPositioning( 
      content,
      basicInfo.brand_name
    );
    console.log("✅ 品牌定位生成完成");
    console.log("品牌定位:", positioning);

    // 步骤3：生成品牌表达
    const expression = await generator.generateBrandExpression(
      content,
      basicInfo.brand_name
    );
    console.log("✅ 品牌表达生成完成");
    console.log("品牌表达:", expression);

    // 步骤4：生成用户画像
    const personas = await generator.generateUserPersonas(
      content,
      basicInfo.brand_name
    );
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
