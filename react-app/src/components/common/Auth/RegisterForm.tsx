/**
 * Register Form Component
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './AuthForms.css';

interface RegisterFormProps {
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onSwitchToLogin: () => void;
  isLoading: boolean;
  error: string | null;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onRegister,
  onSwitchToLogin,
  isLoading,
  error,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (password !== confirmPassword) {
      setValidationError(t('auth.passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      setValidationError(t('auth.passwordTooShort'));
      return;
    }

    await onRegister(name, email, password);
  };

  return (
    <div className="auth-form">
      <h2>{t('auth.register')}</h2>
      
      {(error || validationError) && (
        <div className="auth-error">{error || validationError}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">{t('auth.name')}</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
            placeholder={t('auth.namePlaceholder')}
          />
        </div>

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

        <div className="form-group">
          <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            placeholder={t('auth.confirmPasswordPlaceholder')}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? t('auth.registering') : t('auth.register')}
        </button>
      </form>

      <div className="auth-switch">
        <span>{t('auth.haveAccount')} </span>
        <button onClick={onSwitchToLogin} className="btn-link">
          {t('auth.login')}
        </button>
      </div>
    </div>
  );
};
