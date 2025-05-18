import React from 'react';

export default function TaskTable({
  tasks,
  onToggleDone,
  onDelete,
  onEdit,
  onToggleDescription,
  onSort,
  sortField,
  sortAsc,
}) {
  function renderSortArrow(field) {
    if (sortField !== field) return null;
    return sortAsc ? '▲' : '▼';
  }

  return (
    <table className="tasks-table">
      <thead>
        <tr>
          <th></th>
          <th data-sort="title" onClick={() => onSort('title')}>Задание {renderSortArrow('title')}</th>
          <th data-sort="priority" onClick={() => onSort('priority')}>Приоритет {renderSortArrow('priority')}</th>
          <th data-sort="dueDate" onClick={() => onSort('dueDate')}>Дата {renderSortArrow('dueDate')}</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map(t => (
          <React.Fragment key={t.id}>
            <tr className={t.done ? 'completed' : ''}>
              <td>
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => onToggleDone(t.id)}
                />
              </td>
              <td style={{ textDecoration: t.done ? 'line-through' : 'none' }}>
                {t.title}
              </td>
              <td>
                <span className={`priority-dot ${t.priority}`}></span>
              </td>
              <td>{t.dueDate}</td>
              <td>
                <button className="action-btn" onClick={() => onEdit(t.id)}>
                  <img src="/img/icon/edit.svg" alt="Edit" />
                </button>
                <button className="action-btn" onClick={() => onDelete(t.id)}>
                  <img src="/img/icon/bin.svg" alt="Delete" />
                </button>
              </td>
            </tr>
            {t.showDescription && (
              <tr>
                <td colSpan="5" className="description-row">
                  <div className="description-toggle" onClick={() => onToggleDescription(t.id)}>🔽</div>
                  <p>{t.description}</p>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}