"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const { login, register, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = isLogin 
      ? await login(email, password)
      : await register(email, password, name);

    if (result.success) {
      onClose();
      setEmail('');
      setPassword('');
      setName('');
    } else {
      setError(result.error || 'An error occurred');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5000,
    }}>
      <div className="panel" style={{
        width: '90%',
        maxWidth: '400px',
        padding: '32px',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ×
        </button>

        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', textAlign: 'center' }}>
          {isLogin ? 'Welcome Back' : 'Join Doppio'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-minimal"
                placeholder="Enter your name"
                required
                style={{ width: '100%' }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-minimal"
              placeholder="Enter your email"
              required
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-minimal"
              placeholder="Enter your password"
              required
              minLength={6}
              style={{ width: '100%' }}
            />
          </div>

          {error && (
            <div style={{
              fontSize: '11px',
              color: '#ef4444',
              padding: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-minimal"
            disabled={isLoading}
            style={{ width: '100%', height: '40px' }}
          >
            {isLoading ? 'PLEASE WAIT...' : (isLogin ? 'SIGN IN' : 'CREATE ACCOUNT')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
