import React, { useState, useEffect } from 'react';

export default function TaskModal({ task, onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('high');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setDueDate(task.dueDate);
    } else {
      setTitle('');
      setDescription('');
      setPriority('high');
      setDueDate('');
    }
  }, [task]);

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      title,
      description,
      priority,
      dueDate,
      done: task ? task.done : false,
      showDescription: task ? task.showDescription : false,
    });
  }

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <h2>{task ? 'Редактировать задачу' : 'Добавить задачу'}</h2>
        <form id="task-form" onSubmit={handleSubmit}>
          <label>
            Задание:
            <input
              type="text"
              id="task-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </label>
          <label>
            Описание:
            <textarea
              id="task-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
            ></textarea>
          </label>
          <label>
            Приоритет:
            <select
              id="task-priority"
              value={priority}
              onChange={e => setPriority(e.target.value)}
            >
              <option value="high">Высокий</option>
              <option value="medium">Средний</option>
              <option value="low">Низкий</option>
            </select>
          </label>
          <label>
            Дата:
            <input
              type="date"
              id="task-date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
            />
          </label>
          <div className="modal-actions">
            <button type="submit">Сохранить</button>
            <button type="button" id="cancel-btn" onClick={onClose}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}