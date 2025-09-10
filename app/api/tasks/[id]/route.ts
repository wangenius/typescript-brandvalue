import { NextRequest, NextResponse } from 'next/server';
import { taskManager } from '../../../lib/task-manager';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const task = taskManager.getTask(taskId);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      task
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve task' }, 
      { status: 500 }
    );
  }
}