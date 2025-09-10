import { NextRequest, NextResponse } from 'next/server';
import { taskManager } from '../../lib/task-manager';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, input } = body;

    if (!type) {
      return NextResponse.json({ error: 'Task type is required' }, { status: 400 });
    }

    const taskId = taskManager.createTask(type, input);
    
    return NextResponse.json({ 
      success: true, 
      taskId,
      message: 'Task created successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create task' }, 
      { status: 500 }
    );
  }
}