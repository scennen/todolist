import React, { useState } from 'react';
import { Icons } from '../icons/Icons';

const LoginPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Добавить реальную авторизацию
    if (isLogin) {
      onLogin({ email, password });
    } else {
      onLogin({ email, password, name });
    }
  };

  return (
    <div className="login-page">
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
