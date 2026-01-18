import { useEffect, useMemo, useState } from 'react';
import { getDocuments, addDocument, updateDocument, deleteDocument } from '../../services/erpService';
import type { Document } from '../../types/erp';
import { format, differenceInDays } from 'date-fns';
import DocumentForm from '../../components/forms/DocumentForm';
import '../Studies/Studies.css';

function Admin() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Document | null>(null);

  async function load() {
    setLoading(true);
    const data = await getDocuments();
    setDocs(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const metrics = useMemo(() => {
    const expiring30 = docs.filter(d => d.expiryDate && differenceInDays(new Date(d.expiryDate), new Date()) <= 30).length;
    const expired = docs.filter(d => d.expiryDate && differenceInDays(new Date(d.expiryDate), new Date()) < 0).length;
    return { total: docs.length, expiring30, expired };
  }, [docs]);

  async function handleSave(data: Omit<Document, 'id'>) {
    if (editing) {
      await updateDocument(editing.id!, data);
    } else {
      await addDocument(data);
    }
    await load();
    setShowModal(false);
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this document?')) {
      await deleteDocument(id);
      await load();
    }
  }

  return (
    <div className="studies-container">
      <div className="studies-header">
        <h2>Admin / Visa</h2>
        <p>Documents, Expiry dates, Checklists, Reminders</p>
      </div>

      {loading && <div>Loading documents…</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Docs</h3>
          <div className="value">{metrics.total}</div>
        </div>
        <div className="stat-card">
          <h3>Expiring ≤30d</h3>
          <div className="value">{metrics.expiring30}</div>
        </div>
        <div className="stat-card">
          <h3>Expired</h3>
          <div className={`value ${metrics.expired > 0 ? 'negative' : ''}`}>{metrics.expired}</div>
        </div>
      </div>

      <div className="studies-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Documents</h3>
          <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
            ➕ Add Document
          </button>
        </div>
        <table className="studies-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Related</th>
              <th>Status</th>
              <th>Expiry</th>
              <th>Days Left</th>
              <th>Link</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map(d => {
              const daysLeft = d.expiryDate ? differenceInDays(new Date(d.expiryDate), new Date()) : null;
              return (
                <tr key={d.id || d.name}>
                  <td>{d.name}</td>
                  <td>{d.relatedTo}</td>
                  <td>{d.status}</td>
                  <td>{d.expiryDate ? format(new Date(d.expiryDate), 'yyyy-MM-dd') : '—'}</td>
                  <td style={{ color: daysLeft !== null && daysLeft < 0 ? 'red' : 'inherit' }}>
                    {daysLeft === null ? '—' : `${daysLeft}d`}
                  </td>
                  <td>
                    {d.fileUrl ? <a href={d.fileUrl} target="_blank" rel="noreferrer">Open</a> : '—'}
                  </td>
                  <td>
                    <button className="btn-secondary" onClick={() => { setEditing(d); setShowModal(true); }} style={{ marginRight: 8 }}>
                      Edit
                    </button>
                    <button className="btn-danger" onClick={() => handleDelete(d.id!)}>
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
            <h3 style={{ marginBottom: '1rem' }}>{editing ? 'Edit Document' : 'Add Document'}</h3>
            <DocumentForm
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

export default Admin;
