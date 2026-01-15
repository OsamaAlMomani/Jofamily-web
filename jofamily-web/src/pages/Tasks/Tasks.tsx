import { useEffect, useMemo, useState } from 'react';
import './Tasks.css';
import { useAuth } from '../../core';
import {
  awardPoints,
  createTask,
  listenToLeaderboard,
  listenToTasks,
  updateTaskStatus,
} from '../../services';
import type { Task, TaskPriority, UserStats } from '../../types/tasks';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [points, setPoints] = useState(10);
  const [dueDate, setDueDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'mine' | 'assigned'>('all');

  useEffect(() => {
    const unsub = listenToTasks(setTasks);
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = listenToLeaderboard(setLeaderboard);
    return () => unsub();
  }, []);

  const filteredTasks = useMemo(() => {
    if (!user) return [];
    if (filter === 'mine') return tasks.filter((t) => t.assignedTo === user.uid);
    if (filter === 'assigned') return tasks.filter((t) => t.assignedBy === user.uid);
    return tasks;
  }, [tasks, filter, user]);

  const myStats = useMemo(() => {
    if (!user) return null;
    return leaderboard.find((s) => s.userId === user.uid) ?? null;
  }, [leaderboard, user]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !title.trim() || !assignedTo.trim()) return;
    setCreating(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        assignedTo: assignedTo.trim(),
        assignedBy: user.uid,
        priority,
        points,
        dueDate: dueDate ? new Date(dueDate) : null,
      });
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setPriority('medium');
      setPoints(10);
      setDueDate('');
    } finally {
      setCreating(false);
    }
  }

  async function handleComplete(task: Task) {
    if (!user || task.assignedTo !== user.uid) return;
    await updateTaskStatus(task.id, 'completed');
    await awardPoints(user.uid, user.email ?? 'User', task.points);
  }

  async function handleStatusChange(taskId: string, status: 'pending' | 'in-progress') {
    await updateTaskStatus(taskId, status);
  }

  if (!user) {
    return (
      <div className="tasks-page">
        <header className="tasks-hero">
          <div className="tasks-hero__content">
            <p className="eyebrow">Feature 3 · Sign in required</p>
            <h1>Family Task & Chore Management</h1>
            <p className="lede">Sign in to manage tasks and earn points.</p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="tasks-page">
      <header className="tasks-hero">
        <div className="tasks-hero__content">
          <p className="eyebrow">Feature 3 · In Progress</p>
          <h1>Family Task & Chore Management</h1>
          <p className="lede">Assign chores, track progress, and earn points with badges.</p>
          {myStats && (
            <div className="my-stats">
              <div className="stat-card">
                <div className="stat-value">{myStats.totalPoints}</div>
                <div className="stat-label">Points</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{myStats.completedTasks}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{myStats.badges.length}</div>
                <div className="stat-label">Badges</div>
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="tasks-grid">
        <aside className="tasks-sidebar">
          <div className="sidebar-card">
            <h2>Create Task</h2>
            <form onSubmit={handleCreate} className="task-form">
              <label>
                Title
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Do the dishes" />
              </label>
              <label>
                Description
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional details"
                  rows={2}
                />
              </label>
              <label>
                Assign to (User ID)
                <input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder={user.uid} />
              </label>
              <label>
                Priority
                <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label>
                Points
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  min="1"
                  max="100"
                />
              </label>
              <label>
                Due Date
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </label>
              <button type="submit" disabled={!title.trim() || !assignedTo.trim() || creating}>
                {creating ? 'Creating…' : 'Create Task'}
              </button>
            </form>
          </div>

          <div className="sidebar-card">
            <h2>Leaderboard</h2>
            <div className="leaderboard">
              {leaderboard.slice(0, 5).map((stat, idx) => (
                <div key={stat.userId} className="leaderboard-item">
                  <div className="rank">#{idx + 1}</div>
                  <div className="user-info">
                    <div className="user-name">{stat.userName}</div>
                    <div className="user-points">{stat.totalPoints} pts</div>
                  </div>
                  {stat.badges.length > 0 && <div className="badge-count">🏆 {stat.badges.length}</div>}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="tasks-main">
          <div className="tasks-filters">
            <button className={filter === 'all' ? 'filter-btn active' : 'filter-btn'} onClick={() => setFilter('all')}>
              All Tasks
            </button>
            <button
              className={filter === 'mine' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('mine')}
            >
              My Tasks
            </button>
            <button
              className={filter === 'assigned' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('assigned')}
            >
              Assigned by Me
            </button>
          </div>

          <div className="tasks-list">
            {filteredTasks.length === 0 && <p className="muted">No tasks yet. Create one to get started.</p>}
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`task-card task-card--${task.priority} task-card--${task.status}`}
              >
                <div className="task-header">
                  <div className="task-title">{task.title}</div>
                  <div className="task-points">+{task.points} pts</div>
                </div>
                {task.description && <div className="task-desc">{task.description}</div>}
                <div className="task-meta">
                  <span className={`priority-badge priority-badge--${task.priority}`}>{task.priority}</span>
                  <span className={`status-badge status-badge--${task.status}`}>{task.status}</span>
                  {task.dueDate && (
                    <span className="due-date">
                      Due: {task.dueDate.toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="task-actions">
                  {task.assignedTo === user.uid && task.status !== 'completed' && (
                    <>
                      {task.status === 'pending' && (
                        <button
                          type="button"
                          className="task-btn task-btn--start"
                          onClick={() => handleStatusChange(task.id, 'in-progress')}
                        >
                          Start
                        </button>
                      )}
                      {task.status === 'in-progress' && (
                        <button type="button" className="task-btn task-btn--complete" onClick={() => handleComplete(task)}>
                          Mark Complete
                        </button>
                      )}
                    </>
                  )}
                  {task.status === 'completed' && task.completedAt && (
                    <div className="completed-stamp">✓ Completed {task.completedAt.toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </section>
    </div>
  );
}
