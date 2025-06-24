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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (showUserMenu && 
          userMenuRef.current && 
          !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showUserMenu]);

  return (
    <div className="header">
      <div className="header-left" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Icons.Search className="icon" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск..."
          className="search-input"
          style={{ width: '100%', maxWidth: 1800, minWidth: 220, marginRight: 16 }}
        />
      </div>
      <div className="header-icons">
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
              {userData.name && userData.name.length > 0
                ? userData.name[0].toUpperCase()
                : userData.username && userData.username.length > 0
                  ? userData.username[0].toUpperCase()
                  : userData.email && userData.email.length > 0
                    ? userData.email[0].toUpperCase()
                    : '?'}
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
