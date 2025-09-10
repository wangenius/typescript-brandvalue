export interface Task {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  type: 'brand_evaluation' | 'brand_generation';
  createdAt: Date;
  updatedAt: Date;
  input?: any;
  progress?: {
    step: number;
    totalSteps: number;
    message?: string;
  };
  result?: any;
  error?: string;
}

class TaskManager {
  private tasks = new Map<string, Task>();

  createTask(type: Task['type'], input?: any): string {
    const id = this.generateTaskId();
    const task: Task = {
      id,
      status: 'pending',
      type,
      createdAt: new Date(),
      updatedAt: new Date(),
      input
    };
    this.tasks.set(id, task);
    return id;
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  updateTaskStatus(id: string, status: Task['status'], updates?: Partial<Task>): void {
    const task = this.tasks.get(id);
    if (task) {
      this.tasks.set(id, {
        ...task,
        status,
        updatedAt: new Date(),
        ...updates
      });
    }
  }

  updateTaskProgress(id: string, progress: Task['progress']): void {
    const task = this.tasks.get(id);
    if (task) {
      this.tasks.set(id, {
        ...task,
        progress,
        updatedAt: new Date()
      });
    }
  }

  setTaskResult(id: string, result: any): void {
    const task = this.tasks.get(id);
    if (task) {
      this.tasks.set(id, {
        ...task,
        status: 'completed',
        result,
        updatedAt: new Date()
      });
    }
  }

  setTaskError(id: string, error: string): void {
    const task = this.tasks.get(id);
    if (task) {
      this.tasks.set(id, {
        ...task,
        status: 'failed',
        error,
        updatedAt: new Date()
      });
    }
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const taskManager = new TaskManager();