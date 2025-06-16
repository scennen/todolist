import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../icons/Icons';
import '../styles.css';

const FilterMenu = ({ onFilterChange, activeFilter }) => {
  const [open, setOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const menuRef = useRef(null);
  
  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const filters = [
    { id: 'Дедлайн', label: 'По дедлайну' },
    { id: 'Приоритет', label: 'По приоритету' }
  ];

  const activeFilterLabel = activeFilter ? 
    filters.find(f => f.id === activeFilter)?.label : 
    'Фильтр';

  const handleSortOrderToggle = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    if (activeFilter) onFilterChange(activeFilter, newOrder);
  };

  const handleFilterSelect = (filterId) => {
    // Если выбран тот же фильтр — просто меняем порядок
    if (activeFilter === filterId) {
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newOrder);
      onFilterChange(filterId, newOrder);
    } else {
      setSortOrder('asc');
      onFilterChange(filterId, 'asc');
    }
    setOpen(false);
  };

  return (
    <div className="filter-menu" ref={menuRef}>
      <button 
        onClick={() => setOpen(!open)}
        className={activeFilter ? 'active' : ''}
      >
        <Icons.Filter className="icon" />
        {activeFilterLabel}
        {activeFilter && (
          <span
            className="sort-order-icon"
            style={{ marginLeft: 8, fontSize: 13, color: '#888', userSelect: 'none', cursor: 'pointer' }}
            onClick={e => { e.stopPropagation(); handleSortOrderToggle(); }}
            title={sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </button>
      {open && (
        <ul className="dropdown">
          {filters.map(opt => (
            <li 
              key={opt.id} 
              onClick={() => handleFilterSelect(opt.id)}
            >
              {opt.label}
              {activeFilter === opt.id && (
                <span style={{ marginLeft: 8, fontSize: 13, color: '#888' }}>{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FilterMenu;