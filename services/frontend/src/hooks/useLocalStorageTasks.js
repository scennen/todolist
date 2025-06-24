import { useState, useEffect, useCallback } from 'react';

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const useLocalStorageTasks = () => {
  const [tasks, setTasks] = useState(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = userData.email || 'anonymous';
    const saved = localStorage.getItem(`tasks_${userId}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = userData.email || 'anonymous';
    localStorage.setItem(`tasks_${userId}`, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = async (newTask) => {
    try {
      const response = await fetch('/api/tasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify(newTask),
      });
      if (response.ok) {
        const savedTask = await response.json();
        await fetchTasksFromBackend();
      } else {
        const errorText = await response.text();
        console.error('Ошибка при создании задачи', response.status, errorText);
      }
    } catch (e) {
      console.error('Ошибка сети при создании задачи', e);
    }
  };

  const updateTask = async (updated) => {
    try {
      const response = await fetch(`/api/tasks/${updated.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify(updated),
      });
      if (response.ok) {
        await fetchTasksFromBackend();
      } else {
        console.error('Ошибка при обновлении задачи');
      }
    } catch (e) {
      console.error('Ошибка сети при обновлении задачи', e);
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`/api/tasks/${id}/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
      });
      if (response.ok || response.status === 204) {
        await fetchTasksFromBackend();
      } else {
        console.error('Ошибка при удалении задачи');
      }
    } catch (e) {
      console.error('Ошибка сети при удалении задачи', e);
    }
  };

  const restoreTask = async (id, afterRestore) => {
    try {
      const response = await fetch(`/api/tasks/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify({ deleted: false }),
      });
      if (response.ok) {
        if (afterRestore) afterRestore();
      } else if (response.status === 404) {
        // Если задача не найдена, убираем её из корзины
        if (afterRestore) afterRestore();
      } else {
        console.error('Ошибка при восстановлении задачи');
      }
    } catch (e) {
      console.error('Ошибка сети при восстановлении задачи', e);
    }
  };

  const removeTaskPermanently = async (id, afterDelete) => {
    try {
      const response = await fetch(`/api/tasks/${id}/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
      });
      if (response.ok || response.status === 204) {
        if (afterDelete) afterDelete();
      } else if (response.status === 404) {
        // Если задача не найдена, убираем её из корзины
        if (afterDelete) afterDelete();
      } else {
        console.error('Ошибка при удалении задачи навсегда');
      }
    } catch (e) {
      console.error('Ошибка сети при удалении задачи навсегда', e);
    }
  };

  const toggleComplete = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      const response = await fetch(`/api/tasks/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (response.ok) {
        await fetchTasksFromBackend();
      } else {
        const errorText = await response.text();
        console.error('Ошибка при обновлении статуса задачи', response.status, errorText);
      }
    } catch (e) {
      console.error('Ошибка сети при обновлении статуса задачи', e);
    }
  };

  // Загрузка задач с бэкенда
  const fetchTasksFromBackend = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks/', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        // Маппинг due_date -> dueDate
        const mapTask = (task) => ({
          ...task,
          dueDate: task.due_date,
        });
        setTasks(data.map(mapTask));
        // Сохраняем в localStorage для кэширования
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userId = userData.email || 'anonymous';
        localStorage.setItem(`tasks_${userId}`, JSON.stringify(data.map(mapTask)));
      } else {
        console.error('Ошибка при загрузке задач:', response.statusText);
      }
    } catch (error) {
      console.error('Ошибка сети при загрузке задач:', error);
    }
  }, []); // Пустой массив зависимостей, так как функция не зависит от внешних переменных

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    restoreTask,
    removeTaskPermanently,
    toggleComplete,
    fetchTasksFromBackend,
  };
};

export default useLocalStorageTasks;