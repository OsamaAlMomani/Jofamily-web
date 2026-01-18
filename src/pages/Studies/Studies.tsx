import { useEffect, useMemo, useState } from 'react';
import { getTasks, addTask, updateTask, deleteTask } from '../../services/erpService';
import type { Task } from '../../types/erp';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import TaskForm from '../../components/forms/TaskForm';
import './Studies.css';

function Studies() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  async function load() {
    setLoading(true);
    const data = await getTasks();
    setTasks(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const metrics = useMemo(() => {
    const open = tasks.filter(t => !t.done).length;
    const totalHours = tasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);
    const doneHours = tasks.filter(t => t.done).reduce((s, t) => s + (t.estimatedHours || 0), 0);
    return { open, total: tasks.length, totalHours, doneHours };
  }, [tasks]);

  const chartData = useMemo(() => {
    const byType: Record<string, { type: string; hours: number; count: number }> = {};
    tasks.forEach(t => {
      if (!byType[t.type]) byType[t.type] = { type: t.type, hours: 0, count: 0 };
      byType[t.type].hours += t.estimatedHours || 0;
      byType[t.type].count += 1;
    });
    return Object.values(byType);
  }, [tasks]);

  async function handleSave(data: Omit<Task, 'id'>) {
    if (editing) {
      await updateTask(editing.id!, data);
    } else {
      await addTask(data);
    }
    await load();
    setShowModal(false);
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this task?')) {
      await deleteTask(id);
      await load();
    }
  }

  async function handleToggleDone(task: Task) {
    await updateTask(task.id!, { done: !task.done });
    await load();
  }

  return (
    <div className="studies-container">
      <div className="studies-header">
        <h2>Studies</h2>
        <p>Courses, Assignments, Exam dates, Weekly plan</p>
      </div>

      {loading && <div>Loading study tasks…</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Open Tasks</h3>
          <div className="value">{metrics.open}</div>
          <div className="variance">{metrics.total} total</div>
        </div>
        <div className="stat-card">
          <h3>Planned Hours</h3>
          <div className="value">{metrics.totalHours}</div>
          <div className="variance">{metrics.doneHours} completed</div>
        </div>
      </div>

      <div className="studies-section">
        <h3 style={{ marginBottom: '1rem' }}>Task Analytics</h3>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#60a5fa" name="Hours" />
              <Bar dataKey="count" fill="#a78bfa" name="Tasks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="studies-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Tasks</h3>
          <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
            ➕ Add Task
          </button>
        </div>
        <table className="studies-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Due</th>
              <th>Type</th>
              <th>Est. Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id || t.title}>
                <td>{t.title}</td>
                <td>{t.dueDate}</td>
                <td>{t.type}</td>
                <td>{t.estimatedHours || 0}</td>
                <td>
                  <span className={`badge ${t.done ? 'badge-done' : 'badge-open'}`}>
                    {t.done ? 'Done' : 'Open'}
                  </span>
                </td>
                <td>
                  <button className="btn-secondary" onClick={() => handleToggleDone(t)} style={{ marginRight: 8 }}>
                    {t.done ? 'Undo' : 'Mark Done'}
                  </button>
                  <button className="btn-secondary" onClick={() => { setEditing(t); setShowModal(true); }} style={{ marginRight: 8 }}>
                    Edit
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(t.id!)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem' }}>{editing ? 'Edit Task' : 'Add Task'}</h3>
            <TaskForm
              initial={editing || undefined}
              onSubmit={handleSave}
            />
            <button className="btn-secondary" onClick={() => setShowModal(false)} style={{ marginTop: '1rem' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Studies;
