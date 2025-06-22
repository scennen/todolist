import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskList from './components/TaskList';
import FilterMenu from './components/FilterMenu';
import TaskModal from './components/Modal';
import TrashModal from './components/TrashModal';
import ProfileModal from './components/ProfileModal';
import LoginPage from './components/LoginPage';
import useLocalStorageTasks from './hooks/useLocalStorageTasks';
import './styles.css';

function App() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    restoreTask,
    toggleComplete,
    removeTaskPermanently,
    fetchTasksFromBackend,
  } = useLocalStorageTasks();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Проверяем авторизацию через backend
    fetch('/api/user/', { credentials: 'include' })
      .then(r => {
        if (r.ok) return r.json();
        throw new Error('not auth');
      })
      .then(user => {
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userData', JSON.stringify(user));
      })
      .catch(() => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userData');
      })
      .finally(() => setAuthChecked(true));
  }, []);

  // Загружаем задачи с бэкенда при монтировании компонента
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasksFromBackend();
    }
  }, [isAuthenticated, fetchTasksFromBackend]);

  const handleLogin = (userData) => {
    // TODO: Replace with actual backend authentication
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userData', JSON.stringify(userData));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
  };

  const [selectedProject, setSelectedProject] = useState('Сегодня');
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [urgentTaskFile, setUrgentTaskFile] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const [deletedTasks, setDeletedTasks] = useState([]);

  // Загружаем приоритеты при монтировании
  useEffect(() => {
    fetch('/api/priorities/')
      .then(r => r.json())
      .then(setPriorities)
      .catch(() => setPriorities([]));
  }, []);

  // Reset filter when switching projects
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setFilterType(null);
  };

  // Эффект для проверки наличия задач и автоматического переключения в "Сегодня"
  useEffect(() => {
    const hasProjectTasks = tasks.some(task => task.project === 'Проект' && !task.deleted);
    if (!hasProjectTasks && selectedProject === 'Проект') {
      setSelectedProject('Сегодня');
    }
  }, [tasks, selectedProject]);
  const [editTask, setEditTask] = useState(null);
  const [filterType, setFilterType] = useState(null);  const [showTrashModal, setShowTrashModal] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleFilterChange = (type, order = 'asc') => {
    setFilterType(type);
    setSortOrder(order);
  };

  const filteredTasks = tasks
    .filter(task => {
      // Фильтр по проекту и статусу удаления
      const projectMatch = task.project === selectedProject && !task.deleted;
      
      // Поиск по заголовку и описанию, если есть поисковый запрос
      if (searchValue.trim()) {
        const searchLower = searchValue.toLowerCase();
        const titleMatch = task.title?.toLowerCase().includes(searchLower);
        const descMatch = task.description?.toLowerCase().includes(searchLower);
        return projectMatch && (titleMatch || descMatch);
      }
      
      return projectMatch;
    })
    .sort((a, b) => {
      // Сначала сортируем по статусу завершения (выполненные в конец)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Для выполненных задач сортируем в обратном порядке по времени завершения
      if (a.completed && b.completed) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }      // Применяем выбранный фильтр
      if (filterType === 'Дедлайн') {
        // Расчёт оставшегося времени и добавление штрафа за просроченные задачи
        const now = new Date();
        const getDaysLeft = (date) => {
          if (!date) return Infinity;
          const days = Math.ceil((new Date(date) - now) / (1000 * 60 * 60 * 24));
          return days < 0 ? days - 1000 : days; // Просроченные задачи в начало
        };
        const daysLeftA = getDaysLeft(a.dueDate);
        const daysLeftB = getDaysLeft(b.dueDate);
        
        // Задачи без дедлайна в конец
        if (daysLeftA === Infinity && daysLeftB === Infinity) return 0;
        if (daysLeftA === Infinity) return 1;
        if (daysLeftB === Infinity) return -1;
        
        return sortOrder === 'asc' ? daysLeftA - daysLeftB : daysLeftB - daysLeftA;
      }
      if (filterType === 'Приоритет') {
        // Маппинг id -> name
        const getPriorityName = (id) => {
          const p = priorities.find(pr => pr.id === id);
          return p ? p.name : '';
        };
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityA = priorityOrder[getPriorityName(a.priority)];
        const priorityB = priorityOrder[getPriorityName(b.priority)];
        const priorityCompare = (priorityA ?? 99) - (priorityB ?? 99);
        // При равном приоритете сортируем по дедлайну
        if (priorityCompare === 0) {
          const dateA = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
          const dateB = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
          return dateA - dateB;
        }
        return sortOrder === 'asc' ? priorityCompare : -priorityCompare;
      }
      if (filterType === 'Статус') {
        if (a.completed === b.completed) {
          // При одинаковом статусе сортируем по дате завершения (для выполненных)
          // или по приоритету (для невыполненных)
          if (a.completed) {
            return new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt);
          } else {
            const getPriorityName = (id) => {
              const p = priorities.find(pr => pr.id === id);
              return p ? p.name : '';
            };
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return (priorityOrder[getPriorityName(a.priority)] ?? 99) - (priorityOrder[getPriorityName(b.priority)] ?? 99);
          }
        }
        return a.completed ? 1 : -1;
      }
      return 0;
    });

  // --- Urgent tasks for notification bell (due in <24h, not completed, not deleted) ---
  const urgentTasks = tasks.filter(task => {
    if (task.deleted || task.completed) return false;
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    const now = new Date();
    const diffMs = due - now;
    return diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;
  });

  // Переход к проекту и выделение задачи по клику из уведомлений
  const handleUrgentTaskClick = (task) => {
    setSelectedProject(task.project);
    setEditTask(null); // не открываем модалку
    setShowModal(false);
    setUrgentTaskFile(task.project); // передаём имя файла/проекта для Sidebar
    setFilterType('Дедлайн'); // автоматически фильтруем по времени
  };

  // Загрузка удалённых задач
  const fetchDeletedTasks = async () => {
    try {
      const response = await fetch('/api/tasks/deleted/');
      if (response.ok) {
        const data = await response.json();
        // Маппинг due_date -> dueDate
        const mapTask = (task) => ({
          ...task,
          dueDate: task.due_date,
        });
        setDeletedTasks(data.map(mapTask));
      } else {
        setDeletedTasks([]);
      }
    } catch {
      setDeletedTasks([]);
    }
  };

  // Открытие модального окна корзины
  const handleShowTrashModal = () => {
    fetchDeletedTasks();
    setShowTrashModal(true);
  };

  if (!authChecked) return null; // Показывать loader/spinner, если нужно
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Sidebar onSelectProject={handleProjectSelect} onShowTrash={handleShowTrashModal} urgentTaskFile={urgentTaskFile} />
      <div className="main">
        <Header
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          urgentTasks={urgentTasks}
          onUrgentTaskClick={handleUrgentTaskClick}
          onProfileClick={() => setShowProfileModal(true)}
          onLogout={handleLogout}
        />
        <div className="top-bar">
          <h2>{selectedProject}</h2>
          <div className="buttons">
            <FilterMenu 
              onFilterChange={handleFilterChange} 
              activeFilter={filterType}
            />
            <button className="new-task-btn" onClick={() => setShowModal(true)}>
              Новая задача
            </button>
          </div>
        </div>

        <TaskList
          tasks={filteredTasks}
          onEdit={task => {
            setEditTask(task);
            setShowModal(true);
          }}
          onDelete={deleteTask}
          onToggleComplete={toggleComplete}
        />        {showModal && (
          <TaskModal
            task={editTask}
            onClose={() => {
              setShowModal(false);
              setEditTask(null);
            }}
            onSave={editTask ? updateTask : addTask}
            project={selectedProject}
            onTasksReload={fetchTasksFromBackend}
          />
        )}

        {showTrashModal && (
          <TrashModal
            tasks={deletedTasks}
            onClose={() => setShowTrashModal(false)}
            onRestore={id => restoreTask(id, fetchDeletedTasks)}
            onDeleteForever={id => removeTaskPermanently(id, fetchDeletedTasks)}
          />
        )}

        {showProfileModal && (
          <ProfileModal 
            onClose={() => setShowProfileModal(false)}
            user={JSON.parse(localStorage.getItem('userData') || '{}')}
          />
        )}
      </div>
    </div>
  );
}

export default App;