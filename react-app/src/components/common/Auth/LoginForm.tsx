/**
 * Login Form Component
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './AuthForms.css';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
  isLoading: boolean;
  error: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  onSwitchToRegister,
  isLoading,
  error,
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(email, password);
  };

  return (
    <div className="auth-form">
      <h2>{t('auth.login')}</h2>
      
      {error && <div className="auth-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">{t('auth.email')}</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            placeholder={t('auth.emailPlaceholder')}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">{t('auth.password')}</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            placeholder={t('auth.passwordPlaceholder')}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? t('auth.loggingIn') : t('auth.login')}
        </button>
      </form>

      <div className="auth-switch">
        <span>{t('auth.noAccount')} </span>
        <button onClick={onSwitchToRegister} className="btn-link">
          {t('auth.register')}
        </button>
      </div>
    </div>
  );
};
