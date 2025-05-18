import React, { useState } from 'react';

export default function Sidebar() {
  // State for opened folders
  const [openFolders, setOpenFolders] = useState({});

  function toggleFolder(name) {
    setOpenFolders(prev => ({ ...prev, [name]: !prev[name] }));
  }

  return (
    <aside className="sidebar">
      <div className="date-time">
        <div id="current-date"></div>
        <div id="current-time"></div>
      </div>
      <nav className="folders">
        <ul className="folder-list">
          <li className={`folder ${openFolders['Задания'] ? 'open' : ''}`}>
            <div className="folder-header" onClick={() => toggleFolder('Задания')}>
              <span className="folder-toggle">▶️</span>
              <img src="/img/icon/folder.svg" alt="Folder" />
              Задания
            </div>
            {openFolders['Задания'] && (
              <ul className="folder-children">
                <li className={`folder ${openFolders['Работа'] ? 'open' : ''}`}>
                  <div className="folder-header" onClick={() => toggleFolder('Работа')}>
                    <span className="folder-toggle">▶️</span>
                    <img src="/img/icon/folder.svg" alt="Folder" />
                    Работа
                  </div>
                </li>
                <li className={`folder ${openFolders['Личное'] ? 'open' : ''}`}>
                  <div className="folder-header" onClick={() => toggleFolder('Личное')}>
                    <span className="folder-toggle">▶️</span>
                    <img src="/img/icon/folder.svg" alt="Folder" />
                    Личное
                  </div>
                  {openFolders['Личное'] && (
                    <ul className="folder-children">
                      <li className="file active">
                        <div className="folder-header">
                          <img src="/img/icon/file.svg" alt="File" />
                          Дела на сегодня
                        </div>
                      </li>
                    </ul>
                  )}
                </li>
                <li className={`folder ${openFolders['Учёба'] ? 'open' : ''}`}>
                  <div className="folder-header" onClick={() => toggleFolder('Учёба')}>
                    <span className="folder-toggle">▶️</span>
                    <img src="/img/icon/folder.svg" alt="Folder" />
                    Учёба
                  </div>
                </li>
                <li className={`folder ${openFolders['Архив'] ? 'open' : ''}`}>
                  <div className="folder-header" onClick={() => toggleFolder('Архив')}>
                    <span className="folder-toggle">▶️</span>
                    <img src="/img/icon/folder.svg" alt="Folder" />
                    Архив
                  </div>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
      <div className="deleted" id="deleted-tab">
        <img src="/img/icon/bin.svg" alt="Bin" />
        Удалено
      </div>
    </aside>
  );
}