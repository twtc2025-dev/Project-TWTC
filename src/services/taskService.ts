import { User, TaskProgress } from '../models/User';

const TASK_REWARD = 10;

export function completeTask(user: User, taskId: string, isValid: boolean) {
  const task = user.tasks.find(t => t.taskId === taskId);
  if (!task || !isValid || task.completed) return false;

  task.completed = true;
  if (!task.rewardClaimed) {
    user.balance += TASK_REWARD;
    task.rewardClaimed = true;
  }
  return true;
}
