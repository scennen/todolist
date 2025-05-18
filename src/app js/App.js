import './App.css';
import './styles/style.css';

function App() {
  return (
    <div>
<body>
  <aside className="sidebar">
    <div className="date-time">
      <div id="current-date"></div>
      <div id="current-time"></div>
    </div>
    <nav className="folders">
      <ul className="folder-list">
        <li className="folder">
          <div className="folder-header">
            <span className="folder-toggle">▶️</span>
            <img src="img/icon/folder.svg" alt="Folder" />
            Задания
          </div>
          <ul className="folder-children">
            <li className="folder">
              <div className="folder-header">
                <span className="folder-toggle">▶️</span>
                <img src="img/icon/folder.svg" alt="Folder" />
                Работа
              </div>
            </li>
            <li className="folder">
              <div className="folder-header">
                <span className="folder-toggle">▶️</span>
                <img src="img/icon/folder.svg" alt="Folder" />
                Личное
              </div>
              <ul className="folder-children">
                <li className="file active">
                  <div className="folder-header">
                    <img src="img/icon/file.svg" alt="File" />
                    Дела на сегодня
                  </div>
                </li>
              </ul>
            </li>
            <li className="folder">
              <div className="folder-header">
                <span className="folder-toggle">▶️</span>
                <img src="img/icon/folder.svg" alt="Folder" />
                Учёба
              </div>
            </li>
            <li className="folder">
              <div className="folder-header">
                <span className="folder-toggle">▶️</span>
                <img src="img/icon/folder.svg" alt="Folder" />
                Архив
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
    <div className="deleted" id="deleted-tab">
      <img src="img/icon/bin.svg" alt="Bin" />
      Удалено
    </div>
  </aside>

  <main className="main">
    <header className="main-header">
      <h1>Дела на сегодня</h1>
      <button id="add-task-btn">Добавить задачу</button>
    </header>
    <div className="controls">
      <input type="text" id="search-input" placeholder="Поиск…" />
    </div>
    <table className="tasks-table">
      <thead>
        <tr>
          <th></th>
          <th>Задание</th>
          <th>Приоритет</th>
          <th>Дата</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody id="tasks-body">
      </tbody>
    </table>
  </main>

  <div className="modal" id="task-modal">
    <div className="modal-content">
      <h2 id="modal-title">Добавить задачу</h2>
      <form id="task-form">
        <label>
          Задание:
          <input type="text" id="task-title" required />
        </label>
        <label>
          Описание:
          <textarea id="task-description"></textarea>
        </label>
        <label>
          Приоритет:
          <select id="task-priority">
            <option value="high">Высокий</option>
            <option value="medium">Средний</option>
            <option value="low">Низкий</option>
          </select>
        </label>
        <label>
          Дата:
          <input type="date" id="task-date" required />
        </label>
        <div className="modal-actions">
          <button type="submit">Сохранить</button>
          <button type="button" id="cancel-btn">Отмена</button>
        </div>
      </form>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</div>
  );
}

export default App;
