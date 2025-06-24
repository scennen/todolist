import React, { useState } from 'react';
import { Icons } from '../icons/Icons';
import InfoModal from './InfoModal';

const LoginPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showInfo, setShowInfo] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Получить CSRF-токен, если его нет
    if (!getCookie('csrftoken')) {
      await fetch('/api/csrf/', { credentials: 'include' });
    }
    const csrfToken = getCookie('csrftoken');
    if (isLogin) {
      // Реальный вход через backend
      const response = await fetch('/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const user = await response.json();
        onLogin(user);
      } else {
        alert('Ошибка входа');
      }
    } else {
      // Регистрация через backend
      const response = await fetch('/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, username: name })
      });
      if (response.ok) {
        setShowInfo(true);
      } else {
        alert('Ошибка регистрации');
      }
    }
  };

  return (
    <div className="login-page">
      <InfoModal
        open={showInfo}
        onClose={() => { setShowInfo(false); setIsLogin(true); }}
        title="Регистрация успешна!"
        message="Теперь войдите."
      />
      <div className="login-container">
        <div className="login-header">
          <Icons.Task className="icon" style={{ width: 32, height: 32, color: '#4f8cff' }} />
          <h1>{isLogin ? 'Вход' : 'Регистрация'}</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Введите ваше имя"
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Введите ваш email"
            />
          </div>

          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Введите пароль"
            />
          </div>

          <button type="submit" className="login-button">
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="login-footer">
          <button 
            type="button" 
            className="switch-button"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Создать аккаунт' : 'Уже есть аккаунт?'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
