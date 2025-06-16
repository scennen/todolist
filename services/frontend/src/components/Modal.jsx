import React, { useState, useEffect, useRef } from 'react';

const TaskModal = ({ 
  task, 
  project, 
  onSave, 
  onClose, 
  onTasksReload
}) => {
  // Состояния формы
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('high');
  const [dueDate, setDueDate] = useState('');
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiFiles, setAIFiles] = useState([]);
  const [aiLoading, setAILoading] = useState(false);
  const [aiError, setAIError] = useState(null);
  const titleInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [priorities, setPriorities] = useState([]);
  const [statuses, setStatuses] = useState([]);

  // Инициализация полей при открытии
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority || 'medium'); // по умолчанию средний
      setDueDate(task.dueDate || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium'); // по умолчанию средний
      setDueDate('');
    }
    setEditingTitle(false);
  }, [task]);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [editingTitle]);

  useEffect(() => {
    fetch('/api/priorities/').then(r => r.json()).then(setPriorities);
    fetch('/api/statuses/').then(r => r.json()).then(setStatuses);
  }, []);

  // Обработчик сохранения
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      if (titleInputRef.current) titleInputRef.current.focus();
      return;
    }
    // Получаем id для priority и status
    const priorityObj = priorities.find(
      p => (typeof priority === "string" && p.name.toLowerCase() === priority.toLowerCase()) ||
           (typeof priority === "number" && p.id === priority)
    );
    const statusObj = statuses.find(s => s.name.toLowerCase() === 'новая' || s.name.toLowerCase() === 'todo');
    const taskData = {
      title,
      description,
      priority: priorityObj ? priorityObj.id : undefined,
      status: statusObj ? statusObj.id : undefined,
      due_date: dueDate,
      project: project,
    };
    if (task && task.id) {
      taskData.id = task.id;
    }
    onSave(taskData);
    onClose();
  };

  // Ограничение года в дате до 4 цифр
  const handleDateInput = (e) => {
    const value = e.target.value;
    // value: yyyy-mm-dd
    const year = value.split('-')[0];
    if (year.length > 4) {
      // Обрезаем до 4 цифр
      const fixed = value.replace(/^(\d{4})\d+/, '$1');
      setDueDate(fixed);
    } else {
      setDueDate(value);
    }
  };

  // Цвет фона для select по приоритету
  const getPriorityBg = () => {
    if (priority === 'high') return { background: '#ffeaea' };
    if (priority === 'medium') return { background: '#fffbe6' };
    if (priority === 'low') return { background: '#eaffea' };
    return {};
  };

  // AI modal handlers
  const handleAIDrop = (e) => {
    e.preventDefault();
    setAIFiles(Array.from(e.dataTransfer.files));
  };
  const handleAIFileChange = (e) => {
    setAIFiles(Array.from(e.target.files));
  };
  const handleAIClose = () => {
    setShowAIModal(false);
    setAIFiles([]);
    onClose();
  };

  // AI file upload handler
  const handleAIUpload = async () => {
    if (!aiFiles.length) return;
    setAILoading(true);
    setAIError(null);
    const formData = new FormData();
    formData.append('file', aiFiles[0]);
    try {
      const response = await fetch('http://backend:8000/api/mistral/', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        setAIError(err.error || 'Ошибка загрузки файла');
        setAILoading(false);
        return;
      }
      if (onTasksReload) {
        await onTasksReload();
      }
      setShowAIModal(false);
      setAIFiles([]);
      setAILoading(false);
      onClose();
    } catch (e) {
      setAIError('Ошибка сети или сервера');
      setAILoading(false);
    }
  };

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        {!showAIModal ? (
          <>
            <h2 className="modal-title" style={{ fontSize: '1.35rem', marginBottom: 16, color: '#111', fontWeight: 700 }}>
              {task ? 'Редактировать задачу' : 'Добавить задачу'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Название задачи: фиксированная высота для предотвращения прыжка */}
              <div style={{ marginBottom: 8, minHeight: 36, height: 36, display: 'flex', alignItems: 'center' }}>
                {!editingTitle ? (
                  <div
                    className="task-title-placeholder"
                    style={{
                      fontSize: '1.12rem',
                      color: '#bbb',
                      fontWeight: 400,
                      minHeight: 32,
                      height: 32,
                      cursor: 'text',
                      padding: '4px 0',
                      userSelect: 'none',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onClick={() => setEditingTitle(true)}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setEditingTitle(true); }}
                    aria-label="Введите название задачи"
                  >
                    {title ? (
                      <span style={{ color: '#222', fontWeight: 400 }}>{title}</span>
                    ) : (
                      'Название задачи...'
                    )}
                  </div>
                ) : (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onBlur={() => setEditingTitle(false)}
                    placeholder=""
                    required
                    style={{
                      fontSize: '1.12rem',
                      fontWeight: 400,
                      color: '#222',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 0,
                      padding: '4px 0',
                      width: '100%',
                      outline: 'none',
                      margin: 0,
                      boxSizing: 'border-box',
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background 0.2s',
                    }}
                  />
                )}
              </div>

              {/* Только textarea для описания, без подписи, всегда minHeight */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ minHeight: 120, height: 120, width: '100%' }}>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Описание задачи..."
                    style={{ minHeight: 120, height: 120, maxHeight: 300, fontWeight: 400, fontSize: '1rem', marginTop: 0, marginBottom: 0, padding: '14px 16px', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Приоритет и срок выполнения в одной строке */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 10 }} className="priority-date-row">
                <label style={{ flex: 1, marginBottom: 0, gap: 6 }}>
                  Приоритет
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    onFocus={() => setPriorityMenuOpen(true)}
                    onBlur={() => setPriorityMenuOpen(false)}
                    className={priorityMenuOpen ? 'menu-open' : ''}
                    style={{ ...getPriorityBg(), fontFamily: 'Onest, sans-serif', fontWeight: 500, border: 'none', borderRadius: 8, padding: '10px 14px', transition: 'background 0.2s' }}
                  >
                    <option value="high">Высокий</option>
                    <option value="medium">Средний</option>
                    <option value="low">Низкий</option>
                  </select>
                </label>
                <label style={{ flex: 1, marginBottom: 0, gap: 6 }}>
                  Срок выполнения
                  <input
                    type="date"
                    value={dueDate}
                    onChange={handleDateInput}
                    required
                    maxLength={10}
                    style={{ fontFamily: 'Onest, sans-serif', fontWeight: 500, border: 'none', borderRadius: 8, padding: '10px 14px', background: '#eeeeee', color: '#333' }}
                    pattern="\\d{4}-\\d{2}-\\d{2}"
                    inputMode="numeric"
                  />
                </label>
              </div>              
              {/* Кнопки действий */}
              <div className="modal-actions" style={{ borderTop: 'none', marginTop: 10, paddingTop: 0, gap: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <button type="submit" className="modal-save-btn" style={{ fontFamily: 'Onest, sans-serif' }}>
                  {task ? 'Обновить' : 'Создать'}
                </button>
                <button 
                  type="button" 
                  className="modal-ai-btn" 
                  style={{
                    fontFamily: 'Onest, sans-serif',
                    background: '#fff',
                    color: '#888',
                    border: '2.5px solid #888',
                    borderRadius: 7,
                    padding: '8px 20px',
                    fontSize: 15,
                    cursor: 'pointer',
                    fontWeight: 600,
                    boxShadow: 'none',
                  }}
                  onClick={() => setShowAIModal(true)}
                >
                  AI
                </button>
                <button type="button" className="modal-cancel-btn" onClick={onClose} style={{ fontFamily: 'Onest, sans-serif' }}>Отмена</button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div style={{ 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 24
            }}>
              <h2 style={{ 
                fontSize: '1.35rem', 
                color: '#111', 
                marginBottom: 8, 
                fontWeight: 700 
              }}>
                Загрузка файлов для AI
              </h2>
              <div
                onDrop={handleAIDrop}
                onDragOver={e => e.preventDefault()}
                style={{ 
                  border: '2px dashed #4f8cff',
                  borderRadius: 10,
                  padding: '40px 32px',
                  width: '100%',
                  textAlign: 'center',
                  background: '#f8faff',
                  color: '#4f8cff',
                  cursor: 'pointer',
                  minHeight: 140,
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15
                }}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                {aiFiles.length === 0 ? (
                  <>
                    Перетащите файлы сюда или <span style={{ textDecoration: 'underline', cursor: 'pointer', marginLeft: 4 }}>выберите</span>
                    <input
                      type="file"
                      multiple
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleAIFileChange}
                    />
                  </>
                ) : (
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', color: '#222', fontSize: 15 }}>
                    {aiFiles.map(f => <li key={f.name}>{f.name}</li>)}
                  </ul>
                )}
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                width: '100%', 
                marginTop: 8 
              }}>
                <button
                  type="button"
                  className="modal-cancel-btn"
                  style={{
                    fontFamily: 'Onest, sans-serif',
                    background: '#f0f0f0',
                    color: '#666',
                    border: 'none',
                    borderRadius: 7,
                    padding: '10px 28px',
                    fontSize: 15,
                    fontWeight: 400,
                    cursor: 'pointer'
                  }}
                  onClick={() => { setShowAIModal(false); setAIFiles([]); }}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  className="modal-save-btn"
                  style={{
                    fontFamily: 'Onest, sans-serif',
                    background: '#4f8cff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 7,
                    padding: '10px 28px',
                    fontSize: 15,
                    fontWeight: 400,
                    cursor: aiLoading ? 'not-allowed' : 'pointer',
                    opacity: aiLoading ? 0.7 : 1,
                  }}
                  onClick={handleAIUpload}
                  disabled={aiLoading}
                >
                  {aiLoading ? 'Загрузка...' : 'Загрузить'}
                </button>
              </div>
              {aiError && (
                <div style={{ color: 'red', marginTop: 10, textAlign: 'center' }}>{aiError}</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskModal;