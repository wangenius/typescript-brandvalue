import { NextRequest, NextResponse } from 'next/server';
import { taskManager } from '@/lib/task-manager';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const task = taskManager.getTask(taskId);

    if (!task) {
      return NextResponse.json({ error: '任务未找到' }, { status: 404 });
    }

    // 检查任务状态
    if (task.status === 'in_progress') {
      return NextResponse.json(
        { error: '任务正在进行中，无法重试' },
        { status: 400 }
      );
    }

    if (task.status === 'completed') {
      return NextResponse.json(
        { error: '任务已完成，无需重试' },
        { status: 400 }
      );
    }

    // 分析当前任务进度
    const currentStep = task.progress?.step || 0;
    const isGenerationFailed = currentStep === 1; // 生成阶段失败
    const isEvaluationFailed = currentStep === 2; // 评测阶段失败

    // 更新任务状态为进行中，清除错误信息
    taskManager.updateTaskStatus(taskId, 'in_progress', { error: undefined });
    
    // 根据失败阶段决定从哪里开始重试
    if (task.type === 'brand_evaluation') {
      const { input } = task;
      const brandContent = input?.messages
        ?.filter((m: any) => m.role === "user")
        .map((m: any) => m.content)
        .join("\n");

      if (!brandContent) {
        throw new Error("缺少品牌描述内容");
      }

      // 如果是生成阶段失败，从生成开始
      if (isGenerationFailed || !task.result?.generated_data) {
        // 1. 重新生成品牌资产
        const genResponse = await fetch(new URL('/api/brand/generate', req.url), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: brandContent,
            taskId: taskId,
          }),
        });

        if (!genResponse.ok) {
          const error = await genResponse.text();
          throw new Error(`品牌资产生成失败: ${error}`);
        }

        const genResult = await genResponse.json();
        
        // 保存生成结果
        const existingResult = task.result || {};
        taskManager.updateTaskStatus(taskId, 'in_progress', {
          result: { 
            ...existingResult,
            generated_data: genResult.data 
          }
        });
        taskManager.updateTaskProgress(taskId, { 
          step: 2, 
          totalSteps: 3, 
          message: "品牌资产生成完成" 
        });
      }

      // 获取最新的任务数据
      const updatedTask = taskManager.getTask(taskId);
      
      // 2. 重新开始评测
      const evalResponse = await fetch(new URL('/api/brand/evaluate', req.url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(updatedTask?.result?.generated_data || {}),
          stream: true,
          taskId: taskId,
        }),
      });

      if (!evalResponse.ok) {
        const error = await evalResponse.text();
        throw new Error(`品牌评测失败: ${error}`);
      }

      // 返回成功响应，评测将在后台继续
      return NextResponse.json({ 
        message: '任务重试已开始',
        taskId: taskId,
        fromStep: isGenerationFailed ? 'generation' : 'evaluation'
      });
    }

    return NextResponse.json(
      { error: '不支持的任务类型' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Task retry error:', error);
    
    // 更新任务状态为失败
    try {
      const { id: taskId } = await params;
      taskManager.setTaskError(
        taskId, 
        error instanceof Error ? error.message : '未知错误'
      );
    } catch (updateError) {
      console.error('Failed to update task status:', updateError);
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : '任务重试失败' },
      { status: 500 }
    );
  }
}