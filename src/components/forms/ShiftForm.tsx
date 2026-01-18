import { useState } from 'react';
import type { Shift } from '../../types/erp';
import { ShiftSchema } from '../../forms/schemas';

interface ShiftFormProps {
  initial?: Shift;
  onSubmit: (data: Omit<Shift, 'id'>) => Promise<void>;
}

function ShiftForm({ initial, onSubmit }: ShiftFormProps) {
  const [formData, setFormData] = useState<Omit<Shift, 'id'>>({
    start: initial?.start || '',
    end: initial?.end || '',
    hourlyRate: initial?.hourlyRate || 0,
    notes: initial?.notes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = ShiftSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => {
        const path = err.path.join('.');
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('ShiftForm submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Start (YYYY-MM-DD HH:MM)</label>
        <input
          type="text"
          placeholder="2024-01-15 09:00"
          value={formData.start}
          onChange={e => setFormData({ ...formData, start: e.target.value })}
        />
        {errors.start && <span className="error-text">{errors.start}</span>}
      </div>

      <div className="form-group">
        <label>End (YYYY-MM-DD HH:MM)</label>
        <input
          type="text"
          placeholder="2024-01-15 17:00"
          value={formData.end}
          onChange={e => setFormData({ ...formData, end: e.target.value })}
        />
        {errors.end && <span className="error-text">{errors.end}</span>}
      </div>

      <div className="form-group">
        <label>Hourly Rate (JOD)</label>
        <input
          type="number"
          step="0.01"
          value={formData.hourlyRate}
          onChange={e => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
        />
        {errors.hourlyRate && <span className="error-text">{errors.hourlyRate}</span>}
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
        {errors.notes && <span className="error-text">{errors.notes}</span>}
      </div>

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? 'Saving…' : 'Save Shift'}
      </button>
    </form>
  );
}

export default ShiftForm;
