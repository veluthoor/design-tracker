"use client";

import { useState, useEffect } from "react";
import { Task, TaskStatus, TaskType, TaskTag } from "@/types/task";

interface TaskModalProps {
  task: Partial<Task> | null;
  onClose: () => void;
  onSave: (task: Partial<Task>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const STATUSES: TaskStatus[] = ["Not started", "In progress", "In review", "Handed-over"];
const TASK_TYPES: TaskType[] = ["⭐️ Feature", "📈 Improvement", "🔧 Fix"];
const TAGS: TaskTag[] = ["Tintin", "Nexus", "Halo"];

const STATUS_COLORS: Record<string, string> = {
  "Not started": "bg-gray-100 text-gray-600",
  "In progress": "bg-blue-100 text-blue-700",
  "In review": "bg-yellow-100 text-yellow-700",
  "Handed-over": "bg-green-100 text-green-700",
};

export default function TaskModal({ task, onClose, onSave, onDelete }: TaskModalProps) {
  const [form, setForm] = useState<Partial<Task>>({
    taskName: "",
    description: "",
    status: "Not started",
    assignee: "",
    taskType: "⭐️ Feature",
    delivery: "",
    attachFile: "",
    productDoc: "",
    receivedBy: "",
    tags: "Tintin",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({ ...task });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task?._id || !onDelete) return;
    if (!confirm("Delete this task?")) return;
    setDeleting(true);
    try {
      await onDelete(task._id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  const isEdit = !!task?._id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Task" : "New Task"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Task Name */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Task Name *</label>
            <input
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={form.taskName || ""}
              onChange={e => setForm(f => ({ ...f, taskName: e.target.value }))}
              placeholder="e.g. Home Screen Re-work"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              value={form.description || ""}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What is this task about?"
            />
          </div>

          {/* Row: Status + Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                value={form.status || "Not started"}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))}
              >
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tags</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                value={form.tags || "Tintin"}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value as TaskTag }))}
              >
                {TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Row: Assignee + Task Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Assignee</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.assignee || ""}
                onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
                placeholder="e.g. Kunal Verma"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Task Type</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                value={form.taskType || "⭐️ Feature"}
                onChange={e => setForm(f => ({ ...f, taskType: e.target.value as TaskType }))}
              >
                {TASK_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Row: Delivery + Received By */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Delivery Date</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.delivery ? new Date(form.delivery).toISOString().split("T")[0] : ""}
                onChange={e => setForm(f => ({ ...f, delivery: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Received By</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.receivedBy || ""}
                onChange={e => setForm(f => ({ ...f, receivedBy: e.target.value }))}
                placeholder="e.g. Puneeth K"
              />
            </div>
          </div>

          {/* Figma Link */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Figma Link</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={form.attachFile || ""}
              onChange={e => setForm(f => ({ ...f, attachFile: e.target.value }))}
              placeholder="https://www.figma.com/..."
            />
          </div>

          {/* Product Doc */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Product Doc</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={form.productDoc || ""}
              onChange={e => setForm(f => ({ ...f, productDoc: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            {isEdit && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-500 text-sm hover:text-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete task"}
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : isEdit ? "Save changes" : "Create task"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
