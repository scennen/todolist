import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../icons/Icons';
import '../styles.css';

const Header = ({ 
  searchValue, 
  onSearchChange, 
  urgentTasks = [], 
  onUrgentTaskClick, 
  onProfileClick,
  onLogout 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (showDropdown && 
          dropdownRef.current && 
          !dropdownRef.current.contains(e.target) && 
          bellRef.current && 
          !bellRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (showUserMenu && 
          userMenuRef.current && 
          !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown, showUserMenu]);

  return (
    <div className="header">
      <div className="header-left">
        <Icons.Search className="icon" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск..."
          className="search-input"
        />
      </div>
      <div className="header-icons">
        <div ref={bellRef} className="notification-bell-wrapper" style={{ position: 'relative' }}>
          <button
            className="notification-bell-btn"
            onClick={() => setShowDropdown((v) => !v)}
            aria-label="Уведомления"
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 0 }}
          >
            <Icons.Notification className="icon" />
            {urgentTasks.length > 0 && (
              <span className="notification-dot" style={{ boxShadow: 'none' }} />
            )}
          </button>
          {showDropdown && (
            <div ref={dropdownRef} className="notification-dropdown">
              <div className="notification-dropdown-title">Скоро дедлайн</div>
              {urgentTasks.length === 0 ? (
                <div className="notification-dropdown-empty">Нет срочных задач</div>
              ) : (
                <ul className="notification-dropdown-list">
                  {urgentTasks.map((task) => (
                    <li
                      key={task.id}
                      className="notification-dropdown-item notification-dropdown-item-compact"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setShowDropdown(false);
                        if (onUrgentTaskClick) onUrgentTaskClick(task);
                      }}
                    >
                      <div className="notification-task-title" style={{ fontWeight: 600, color: '#222', fontSize: 15, marginBottom: 2, lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icons.Task className="icon" style={{ width: 18, height: 18, color: '#4f8cff', flexShrink: 0 }} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                      </div>
                      {task.project && (
                        <div className="notification-task-project" style={{ color: '#888', fontSize: 13, marginBottom: 1, marginLeft: 24, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.project}</div>
                      )}
                      {task.dueDate && (
                        <div className="notification-task-date" style={{ color: '#c00', fontSize: 13, marginLeft: 24, fontWeight: 500 }}>
                          Дедлайн: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        
        <div ref={userMenuRef} className="user-menu-wrapper">
          <button
            className="user-menu-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="Меню пользователя"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              background: '#f0f0f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              color: '#666',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <div className="user-avatar">
              {userData.name ? userData.name[0].toUpperCase() : '?'}
            </div>
          </button>
          
          {showUserMenu && (
            <div className="user-menu-dropdown">
              <div className="user-info">
                <div className="user-name">{userData.name || 'Пользователь'}</div>
                <div className="user-email">{userData.email || ''}</div>
              </div>
              <button className="menu-item" onClick={onProfileClick}>
                <Icons.Profile className="icon" />
                Профиль
              </button>
              <button className="menu-item" onClick={onLogout}>
                <Icons.Logout className="icon" />
                Выйти
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
