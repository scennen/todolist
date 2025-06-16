import React, { useState } from 'react';
import '../styles.css';

const TrashModal = ({ tasks, onClose, onRestore, onDeleteForever }) => {
  const [loadingId, setLoadingId] = useState(null);

  const handleRestore = async (id) => {
    setLoadingId(id);
    await onRestore(id);
    setLoadingId(null);
  };

  const handleDelete = async (id) => {
    setLoadingId(id);
    await onDeleteForever(id);
    setLoadingId(null);
  };

  return (
    <div className="modal trash-modal">
      <div className="modal-content trash-modal-content">
        <h2 className="modal-title" style={{ marginBottom: 18, color: '#222', fontWeight: 600 }}>
          Удалённые задачи
        </h2>
        {tasks.length === 0 ? (
          <div className="trash-empty" style={{ color: '#888', textAlign: 'center', margin: '32px 0 24px', fontSize: 17 }}>
            Нет удалённых задач
          </div>
        ) : (
          <ul className="trash-list">
            {tasks.map(t => (
              <li key={t.id} className="trash-item" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 0', borderBottom: '1px solid #f0f0f0', gap: 12
              }}>
                <div className="trash-title" style={{ fontSize: 16, color: '#444', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                <div className="trash-actions" style={{ display: 'flex', gap: 10 }}>
                  <button className="trash-restore" title="Восстановить" style={{
                    background: '#e5f6e5', color: '#1a7f37', border: 'none', borderRadius: 7, padding: '7px 14px', fontWeight: 500, fontSize: 15, cursor: loadingId === t.id ? 'not-allowed' : 'pointer', transition: 'all 0.18s', opacity: loadingId === t.id ? 0.6 : 1
                  }} onClick={() => handleRestore(t.id)} disabled={loadingId === t.id}>
                    {loadingId === t.id ? '...' : 'Восстановить'}
                  </button>
                  <button className="trash-delete" title="Удалить навсегда" style={{
                    background: '#fdeaea', color: '#c00', border: 'none', borderRadius: 7, padding: '7px 14px', fontWeight: 500, fontSize: 15, cursor: loadingId === t.id ? 'not-allowed' : 'pointer', transition: 'all 0.18s', opacity: loadingId === t.id ? 0.6 : 1
                  }} onClick={() => handleDelete(t.id)} disabled={loadingId === t.id}>
                    {loadingId === t.id ? '...' : 'Удалить'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <button className="modal-close-btn" style={{
          marginTop: 28, background: '#f5f5f5', color: '#444', border: 'none', borderRadius: 8, padding: '12px 0', width: '100%', fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'background 0.18s'
        }} onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default TrashModal;