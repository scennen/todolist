import React from 'react';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onEdit, onDelete, onToggleComplete }) => (
  <table className="task-table">
    <thead>
      <tr>
        <th className="task-th">Задание</th>
        <th className="task-th">Приоритет</th>
        <th className="task-th">Дата</th>
        <th className="task-th">Действия</th>
      </tr>
    </thead>
    <tbody>
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
        />
      ))}
    </tbody>
  </table>
);

export default TaskList;