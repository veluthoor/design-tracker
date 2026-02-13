export type TaskStatus = "Not started" | "In progress" | "In review" | "Handed-over";
export type TaskType = "⭐️ Feature" | "📈 Improvement" | "🔧 Fix";
export type TaskTag = "Tintin" | "Nexus" | "Halo";

export interface Task {
  _id?: string;
  taskName: string;
  description: string;
  status: TaskStatus;
  assignee: string;
  taskType: TaskType | string;
  delivery: string;
  attachFile: string;
  productDoc: string;
  receivedBy: string;
  tags: TaskTag | string;
  updatedAt: string;
  createdAt?: string;
}
