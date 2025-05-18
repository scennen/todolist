import React from 'react';

export default function Header({ onAddTask, searchQuery, setSearchQuery }) {
  return (
    <>
      <header className="main-header">
        <h1>Дела на сегодня</h1>
        <button id="add-task-btn" onClick={onAddTask}>Добавить задачу</button>
      </header>
      <div className="controls">
        <input
          type="text"
          id="search-input"
          placeholder="Поиск…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
    </>
  );
}