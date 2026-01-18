import { useState } from 'react';
import type { FinanceRecord } from '../../types/finance';
import './FinanceModal.css';

interface FinanceModalProps {
  record?: FinanceRecord;
  onClose: () => void;
  onSave: (record: Omit<FinanceRecord, 'id' | 'variance'>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export default function FinanceModal({ record, onClose, onSave, onDelete }: FinanceModalProps) {
  const [month, setMonth] = useState(record?.month || '');
  const [category, setCategory] = useState(record?.category || 'Revenue');
  const [expected, setExpected] = useState(record?.expected.toString() || '');
  const [actual, setActual] = useState(record?.actual.toString() || '');
  const [notes, setNotes] = useState(record?.notes || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const expectedNum = parseFloat(expected) || 0;
  const actualNum = parseFloat(actual) || 0;
  const variance = actualNum - expectedNum;
  const percentDiff = expectedNum > 0 ? ((variance / expectedNum) * 100) : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!month || expectedNum === 0 || actualNum === 0) {
      alert('Please fill in all required fields with valid numbers');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        month,
        category,
        expected: expectedNum,
        actual: actualNum,
        notes
      });
      onClose();
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Failed to save record. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!record?.id || !onDelete) return;
    
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    setDeleting(true);
    try {
      await onDelete(record.id);
      onClose();
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Failed to delete record. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {record ? 'Edit Finance Record' : 'Add Finance Record'}
          </h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="month">Month *</label>
            <input
              type="text"
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="e.g., Jan 2026"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="Revenue">Revenue</option>
              <option value="Expenses">Expenses</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
              <option value="Salaries">Salaries</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expected">Expected Amount *</label>
              <input
                type="number"
                id="expected"
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                placeholder="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="actual">Actual Amount *</label>
              <input
                type="number"
                id="actual"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                placeholder="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="calculated-field">
              <div className="calculated-label">Live Calculation</div>
              <div className="calculated-value">
                Variance: <span className={variance >= 0 ? 'positive' : 'negative'}>
                  {formatCurrency(Math.abs(variance))} {variance >= 0 ? '▲' : '▼'}
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginTop: '0.5rem' }}>
                {variance >= 0 ? 'Above' : 'Below'} expected by {Math.abs(percentDiff).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or comments..."
            />
          </div>

          <div className="modal-actions">
            {record && onDelete && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting || saving}
              >
                {deleting ? 'Deleting...' : '🗑️ Delete'}
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={saving || deleting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || deleting}
            >
              {saving ? 'Saving...' : (record ? '💾 Update' : '➕ Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
