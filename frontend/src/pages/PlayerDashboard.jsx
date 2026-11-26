import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function PlayerDashboard() {
  const [courts, setCourts] = useState([]);
  const [myQueues, setMyQueues] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [queue, setQueue] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const loadCourts = async (q = searchQuery, st = statusFilter) => {
    try {
      const res = await api.get('/courts', { params: { query: q, status: st } });
      setCourts(res.data);
    } catch {
      setError('Failed to load courts.');
    }
  };

  const loadMyQueues = async () => {
    try {
      const res = await api.get('/courts/my-queues');
      setMyQueues(res.data);
    } catch {
      setMyQueues([]);
    }
  };

  const loadQueue = async (court) => {
    setSelectedCourt(court);
    try {
      const res = await api.get(`/courts/${court.id}/queue`);
      setQueue(res.data);
    } catch {
      setError('Failed to load queue details.');
    }
  };

  useEffect(() => {
    loadCourts();
    loadMyQueues();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadCourts(searchQuery, statusFilter);
  };

  const handleJoin = async (court) => {
    setMessage('');
    setError('');
    try {
      const res = await api.post(`/courts/${court.id}/join`);
      setMessage(res.data.message);
      await loadCourts();
      await loadMyQueues();
      await loadQueue(court);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to join queue.');
    }
  };

  const handleLeave = async (courtId) => {
    setMessage('');
    setError('');
    try {
      const res = await api.delete(`/courts/${courtId}/leave`);
      setMessage(res.data.message);
      await loadCourts();
      await loadMyQueues();
      if (selectedCourt && selectedCourt.id === courtId) {
        await loadQueue(selectedCourt);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to leave queue.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div>
      <header>
        <h2>PicklePass | Player Court Finder & Queue</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link to="/profile" style={{ padding: '8px 14px', backgroundColor: '#15803d', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '14px' }}>
            Profile & Password
          </Link>
          <button type="button" onClick={handleLogout} style={{ backgroundColor: '#dc2626' }}>
            Logout
          </button>
        </div>
      </header>

      <p style={{ textAlign: 'left', marginTop: '12px' }}>
        Welcome, <strong>{user.fullName || 'Player'}</strong>! Search open pickleball courts and join a live match queue.
      </p>

      {message && <p style={{ color: '#065f46', backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '6px' }}>{message}</p>}
      {error && <p style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px' }}>{error}</p>}

      {myQueues.length > 0 && (
        <section style={{ marginTop: '14px', padding: '14px', border: '1px solid #10b981', borderRadius: '10px', backgroundColor: '#ecfdf5' }}>
          <h3 style={{ marginTop: 0, marginBottom: '8px', color: '#065f46' }}>My Active Queue Turns</h3>
          {myQueues.map((q) => (
            <div key={q.entryId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #a7f3d0' }}>
              <span>
                <strong>{q.courtName}</strong> ({q.location}) — Turn <strong>#{q.position}</strong> [{q.status}]
              </span>
              {q.status === 'WAITING' && (
                <button type="button" onClick={() => handleLeave(q.courtId)} style={{ backgroundColor: '#b91c1c', width: 'auto', padding: '6px 12px' }}>
                  Cancel Turn
                </button>
              )}
            </div>
          ))}
        </section>
      )}

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search court name or location (e.g., Tungkop, Minglanilla)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 2, minWidth: '220px' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            loadCourts(searchQuery, e.target.value);
          }}
          style={{ flex: 1, minWidth: '140px' }}
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">OPEN Courts Only</option>
          <option value="CLOSED">CLOSED Courts</option>
        </select>
        <button type="submit" style={{ width: 'auto', padding: '10px 18px' }}>Search</button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px', marginTop: '18px' }}>
        {courts.map((c) => (
          <div key={c.id} style={{ border: '1px solid #d1d5db', borderRadius: '10px', padding: '16px', backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#0f5132' }}>{c.name}</h3>
              <span style={{
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: c.status === 'OPEN' ? '#dcfce7' : '#fee2e2',
                color: c.status === 'OPEN' ? '#166534' : '#991b1b'
              }}>
                {c.status}
              </span>
            </div>
            <p style={{ textAlign: 'left', margin: '6px 0', color: '#4b5563', fontSize: '14px' }}>Location: {c.location}</p>
            <p style={{ textAlign: 'left', margin: '4px 0', fontSize: '13px' }}>
              Format: <strong>{c.playersPerMatch === 4 ? 'Doubles (4)' : 'Singles (2)'}</strong> | On Court: <strong>{c.onCourtCount}</strong> | Waiting: <strong>{c.waitingCount}</strong>
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button type="button" onClick={() => loadQueue(c)} style={{ backgroundColor: '#374151', flex: 1 }}>
                View Queue
              </button>
              <button
                type="button"
                disabled={c.status !== 'OPEN'}
                onClick={() => handleJoin(c)}
                style={{ flex: 1, opacity: c.status === 'OPEN' ? 1 : 0.5 }}
              >
                Join Queue
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedCourt && (
        <section style={{ marginTop: '28px', padding: '18px', border: '1px solid #10b981', borderRadius: '10px', backgroundColor: '#f9fafb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#0f5132' }}>Live Queue — {selectedCourt.name}</h3>
            <button type="button" onClick={() => handleLeave(selectedCourt.id)} style={{ backgroundColor: '#b91c1c', width: 'auto', padding: '8px 14px' }}>
              Leave Waiting Queue
            </button>
          </div>
          {queue.length === 0 ? (
            <p style={{ textAlign: 'left', color: '#6b7280' }}>No players in this queue yet. Be the first to join!</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #d1d5db' }}>
                  <th style={{ padding: '8px' }}>Turn #</th>
                  <th style={{ padding: '8px' }}>Player</th>
                  <th style={{ padding: '8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item, idx) => (
                  <tr key={item.entryId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px' }}>#{idx + 1}</td>
                    <td style={{ padding: '8px' }}>{item.playerName}</td>
                    <td style={{ padding: '8px', fontWeight: 'bold', color: item.status === 'ON_COURT' ? '#15803d' : '#b45309' }}>
                      {item.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}