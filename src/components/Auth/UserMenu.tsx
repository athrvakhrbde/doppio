"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import ProfileModal from './ProfileModal';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn-border"
          style={{
            height: '32px',
            padding: '0 12px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }}></span>
          {user?.name || 'User'}
        </button>

        {isOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: '#0a0a0a',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            zIndex: 3000,
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
            minWidth: '160px'
          }}>
            <div style={{ padding: '8px 0' }}>
              <div style={{
                padding: '8px 12px',
                fontSize: '10px',
                color: 'var(--text-tertiary)',
                borderBottom: '1px solid var(--border)',
                marginBottom: '4px'
              }}>
                {user?.email}
              </div>
              <button
                onClick={() => {
                  setShowProfile(true);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1a'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Profile Settings
              </button>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1a'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
      
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
}
