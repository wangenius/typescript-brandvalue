import fs from 'fs';
import path from 'path';

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
  private dataFile = path.join(process.cwd(), 'data', 'tasks.json');

  constructor() {
    this.loadTasks();
  }

  private loadTasks(): void {
    try {
      const dataDir = path.dirname(this.dataFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf8');
        const tasksArray = JSON.parse(data);
        this.tasks = new Map(tasksArray.map((task: any) => [
          task.id,
          {
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt)
          }
        ]));
      }
    } catch (error) {
      console.warn('Failed to load tasks from file:', error);
    }
  }

  private saveTasks(): void {
    try {
      const tasksArray = Array.from(this.tasks.values());
      fs.writeFileSync(this.dataFile, JSON.stringify(tasksArray, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save tasks to file:', error);
    }
  }

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
    this.saveTasks();
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
      this.saveTasks();
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
      this.saveTasks();
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
      this.saveTasks();
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
      this.saveTasks();
    }
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const taskManager = new TaskManager();