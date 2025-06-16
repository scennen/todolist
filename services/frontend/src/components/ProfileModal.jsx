import React, { useState } from 'react';
import { Icons } from '../icons/Icons';

const ProfileModal = ({ onClose }) => {  const [name, setName] = useState('Александр');
  const [email, setEmail] = useState('alex@example.com');
  const [avatar, setAvatar] = useState(null);
  const fileInputRef = React.useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Сохранение данных профиля
    onClose();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content" style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="modal-title" style={{ fontSize: '1.35rem', color: '#111', fontWeight: 700, margin: 0 }}>
            Профиль
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="close-button"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 4,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icons.Close className="icon" style={{ width: 22, height: 22 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Аватар */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>            <div
              onClick={handleAvatarClick}
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: avatar ? `url(${avatar}) center/cover` : '#f0f0f0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: '#888',
                border: '3px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                position: 'relative',
                transition: 'all 0.3s ease',
              }}
              className="profile-avatar-container"
            >
              {!avatar && <span style={{ userSelect: 'none' }}>👤</span>}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Имя */}          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
            <label htmlFor="name" style={{ fontSize: 15, color: '#666', fontWeight: 500 }}>
              Имя
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: '12px 14px',
                borderRadius: 8,
                border: 'none',
                fontSize: '1rem',
                background: '#eeeeee',
                color: '#333',
                fontFamily: 'Onest, sans-serif',
                transition: 'all 0.2s ease'
              }}
            />
          </div>          {/* Email */}          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
            <label htmlFor="email" style={{ fontSize: 15, color: '#666', fontWeight: 500 }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: '12px 14px',
                borderRadius: 8,
                border: 'none',
                fontSize: '1rem',
                background: '#eeeeee',
                color: '#333',
                fontFamily: 'Onest, sans-serif',
                transition: 'all 0.2s ease'
              }}
            />
          </div>          {/* Кнопки */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              className="modal-cancel-btn"
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                background: '#f0f0f0',
                color: '#666',
                fontSize: 15,
                cursor: 'pointer',
                fontFamily: 'Onest, sans-serif'
              }}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="modal-save-btn"
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                background: '#4f8cff',
                color: '#fff',
                fontSize: 15,
                cursor: 'pointer',
                fontFamily: 'Onest, sans-serif'
              }}
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
