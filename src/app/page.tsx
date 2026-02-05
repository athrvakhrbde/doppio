"use client";
export const runtime = "edge";

import dynamic from 'next/dynamic';
import { useState, useRef, useEffect } from 'react';
import { useCheckInStore } from '@/store/checkInStore';

const MapView = dynamic(() => import('@/components/Map/MapView'), {
  ssr: false,
  loading: () => <div style={{ height: 'calc(100vh - 48px)', background: '#000' }} />
});

export default function Home() {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [searching, setSearching] = useState(false);
  const [lastAddedCoords, setLastAddedCoords] = useState<[number, number] | null>(null);
  const [activeSelection, setActiveSelection] = useState<any | null>(null);

  const { addCafe, userName, setUserName, isCheckedIn, currentCafeId, intent, cafes, checkIn, checkOut } = useCheckInStore();

  useEffect(() => {
    setHydrated(true);
  }, []);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const currentCafe = cafes.find(c => c.id === currentCafeId);

  const searchPlaces = (query: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (abortController.current) abortController.current.abort();

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      abortController.current = new AbortController();
      try {
        const bbox = '77.34,12.83,77.84,13.14';
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=${bbox}&bounded=1&limit=5`,
          { signal: abortController.current.signal }
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (e: any) {
        if (e.name !== 'AbortError') console.error(e);
      } finally {
        setSearching(false);
      }
    }, 200);
  };

  const handleSelectPlace = (place: any) => {
    const name = place.display_name.split(',')[0];
    const coords: [number, number] = [parseFloat(place.lat), parseFloat(place.lon)];

    const newCafe = {
      id: place.place_id.toString(),
      name,
      coords,
      coworkers: [],
    };

    addCafe(newCafe);
    setLastAddedCoords(coords);
    setActiveSelection(newCafe);
    setSearch('');
    setSuggestions([]);
  };

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      if (abortController.current) abortController.current.abort();
    };
  }, []);

  const totalNodes = cafes.reduce((acc, cafe) => acc + cafe.coworkers.length, 0) + (isCheckedIn ? 1 : 0);

  if (!hydrated) return <div style={{ height: '100vh', background: '#000' }} />;

  return (
    <main style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#000', position: 'relative' }}>
      <header style={{
        height: '48px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px 0 20px',
        justifyContent: 'space-between',
        zIndex: 2000,
        background: '#000',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <span style={{ fontWeight: 600, letterSpacing: '0.05em', fontSize: '13px' }}>DOPPIO</span>

          <div style={{ position: 'relative', flex: '0 1 400px' }}>
            <input
              type="text"
              placeholder="Search cafe name to broadcast your location..."
              className="input-minimal"
              style={{ width: '100%', paddingLeft: '32px' }}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                searchPlaces(e.target.value);
              }}
            />
            <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </div>

            {searching && (
              <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: 'var(--text-tertiary)' }}>
                BUSY...
              </div>
            )}

            {suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                background: '#0a0a0a',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                zIndex: 3000,
                boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
              }}>
                {suggestions.map((p, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectPlace(p)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: i === suggestions.length - 1 ? 'none' : '1px solid #1a1a1a',
                      fontSize: '12px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontWeight: 500 }}>{p.display_name.split(',')[0]}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{p.display_name.split(',').slice(1, 3).join(',')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 500, marginLeft: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isCheckedIn ? '#4ade80' : '#404040' }}></span>
            BANGALORE
          </div>
          <span>{totalNodes} NODES_ACTIVE</span>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <MapView searchQuery={search} centerCoords={lastAddedCoords} />

          {activeSelection && !isCheckedIn && (
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              width: '320px'
            }}>
              <div className="panel" style={{ padding: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 700, marginBottom: '4px' }}>SELECTED LOCATION</div>
                <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>{activeSelection.name}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => {
                    checkIn(activeSelection.id, 'body-double');
                    setActiveSelection(null);
                  }} className="btn-minimal" style={{ width: '100%', height: '36px' }}>
                    Broadcast: Body Doubling
                  </button>
                  <button onClick={() => {
                    checkIn(activeSelection.id, 'focus');
                    setActiveSelection(null);
                  }} className="btn-border" style={{ width: '100%', height: '36px' }}>
                    Broadcast: Focus Mode
                  </button>
                  <button onClick={() => setActiveSelection(null)} style={{ border: 'none', background: 'none', color: 'var(--text-tertiary)', fontSize: '11px', marginTop: '4px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {isCheckedIn && (
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              width: '90%',
              maxWidth: '400px'
            }}>
              <div className="panel" style={{
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid #4ade80'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }}></div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#4ade80', fontWeight: 700 }}>LIVE_NOW</div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{currentCafe?.name}</div>
                  </div>
                </div>
                <button onClick={checkOut} className="btn-border" style={{ borderColor: '#ef4444', color: '#ef4444', height: '28px', padding: '0 12px' }}>Disconnect</button>
              </div>
            </div>
          )}

          {!isCheckedIn && !activeSelection && cafes.length === 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              zIndex: 10
            }}>
              <div style={{ opacity: 0.3, marginBottom: '16px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-secondary)' }}>Bangalore Node Map</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '8px' }}>Search a cafe above to broadcast your presence.</p>
            </div>
          )}
        </div>

        <aside className="hide-mobile" style={{
          width: '280px',
          borderLeft: '1px solid var(--border)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          background: '#000',
          flexShrink: 0
        }}>
          <div>
            <h3 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Local Node Identity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600 }}>BROADCAST_NAME</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="input-minimal"
                placeholder="Set nickname..."
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Network Stream</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {isCheckedIn ? (
                <DataRow
                  user={`${userName}.node`}
                  action={intent?.toUpperCase()}
                  loc={currentCafe?.name.toUpperCase().substring(0, 8)}
                  highlight
                />
              ) : (
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                  Awaiting local data broadcast...
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 'auto', padding: '12px', border: '1px solid var(--border)', borderRadius: '4px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '11px', lineHeight: '1.5' }}>
              Search for your current location to notify the network.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function DataRow({ user, action, loc, highlight = false }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontWeight: 500, color: highlight ? '#fff' : 'var(--text-secondary)' }}>{user}</span>
        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{loc}</span>
      </div>
      <div style={{ fontSize: '11px', color: highlight ? '#fb923c' : 'var(--text-tertiary)', fontWeight: 600 }}>{action}</div>
    </div>
  );
}
