"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuthStore();

  useState(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile updated successfully');
        // Update local user data
        // This would typically be handled by the auth store
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setIsLoading(false);
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
        maxWidth: '500px',
        maxHeight: '80vh',
        overflowY: 'auto',
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
          Profile Settings
        </h2>

        {error && (
          <div style={{
            fontSize: '11px',
            color: '#ef4444',
            padding: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            fontSize: '11px',
            color: '#4ade80',
            padding: '8px',
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.2)',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Update Profile</h3>
          
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

          <button
            type="submit"
            className="btn-minimal"
            disabled={isLoading}
            style={{ width: '100%', height: '40px' }}
          >
            {isLoading ? 'UPDATING...' : 'UPDATE PROFILE'}
          </button>
        </form>

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Change Password</h3>
          
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              CURRENT PASSWORD
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-minimal"
              placeholder="Enter current password"
              required
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              NEW PASSWORD
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-minimal"
              placeholder="Enter new password"
              required
              minLength={6}
              style={{ width: '100%' }}
            />
          </div>

          <button
            type="submit"
            className="btn-border"
            disabled={isLoading}
            style={{ width: '100%', height: '40px' }}
          >
            {isLoading ? 'UPDATING...' : 'CHANGE PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  );
}
