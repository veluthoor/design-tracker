"use client";

import { useState, useEffect, useRef } from "react";
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

// Parse comma-separated string to array
function toArray(val: string | undefined): string[] {
  if (!val) return [];
  return val.split(",").map(s => s.trim()).filter(Boolean);
}

// Join array to comma-separated string
function toString(arr: string[]): string {
  return arr.join(", ");
}

interface MemberSelectProps {
  label: string;
  selected: string[];
  members: string[];
  onChange: (val: string[]) => void;
  onAddMember: (name: string) => Promise<void>;
}

function MemberSelect({ label, selected, members, onChange, onAddMember }: MemberSelectProps) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter(s => s !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await onAddMember(newName.trim());
      onChange([...selected, newName.trim()]);
      setNewName("");
      setAdding(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-medium text-pink-400 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full border border-pink-200 rounded-xl px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-pink-300 bg-pink-50/50 min-h-[38px] flex flex-wrap gap-1 items-center"
      >
        {selected.length === 0 ? (
          <span className="text-pink-300">Select...</span>
        ) : (
          selected.map(name => (
            <span
              key={name}
              className="inline-flex items-center gap-1 bg-pink-100 text-pink-600 text-xs font-medium px-2 py-0.5 rounded-full"
            >
              {name}
              <span
                role="button"
                onClick={e => { e.stopPropagation(); toggle(name); }}
                className="hover:text-indigo-900 cursor-pointer leading-none"
              >×</span>
            </span>
          ))
        )}
        <span className="ml-auto text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-pink-100 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {members.map(name => (
            <div
              key={name}
              onClick={() => toggle(name)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-pink-50 cursor-pointer text-sm"
            >
              <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs flex-shrink-0 ${selected.includes(name) ? "bg-pink-500 border-pink-500 text-white" : "border-pink-200"}`}>
                {selected.includes(name) ? "✓" : ""}
              </span>
              <span className="text-rose-700">{name}</span>
            </div>
          ))}

          {/* Add new member */}
          {adding ? (
            <div className="flex items-center gap-2 px-3 py-2 border-t border-pink-100">
              <input
                autoFocus
                className="flex-1 border border-pink-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-pink-300 bg-pink-50/50 placeholder-pink-300"
                placeholder="Full name..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={saving || !newName.trim()}
                className="text-xs bg-pink-500 text-white px-2 py-1 rounded-lg disabled:opacity-50"
              >
                {saving ? "..." : "Add"}
              </button>
              <button type="button" onClick={() => setAdding(false)} className="text-xs text-pink-300 hover:text-pink-500">✕</button>
            </div>
          ) : (
            <div
              onClick={() => setAdding(true)}
              className="flex items-center gap-2 px-3 py-2 border-t border-pink-100 hover:bg-pink-50 cursor-pointer text-sm text-pink-500 font-medium"
            >
              <span className="text-base leading-none">+</span> Add new member
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
    tags: undefined,
  });
  const [members, setMembers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (task) setForm({ ...task });
    // Fetch members
    fetch("/api/members")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMembers(data); })
      .catch(() => {});
  }, [task]);

  const handleAddMember = async (name: string) => {
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok || res.status === 409) {
      setMembers(prev => prev.includes(name) ? prev : [...prev, name].sort());
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/30 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-pink-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-rose-700">
            {isEdit ? "Edit Task" : "New Task"}
          </h2>
          <button onClick={onClose} className="text-pink-300 hover:text-pink-500 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Task Name */}
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1">Task Name *</label>
            <input
              required
              className="w-full border border-pink-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-pink-50/50 placeholder-pink-300"
              value={form.taskName || ""}
              onChange={e => setForm(f => ({ ...f, taskName: e.target.value }))}
              placeholder="e.g. Home Screen Re-work"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1">Description</label>
            <textarea
              rows={2}
              className="w-full border border-pink-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none bg-pink-50/50 placeholder-pink-300"
              value={form.description || ""}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What is this task about?"
            />
          </div>

          {/* Row: Status + Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1">Status</label>
              <select
                className="w-full border border-pink-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                value={form.status || "Not started"}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))}
              >
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1">Tags</label>
              <select
                className="w-full border border-pink-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                value={form.tags || ""}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value as TaskTag }))}
              >
                <option value="">Select a tag...</option>
                {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Row: Task Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1">Task Type</label>
              <select
                className="w-full border border-pink-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                value={form.taskType || "⭐️ Feature"}
                onChange={e => setForm(f => ({ ...f, taskType: e.target.value as TaskType }))}
              >
                {TASK_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1">Delivery Date</label>
              <input
                type="date"
                className="w-full border border-pink-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-pink-50/50"
                value={form.delivery ? new Date(form.delivery).toISOString().split("T")[0] : ""}
                onChange={e => setForm(f => ({ ...f, delivery: e.target.value }))}
              />
            </div>
          </div>

          {/* Assignee — multi-select */}
          <MemberSelect
            label="Assignee"
            selected={toArray(form.assignee)}
            members={members}
            onChange={val => setForm(f => ({ ...f, assignee: toString(val) }))}
            onAddMember={handleAddMember}
          />

          {/* Received By — multi-select */}
          <MemberSelect
            label="Received By"
            selected={toArray(form.receivedBy)}
            members={members}
            onChange={val => setForm(f => ({ ...f, receivedBy: toString(val) }))}
            onAddMember={handleAddMember}
          />

          {/* Figma Link */}
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1">Figma Link</label>
            <input
              className="w-full border border-pink-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-pink-50/50 placeholder-pink-300"
              value={form.attachFile || ""}
              onChange={e => setForm(f => ({ ...f, attachFile: e.target.value }))}
              placeholder="https://www.figma.com/..."
            />
          </div>

          {/* Product Doc */}
          <div>
            <label className="block text-xs font-medium text-pink-400 mb-1">Product Doc</label>
            <input
              className="w-full border border-pink-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-pink-50/50 placeholder-pink-300"
              value={form.productDoc || ""}
              onChange={e => setForm(f => ({ ...f, productDoc: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-pink-100">
            {isEdit && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-rose-600 text-sm hover:text-rose-800 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete task"}
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-rose-600 hover:text-rose-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-full disabled:opacity-50 shadow-sm"
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
