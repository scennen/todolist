import React from 'react';
import { Icons } from '../icons/Icons';
import '../styles.css';

const TaskViewModal = ({ task, onClose }) => {
  const getPriority = (priority) => {
    if (priority === 'high') return <span className="task-view-priority-high">Высокий</span>;
    if (priority === 'medium') return <span className="task-view-priority-medium">Средний</span>;
    return <span className="task-view-priority-low">Низкий</span>;
  };

  return (
    <div className="modal task-view-modal">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">{task.title}</div>
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Закрыть"
          >
            <Icons.Close className="icon" style={{ width: 22, height: 22 }} />
          </button>
        </div>
        {task.description && (
          <div className="task-view-desc">{task.description}</div>
        )}
        <div className="task-view-row">
          <span className="task-view-label">Приоритет:</span>
          <span className="task-view-value">{getPriority(task.priority)}</span>
        </div>
        <div className="task-view-row">
          <span className="task-view-label">Дедлайн:</span>
          <span className="task-view-value">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</span>
        </div>
        {/* Кнопка "Закрыть" убрана, только крестик */}
      </div>
    </div>
  );
};

export default TaskViewModal;
