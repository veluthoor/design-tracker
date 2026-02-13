"use client";

import { useState, useEffect, useCallback } from "react";
import { Task } from "@/types/task";
import TaskModal from "./TaskModal";

const STATUS_STYLES: Record<string, string> = {
  "Not started": "bg-pink-50 text-pink-400 border border-pink-200",
  "In progress": "bg-fuchsia-100 text-fuchsia-600",
  "In review": "bg-rose-100 text-rose-500",
  "Handed-over": "bg-pink-200 text-pink-700",
};

const TAG_STYLES: Record<string, string> = {
  Tintin: "bg-purple-100 text-purple-600",
  Nexus: "bg-fuchsia-100 text-fuchsia-600",
  Halo: "bg-rose-100 text-rose-500",
};

const TYPE_STYLES: Record<string, string> = {
  "⭐️ Feature": "bg-pink-100 text-pink-600",
  "📈 Improvement": "bg-purple-100 text-purple-600",
  "🔧 Fix": "bg-rose-100 text-rose-500",
};

function Badge({ label, styleMap }: { label: string; styleMap: Record<string, string> }) {
  const cls = styleMap[label] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls} whitespace-nowrap`}>
      {label}
    </span>
  );
}

function formatDate(d: string) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DesignTracker() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterTag, setFilterTag] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [sortField, setSortField] = useState<keyof Task>("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [modalTask, setModalTask] = useState<Partial<Task> | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSort = (field: keyof Task) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const filtered = tasks
    .filter(t => {
      if (filterStatus !== "All" && t.status !== filterStatus) return false;
      if (filterTag !== "All" && t.tags !== filterTag) return false;
      if (filterType !== "All" && t.taskType !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.taskName?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.assignee?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const av = (a[sortField] as string) || "";
      const bv = (b[sortField] as string) || "";
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const openNew = () => { setModalTask({}); setShowModal(true); };
  const openEdit = (t: Task) => { setModalTask(t); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setModalTask(null); };

  const handleSave = async (task: Partial<Task>) => {
    if (task._id) {
      await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
    } else {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
    }
    await fetchTasks();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    await fetchTasks();
  };

  const SortIcon = ({ field }: { field: keyof Task }) => (
    <span className={`ml-1 text-xs ${sortField === field ? "text-pink-500" : "text-pink-200"}`}>
      {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  const statuses = ["All", "Not started", "In progress", "In review", "Handed-over"];
  const tags = ["All", "Tintin", "Nexus", "Halo"];
  const types = ["All", "⭐️ Feature", "📈 Improvement", "🔧 Fix"];

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Top bar */}
      <header className="bg-white border-b border-pink-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-400 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">✦</span>
          </div>
          <h1 className="text-lg font-semibold text-rose-700">Design Tracker</h1>
          <span className="text-pink-300 text-sm">{filtered.length} tasks</span>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white text-sm font-medium px-4 py-2 rounded-full transition-all shadow-sm"
        >
          <span className="text-base leading-none">+</span> New task
        </button>
      </header>

      {/* Filters */}
      <div className="bg-white border-b border-pink-100 px-6 py-3 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300 text-sm">🔍</span>
          <input
            className="pl-8 pr-3 py-1.5 border border-pink-200 rounded-full text-sm w-56 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-pink-50 placeholder-pink-300"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-pink-400 font-medium">Status:</span>
          <div className="flex gap-1">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? "bg-pink-500 text-white" : "text-pink-400 hover:bg-pink-100"}`}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* Tag filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-pink-400 font-medium">Tag:</span>
          <div className="flex gap-1">
            {tags.map(t => (
              <button
                key={t}
                onClick={() => setFilterTag(t)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${filterTag === t ? "bg-pink-500 text-white" : "text-pink-400 hover:bg-pink-100"}`}
              >{t}</button>
            ))}
          </div>
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-pink-400 font-medium">Type:</span>
          <div className="flex gap-1">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${filterType === t ? "bg-pink-500 text-white" : "text-pink-400 hover:bg-pink-100"}`}
              >{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
                  <th className="text-left px-4 py-3 font-medium text-pink-300 w-8">
                    <span className="text-xs">#</span>
                  </th>
                  <th
                    className="text-left px-4 py-3 font-medium text-pink-400 cursor-pointer hover:text-rose-500 min-w-[200px]"
                    onClick={() => handleSort("taskName")}
                  >Task <SortIcon field="taskName" /></th>
                  <th className="text-left px-4 py-3 font-medium text-pink-400 min-w-[80px]">Tag</th>
                  <th
                    className="text-left px-4 py-3 font-medium text-pink-400 cursor-pointer hover:text-rose-500 min-w-[110px]"
                    onClick={() => handleSort("status")}
                  >Status <SortIcon field="status" /></th>
                  <th className="text-left px-4 py-3 font-medium text-pink-400 min-w-[90px]">Type</th>
                  <th
                    className="text-left px-4 py-3 font-medium text-pink-400 cursor-pointer hover:text-rose-500 min-w-[110px]"
                    onClick={() => handleSort("assignee")}
                  >Assignee <SortIcon field="assignee" /></th>
                  <th
                    className="text-left px-4 py-3 font-medium text-pink-400 cursor-pointer hover:text-rose-500 min-w-[105px]"
                    onClick={() => handleSort("delivery")}
                  >Delivery <SortIcon field="delivery" /></th>
                  <th className="text-left px-4 py-3 font-medium text-pink-400 min-w-[110px]">Received By</th>
                  <th className="text-left px-4 py-3 font-medium text-pink-400 min-w-[100px]">Links</th>
                  <th
                    className="text-left px-4 py-3 font-medium text-pink-400 cursor-pointer hover:text-rose-500 min-w-[105px]"
                    onClick={() => handleSort("updatedAt")}
                  >Updated <SortIcon field="updatedAt" /></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-pink-300">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-pink-300">
                      No tasks found
                    </td>
                  </tr>
                ) : filtered.map((task, i) => (
                  <tr
                    key={String(task._id)}
                    onClick={() => openEdit(task)}
                    className="border-b border-pink-50 hover:bg-pink-50/70 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3 text-pink-200 text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-rose-800 group-hover:text-pink-600 transition-colors">
                        {task.taskName}
                      </div>
                      {task.description && (
                        <div className="text-pink-300 text-xs mt-0.5 line-clamp-1">{task.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {task.tags && <Badge label={task.tags} styleMap={TAG_STYLES} />}
                    </td>
                    <td className="px-4 py-3">
                      {task.status && <Badge label={task.status} styleMap={STATUS_STYLES} />}
                    </td>
                    <td className="px-4 py-3">
                      {task.taskType && <Badge label={task.taskType} styleMap={TYPE_STYLES} />}
                    </td>
                    <td className="px-4 py-3 text-rose-700">{task.assignee || "—"}</td>
                    <td className="px-4 py-3 text-rose-700 whitespace-nowrap">{formatDate(task.delivery)}</td>
                    <td className="px-4 py-3 text-rose-700 text-xs">{task.receivedBy || "—"}</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {task.attachFile && (
                          <a href={task.attachFile} target="_blank" rel="noopener noreferrer"
                            className="text-pink-500 hover:text-pink-700 text-xs font-medium hover:underline"
                            title="Figma">Figma</a>
                        )}
                        {task.productDoc && (
                          <a href={task.productDoc} target="_blank" rel="noopener noreferrer"
                            className="text-fuchsia-500 hover:text-fuchsia-700 text-xs font-medium hover:underline"
                            title="Product Doc">Doc</a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-pink-300 text-xs whitespace-nowrap">{formatDate(task.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <TaskModal
          task={modalTask}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
