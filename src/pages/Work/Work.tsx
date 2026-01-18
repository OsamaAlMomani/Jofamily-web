import { useEffect, useMemo, useState } from 'react';
import { getShifts, addShift, updateShift, deleteShift } from '../../services/erpService';
import type { Shift } from '../../types/erp';
import { format } from 'date-fns';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import ShiftForm from '../../components/forms/ShiftForm';
import '../Studies/Studies.css';

function hoursFromShift(shift: Shift) {
  const start = new Date(shift.start).getTime();
  const end = new Date(shift.end).getTime();
  return Math.max(0, (end - start) / 3600000);
}

function weekLabel(date: Date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`;
}

function Work() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);
  const weeklyLimit = 20;

  async function load() {
    setLoading(true);
    const data = await getShifts();
    setShifts(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const metrics = useMemo(() => {
    const totalHours = shifts.reduce((s, sh) => s + hoursFromShift(sh), 0);
    const income = shifts.reduce((s, sh) => s + hoursFromShift(sh) * sh.hourlyRate, 0);
    const latestWeekHours = (() => {
      const now = new Date();
      const ws = new Date(now);
      ws.setDate(now.getDate() - now.getDay());
      const we = new Date(ws);
      we.setDate(ws.getDate() + 7);
      return shifts.reduce((sum, sh) => {
        const st = new Date(sh.start);
        const en = new Date(sh.end);
        if (st >= ws && en <= we) return sum + hoursFromShift(sh);
        return sum;
      }, 0);
    })();
    return { totalHours, income, latestWeekHours };
  }, [shifts]);

  const chartData = useMemo(() => {
    const byWeek: Record<string, { label: string; hours: number; income: number }> = {};
    shifts.forEach(sh => {
      const lbl = weekLabel(new Date(sh.start));
      if (!byWeek[lbl]) byWeek[lbl] = { label: lbl, hours: 0, income: 0 };
      const h = hoursFromShift(sh);
      byWeek[lbl].hours += h;
      byWeek[lbl].income += h * sh.hourlyRate;
    });
    return Object.values(byWeek);
  }, [shifts]);

  async function handleSave(data: Omit<Shift, 'id'>) {
    if (editing) {
      await updateShift(editing.id!, data);
    } else {
      await addShift(data);
    }
    await load();
    setShowModal(false);
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this shift?')) {
      await deleteShift(id);
      await load();
    }
  }

  return (
    <div className="studies-container">
      <div className="studies-header">
        <h2>Work</h2>
        <p>Shifts, Hourly rate, Income estimation, Limits</p>
      </div>

      {loading && <div>Loading shifts…</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Hours</h3>
          <div className="value">{metrics.totalHours.toFixed(1)}</div>
          <div className="variance">All time</div>
        </div>
        <div className="stat-card">
          <h3>Total Income</h3>
          <div className="value">${metrics.income.toFixed(0)}</div>
          <div className="variance">All time</div>
        </div>
        <div className="stat-card">
          <h3>This Week</h3>
          <div className="value">{metrics.latestWeekHours.toFixed(1)} / {weeklyLimit}</div>
          <div className={`variance ${metrics.latestWeekHours > weeklyLimit ? 'negative' : 'positive'}`}>
            {metrics.latestWeekHours > weeklyLimit ? 'Over limit' : 'Within limit'}
          </div>
        </div>
      </div>

      <div className="studies-section">
        <h3 style={{ marginBottom: '1rem' }}>Weekly Analytics</h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" interval={0} angle={-20} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#60a5fa" name="Hours" />
              <Bar dataKey="income" fill="#34d399" name="Income" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="studies-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Shifts</h3>
          <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
            ➕ Add Shift
          </button>
        </div>
        <table className="studies-table">
          <thead>
            <tr>
              <th>Start</th>
              <th>End</th>
              <th>Hours</th>
              <th>Rate</th>
              <th>Income</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map(sh => {
              const hrs = hoursFromShift(sh);
              return (
                <tr key={sh.id || sh.start}>
                  <td>{format(new Date(sh.start), 'yyyy-MM-dd HH:mm')}</td>
                  <td>{format(new Date(sh.end), 'yyyy-MM-dd HH:mm')}</td>
                  <td>{hrs.toFixed(1)}</td>
                  <td>${sh.hourlyRate}</td>
                  <td>${(hrs * sh.hourlyRate).toFixed(0)}</td>
                  <td>
                    <button className="btn-secondary" onClick={() => { setEditing(sh); setShowModal(true); }} style={{ marginRight: 8 }}>
                      Edit
                    </button>
                    <button className="btn-danger" onClick={() => handleDelete(sh.id!)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem' }}>{editing ? 'Edit Shift' : 'Add Shift'}</h3>
            <ShiftForm
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

export default Work;
