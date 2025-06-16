import React, { useState, useEffect } from 'react';
import { Icons } from '../icons/Icons';
import '../styles.css';

// Пустое дерево по умолчанию
const initialTree = [];

// Utility to filter out unwanted files (e.g., 'Проект')
const filterTree = (tree) => {
  return tree
    .filter(node => node.name !== 'Проект')
    .map(node =>
      node.type === 'folder' && node.children
        ? { ...node, children: filterTree(node.children) }
        : node
    );
};

const Sidebar = ({ onSelectProject, onShowTrash, selectedProject, urgentTaskFile }) => {
  const [open, setOpen] = useState(false); // по умолчанию закрыт
  const [tree, setTree] = useState(() => {
    const saved = localStorage.getItem('sidebarTree');
    if (saved) {
      try {
        return filterTree(JSON.parse(saved));
      } catch {
        return initialTree;
      }
    }
    return initialTree;
  });
  const [contextMenu, setContextMenu] = useState(null); // {x, y, nodeId, parentId, type}
  const [modal, setModal] = useState(null); // {parentId, type}
  const [inputValue, setInputValue] = useState('');
  // Удаление файла или папки с подтверждением
  const [deleteConfirm, setDeleteConfirm] = useState(null); // {id, parentId, type, name}

  // Определяем, выбран ли файл (в том числе вложенный)
  const isFileSelected = (name) => selectedProject === name;

  // Определяем, выбран ли какой-либо файл (в том числе вложенный)
  const isAnyFileSelected = (tree) => {
    for (const node of tree) {
      if (node.type === 'file' && selectedProject === node.name) return true;
      if (node.type === 'folder' && node.children && isAnyFileSelected(node.children)) return true;
    }
    return false;
  };

  // Анимация открытия/закрытия папки
  const toggleFolder = (id) => {
    setTree(tree => tree.map(node =>
      node.id === id ? { ...node, open: !node.open } : node
    ));
  };

  // Добавление файла или папки через модалку
  const addNode = (parentId, type) => {
    setModal({ parentId, type });
    setInputValue('');
    setContextMenu(null);
  };

  // Подтверждение создания или переименования
  const handleModalSubmit = (e) => {
    e.preventDefault();
    const name = inputValue.trim();
    if (!name) return;
    if (modal.type === 'rename-file') {
      // Найти и переименовать файл
      const renameFile = (tree) => tree.map(node => {
        if (node.type === 'file' && node.id === modal.nodeId) {
          return { ...node, name };
        }
        if (node.type === 'folder' && node.children) {
          return { ...node, children: renameFile(node.children) };
        }
        return node;
      });
      setTree(tree => renameFile(tree));
      setModal(null);
      setInputValue('');
      return;
    }
    if (modal.type === 'rename-folder') {
      // Найти и переименовать папку
      const renameFolder = (tree) => tree.map(node => {
        if (node.type === 'folder' && node.id === modal.nodeId) {
          return { ...node, name };
        }
        if (node.type === 'folder' && node.children) {
          return { ...node, children: renameFolder(node.children) };
        }
        return node;
      });
      setTree(tree => renameFolder(tree));
      setModal(null);
      setInputValue('');
      return;
    }
    const newNode = {
      id: Date.now().toString(),
      name,
      type: modal.type,
      ...(modal.type === 'folder' ? { open: true, children: [] } : {})
    };
    if (!modal.parentId) {
      setTree(tree => {
        const updated = [...tree, newNode];
        // Если это первая папка, сразу открываем раздел "Задачи"
        if (modal.type === 'folder' && tree.length === 0) {
          setOpen(true);
        }
        // Если это первый файл, тоже открываем раздел "Задачи"
        if (modal.type === 'file' && tree.length === 0) {
          setOpen(true);
        }
        return updated;
      });
    } else {
      setTree(tree => tree.map(node => {
        if (node.id === modal.parentId && node.type === 'folder') {
          if (!node.open) {
            return {
              ...node,
              open: true,
              children: [...(node.children || []), newNode],
            };
          }
          return {
            ...node,
            children: [...(node.children || []), newNode],
          };
        }
        if (node.type === 'folder' && node.children) {
          return {
            ...node,
            children: node.children.map(child => {
              if (child.id === modal.parentId && child.type === 'folder') {
                if (!child.open) {
                  return {
                    ...child,
                    open: true,
                    children: [...(child.children || []), newNode],
                  };
                }
                return {
                  ...child,
                  children: [...(child.children || []), newNode],
                };
              }
              return child;
            })
          };
        }
        return node;
      }));
    }
    setModal(null);
    setInputValue('');
    if (modal.type === 'file') {
      onSelectProject(name);
    }
  };

  // Удаление файла или папки с подтверждением
  const handleDelete = (id, parentId, type, name) => {
    setDeleteConfirm({ id, parentId, type, name });
    setContextMenu(null);
  };

  const confirmDelete = () => {
    const { id, parentId } = deleteConfirm;
    if (!parentId) {
      setTree(tree => tree.filter(node => node.id !== id));
    } else {
      setTree(tree => tree.map(node => {
        if (node.id === parentId && node.type === 'folder') {
          return {
            ...node,
            children: node.children.filter(child => child.id !== id),
          };
        }
        return node;
      }));
    }
    setDeleteConfirm(null);
  };

  // Рендер узла дерева
  const renderNode = (node, parentId = null) => {
    if (node.type === 'folder') {
      const isSelected = selectedProject === node.name;
      const isOpen = node.open;
      const hasChildren = node.children && node.children.length > 0;
      // For empty folders, left-click shows context menu
      const handleFolderRowClick = (e) => {
        if (!hasChildren) {
          // Show context menu at mouse position
          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id, parentId, type: 'folder' });
        } else {
          toggleFolder(node.id);
        }
      };
      return (
        <li key={node.id} className="sidebar-folder"
          onContextMenu={e => {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id, parentId, type: 'folder' });
          }}
        >
          <div
            className={`folder-row${isOpen ? ' open' : ''}${isSelected ? ' selected' : ''}`}
            onClick={handleFolderRowClick}
          >
            <Icons.Folder className="icon" />
            <span>{node.name}</span>
          </div>
          {isOpen && hasChildren && (
            <ul className="folder-list animate">
              {node.children.map(child => renderNode(child, node.id))}
            </ul>
          )}
        </li>
      );
    }
    // file
    return (      <li 
        key={node.id} 
        className={`sidebar-file${isFileSelected(node.name) ? ' selected' : ''}`}
      >
        <div 
          className="file-row"
          onClick={() => {
            onSelectProject(node.name);
          }}
          onContextMenu={e => {
            e.preventDefault();
            e.stopPropagation(); // Предотвращаем всплытие события
            setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id, parentId, type: 'file' });
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            padding: '4px 8px',
            cursor: 'pointer'
          }}
        >
          <Icons.File className="icon" />
          <span>{node.name}</span>
        </div>
      </li>
    );
  };

  // ПКМ по "Задачи" для создания корневых папок/файлов
  const handleRootContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId: null, parentId: null, type: 'root' });
  };

  // Persist tree to localStorage on change
  useEffect(() => {
    localStorage.setItem('sidebarTree', JSON.stringify(tree));
  }, [tree]);

  // Если urgentTaskFile передан, сразу выделяем нужный файл
  useEffect(() => {
    if (urgentTaskFile) {
      onSelectProject(urgentTaskFile);
    }
  }, [urgentTaskFile, onSelectProject]);

  return (
    <div className="sidebar">
      <button
        className={selectedProject === 'Сегодня' ? 'selected' : ''}
        onClick={() => onSelectProject('Сегодня')}
      >
        <Icons.Today className="icon" /> Сегодня
      </button>
      <button
        className={`folder-title folder-btn${(!isAnyFileSelected(tree) && selectedProject !== 'Сегодня' && selectedProject !== 'Удалено') ? ' selected' : ''}`}
        onClick={e => {
          if (tree.length === 0) {
            // Открыть контекстное меню под кнопкой
            const rect = e.target.getBoundingClientRect();
            setContextMenu({
              x: rect.left + rect.width / 2,
              y: rect.bottom + 4,
              nodeId: null,
              parentId: null,
              type: 'root',
            });
          } else {
            setOpen(o => !o);
          }
        }}
        onContextMenu={handleRootContextMenu}
        type="button"
        style={{ fontWeight: 400, cursor: 'pointer', opacity: 1 }}
      >
        <Icons.Task className="icon" />
        Задачи
      </button>
      {open && tree.length > 0 && (
        <ul className="folder-list animate">
          {tree.map(node => renderNode(node))}
        </ul>
      )}
      <button className={selectedProject === 'Удалено' ? 'selected' : ''} onClick={onShowTrash}><Icons.Bin className="icon" /> Удалено</button>
      {/* Overlay для закрытия контекстного меню */}
      {contextMenu && (
        <>
          <div className="context-menu-overlay" onClick={() => setContextMenu(null)} />
          <div
            className="context-menu"
            style={{ top: contextMenu.y, left: contextMenu.x, position: 'fixed', zIndex: 1000 }}
            onClick={e => e.stopPropagation()}
          >
            {contextMenu.type === 'root' && (
              <>
                <button onClick={() => addNode(null, 'folder')}><Icons.Folder className="icon" />Создать папку</button>
                <button onClick={() => addNode(null, 'file')}><Icons.File className="icon" />Создать файл</button>
              </>
            )}
            {contextMenu.type === 'folder' && (
              <>
                <button onClick={() => setModal({ parentId: contextMenu.parentId, type: 'rename-folder', nodeId: contextMenu.nodeId })}><Icons.Edit className="icon" />Переименовать папку</button>
                <button onClick={() => addNode(contextMenu.nodeId, 'folder')}><Icons.Folder className="icon" />Создать папку</button>
                <button onClick={() => addNode(contextMenu.nodeId, 'file')}><Icons.File className="icon" />Создать файл</button>
                <button className="delete-btn" onClick={() => handleDelete(contextMenu.nodeId, contextMenu.parentId, 'folder', getNodeNameById(contextMenu.nodeId, tree))}><Icons.Bin className="icon" />Удалить папку</button>
              </>
            )}            {contextMenu.type === 'file' && (
              <>
                <button
                  className="context-menu-btn"
                  onClick={() => { 
                    setModal({ parentId: contextMenu.parentId, type: 'rename-file', nodeId: contextMenu.nodeId }); 
                    setContextMenu(null); 
                  }}
                >
                  <Icons.Edit className="icon" />
                  Переименовать
                </button>
                <button
                  className="context-menu-btn delete-btn"
                  onClick={() => handleDelete(contextMenu.nodeId, contextMenu.parentId, 'file', getNodeNameById(contextMenu.nodeId, tree))}
                >
                  <Icons.Bin className="icon" />
                  Удалить
                </button>
              </>
            )}
          </div>
        </>
      )}
      {modal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ minWidth: 320, maxWidth: 380 }}>
            <h2 style={{ fontSize: '1.1rem', color: '#666', marginBottom: 16 }}>
              {modal.type === 'file' && 'Создать файл'}
              {modal.type === 'folder' && 'Создать папку'}
              {modal.type === 'rename-file' && 'Переименовать файл'}
              {modal.type === 'rename-folder' && 'Переименовать папку'}
            </h2>
            <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input
                type="text"
                autoFocus
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={modal.type === 'file' ? 'Название файла...' : modal.type === 'folder' ? 'Название папки...' : modal.type === 'rename-file' ? 'Новое имя файла...' : 'Новое имя папки...'}
                style={{ padding: '10px 14px', borderRadius: 7, border: '1px solid #e0e0e0', fontSize: 16, background: '#f8f9fa', color: '#333' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <button type="button" onClick={() => setModal(null)} style={{ background: '#f0f0f0', color: '#666', border: 'none', borderRadius: 7, padding: '8px 20px', fontSize: 15, cursor: 'pointer' }}>Отмена</button>
                <button type="submit" style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 20px', fontSize: 15, cursor: 'pointer' }}>
                  {(modal.type === 'rename-file' || modal.type === 'rename-folder') ? 'Переименовать' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteConfirm && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ minWidth: 320, maxWidth: 380 }}>
            <h2 style={{ fontSize: '1.1rem', color: '#d32f2f', marginBottom: 16 }}>Подтвердите удаление</h2>
            <div style={{ marginBottom: 18, color: '#444', fontSize: 16 }}>
              {deleteConfirm.type === 'file' ? `Удалить файл "${deleteConfirm.name}"?` : `Удалить папку "${deleteConfirm.name}" и все её содержимое?`}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <button type="button" onClick={() => setDeleteConfirm(null)} style={{ background: '#f0f0f0', color: '#666', border: 'none', borderRadius: 7, padding: '8px 20px', fontSize: 15, cursor: 'pointer' }}>Отмена</button>
              <button type="button" onClick={confirmDelete} style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 20px', fontSize: 15, cursor: 'pointer' }}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

// Вспомогательная функция для поиска имени по id
const getNodeNameById = (id, nodes) => {
  for (const node of nodes) {
    if (node.id === id) return node.name;
    if (node.type === 'folder' && node.children) {
      const found = getNodeNameById(id, node.children);
      if (found) return found;
    }
  }
  return '';
};
