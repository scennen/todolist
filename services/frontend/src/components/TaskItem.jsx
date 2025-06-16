import React, { useState, useEffect } from 'react';
import TaskViewModal from './TaskViewModal';
import { Icons } from '../icons/Icons';
import '../styles.css';

const TaskItem = ({ task, onEdit, onDelete, onToggleComplete }) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [priorityName, setPriorityName] = useState('');
  const [statusName, setStatusName] = useState('');
  
  useEffect(() => {
    // Загружаем приоритеты и статусы
    const fetchData = async () => {
      try {
        const [prioritiesRes, statusesRes] = await Promise.all([
          fetch('/api/priorities/'),
          fetch('/api/statuses/')
        ]);
        if (prioritiesRes.ok && statusesRes.ok) {
          const priorities = await prioritiesRes.json();
          const statuses = await statusesRes.json();
          
          // Находим имя приоритета по ID
          const priority = priorities.find(p => p.id === task.priority);
          if (priority) {
            setPriorityName(priority.name.toLowerCase());
          }
          
          // Находим имя статуса по ID
          const status = statuses.find(s => s.id === task.status);
          if (status) {
            setStatusName(status.name.toLowerCase());
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке приоритетов/статусов:', error);
      }
    };
    
    fetchData();
  }, [task.priority, task.status]);

  const priorityCircle = {
    high: <span className="priority-circle priority-high" title="Высокий" />,
    medium: <span className="priority-circle priority-medium" title="Средний" />,
    low: <span className="priority-circle priority-low" title="Низкий" />,
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const contextMenuItems = (
    <div className="task-context-menu" style={contextMenu ? { top: contextMenu.y, left: contextMenu.x, position: 'fixed', zIndex: 999 } : {}}>
      <button 
        onClick={() => {
          onToggleComplete(task.id);
          handleCloseContextMenu();
        }}
      >
        <input 
          type="checkbox" 
          checked={task.completed} 
          onChange={() => {}} // Controlled component
        />
        {task.completed ? 'Отметить как невыполненное' : 'Отметить как выполненное'}
      </button>
      
      <button 
        onClick={() => {
          onEdit(task);
          handleCloseContextMenu();
        }}
      >
        <Icons.Edit className="icon" />
        Редактировать
      </button>

      <button 
        className="delete-btn" 
        onClick={() => {
          onDelete(task.id);
          handleCloseContextMenu();
        }}
      >
        <Icons.Bin className="icon" />
        Удалить
      </button>
    </div>
  );

  return (
    <>
      <tr
        className={task.completed ? 'completed' : ''}
        onClick={() => { if (task.description) setShowInfo(true); }}
        onContextMenu={handleContextMenu}
        style={{ cursor: task.description ? 'pointer' : 'default' }}
      >
        <td>
          <input
            type="checkbox"
            checked={task.completed}
            onClick={e => e.stopPropagation()}
            onChange={() => onToggleComplete(task.id)}
          />
          <span className="task-title-text">{task.title}</span>
        </td>
        <td>{priorityCircle[priorityName]}</td>
        <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : ''}</td>
        <td className="task-actions-cell">
          <div className="task-actions-wrapper">
            <button onClick={e => { e.stopPropagation(); onEdit(task); }}>
              <Icons.Edit className="icon" />
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(task.id); }}>
              <Icons.Bin className="icon" />
            </button>
          </div>
        </td>
      </tr>
      {showInfo && (
        <TaskViewModal 
          task={{
            ...task,
            priority: priorityName,
            dueDate: task.due_date
          }} 
          onClose={() => setShowInfo(false)} 
        />
      )}
      {contextMenu && (
        <>
          <div className="task-context-menu-overlay" onClick={handleCloseContextMenu} />
          {contextMenuItems}
        </>
      )}
    </>
  );
};

export default TaskItem;