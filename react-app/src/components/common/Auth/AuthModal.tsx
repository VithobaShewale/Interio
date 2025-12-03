/**
 * Auth Modal Component
 */

import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { AuthContainer } from '../../../containers';
import './AuthForms.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose, 
  defaultMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <AuthContainer>
          {({ login, register, isLoading, error }) => (
            <>
              {mode === 'login' ? (
                <LoginForm
                  onLogin={async (email, password) => {
                    await login({ email, password });
                    onClose();
                  }}
                  onSwitchToRegister={() => setMode('register')}
                  isLoading={isLoading}
                  error={error}
                />
              ) : (
                <RegisterForm
                  onRegister={async (name, email, password) => {
                    await register({ name, email, password });
                    onClose();
                  }}
                  onSwitchToLogin={() => setMode('login')}
                  isLoading={isLoading}
                  error={error}
                />
              )}
            </>
          )}
        </AuthContainer>
      </div>
    </div>
  );
};
