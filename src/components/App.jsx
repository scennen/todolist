import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import TaskTable from './TaskTable';
import TaskModal from './TaskModal';
import DateTime from './DateTime';

import './style.css';

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  function openModal(id = null) {
    setEditTaskId(id);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditTaskId(null);
  }

  function saveTask(data) {
    if (editTaskId) {
      setTasks(tasks.map(t => (t.id === editTaskId ? { ...data, id: editTaskId } : t)));
    } else {
      setTasks([...tasks, { ...data, id: Date.now(), done: false, showDescription: false }]);
    }
    closeModal();
  }

  function toggleDone(id) {
    setTasks(prev =>
      prev
        .map(t => (t.id === id ? { ...t, done: !t.done } : t))
        .sort((a, b) => a.done - b.done)
    );
  }

  function deleteTask(id) {
    setTasks(tasks.filter(t => t.id !== id));
  }

  function toggleDescription(id) {
    setTasks(tasks.map(t => (t.id === id ? { ...t, showDescription: !t.showDescription } : t)));
  }

  function handleSort(field) {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
    setTasks(prev => {
      const sorted = [...prev].sort((a, b) => {
        if (a[field] < b[field]) return sortAsc ? -1 : 1;
        if (a[field] > b[field]) return sortAsc ? 1 : -1;
        return 0;
      });
      return sorted;
    });
  }

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main">
        <Header onAddTask={() => openModal()} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <TaskTable
          tasks={filteredTasks}
          onToggleDone={toggleDone}
          onDelete={deleteTask}
          onEdit={openModal}
          onToggleDescription={toggleDescription}
          onSort={handleSort}
          sortField={sortField}
          sortAsc={sortAsc}
        />
      </main>
      {modalOpen && (
        <TaskModal
          task={tasks.find(t => t.id === editTaskId)}
          onSave={saveTask}
          onClose={closeModal}
        />
      )}
      <DateTime />
    </div>
  );
}