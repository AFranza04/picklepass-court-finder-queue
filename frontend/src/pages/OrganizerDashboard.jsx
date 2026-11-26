import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function OrganizerDashboard() {
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [queue, setQueue] = useState([]);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [playersPerMatch, setPlayersPerMatch] = useState(4);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadCourts = async () => {
    try {
      const res = await api.get('/courts');
      setCourts(res.data);
    } catch {
      setError('Failed to load courts.');
    }
  };

  const loadQueue = async (court) => {
    setSelectedCourt(court);
    try {
      const res = await api.get(`/courts/${court.id}/queue`);
      setQueue(res.data);
    } catch {
      setError('Failed to load court queue.');
    }
  };

  useEffect(() => {
    loadCourts();
  }, []);

  const handleCreateCourt = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await api.post('/courts', { name, location, playersPerMatch: Number(playersPerMatch) });
      setMessage(res.data.message);
      setName('');
      setLocation('');
      await loadCourts();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create court.');
    }
  };

  const handleToggleStatus = async (court) => {
    setMessage('');
    setError('');
    try {
      const res = await api.put(`/courts/${court.id}/toggle-status`);
      setMessage(res.data.message);
      await loadCourts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleCallNext = async (court) => {
    setMessage('');
    setError('');
    try {
      const res = await api.post(`/courts/${court.id}/call-next`);
      setMessage(res.data.message);
      await loadCourts();
      await loadQueue(court);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to call next match.');
    }
  };

  const handleCompleteMatch = async (court) => {
    setMessage('');
    setError('');
    try {
      const res = await api.post(`/courts/${court.id}/complete-match`);
      setMessage(res.data.message);
      await loadCourts();
      await loadQueue(court);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to complete match.');
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
        <h2>PicklePass | Organizer Court & Queue Control</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link to="/profile" style={{ padding: '8px 14px', backgroundColor: '#15803d', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '14px' }}>
            Profile & Password
          </Link>
          <button type="button" onClick={handleLogout} style={{ backgroundColor: '#dc2626' }}>
            Logout
          </button>
        </div>
      </header>

      {message && <p style={{ color: '#065f46', backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '6px', marginTop: '12px' }}>{message}</p>}
      {error && <p style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px', marginTop: '12px' }}>{error}</p>}

      <section style={{ marginTop: '20px', padding: '16px', border: '1px solid #d1d5db', borderRadius: '10px', backgroundColor: '#f9fafb' }}>
        <h3 style={{ marginTop: 0, color: '#0f5132' }}>Open a New Court Session</h3>
        <form onSubmit={handleCreateCourt} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <input type="text" placeholder="Court Name (e.g., Tungkop Court 1)" required value={name} onChange={(e) => setName(e.target.value)} />
          <input type="text" placeholder="Venue Location" required value={location} onChange={(e) => setLocation(e.target.value)} />
          <select value={playersPerMatch} onChange={(e) => setPlayersPerMatch(e.target.value)}>
            <option value={4}>Doubles (4 Players/Match)</option>
            <option value={2}>Singles (2 Players/Match)</option>
          </select>
          <button type="submit">Create Court</button>
        </form>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px', marginTop: '20px' }}>
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
            <p style={{ textAlign: 'left', margin: '6px 0', color: '#4b5563', fontSize: '14px' }}>{c.location}</p>
            <p style={{ textAlign: 'left', margin: '4px 0', fontSize: '13px' }}>
              On Court: <strong>{c.onCourtCount}</strong> | Waiting: <strong>{c.waitingCount}</strong>
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button type="button" onClick={() => loadQueue(c)} style={{ backgroundColor: '#15803d', flex: 1 }}>
                Manage Queue
              </button>
              <button type="button" onClick={() => handleToggleStatus(c)} style={{ backgroundColor: '#374151', flex: 1 }}>
                {c.status === 'OPEN' ? 'Close Court' : 'Reopen Court'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedCourt && (
        <section style={{ marginTop: '28px', padding: '18px', border: '1px solid #10b981', borderRadius: '10px', backgroundColor: '#f9fafb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, color: '#0f5132' }}>Queue Rotation — {selectedCourt.name}</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => handleCallNext(selectedCourt)} style={{ width: 'auto', padding: '8px 14px' }}>
                Call Next Match ({selectedCourt.playersPerMatch} Players)
              </button>
              <button type="button" onClick={() => handleCompleteMatch(selectedCourt)} style={{ backgroundColor: '#1d4ed8', width: 'auto', padding: '8px 14px' }}>
                Finish Current Match
              </button>
            </div>
          </div>
          {queue.length === 0 ? (
            <p style={{ textAlign: 'left', color: '#6b7280' }}>No players currently queued for this court.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #d1d5db' }}>
                  <th style={{ padding: '8px' }}>Turn #</th>
                  <th style={{ padding: '8px' }}>Player Name</th>
                  <th style={{ padding: '8px' }}>Mobile (Alert)</th>
                  <th style={{ padding: '8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item, idx) => (
                  <tr key={item.entryId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px' }}>#{idx + 1}</td>
                    <td style={{ padding: '8px' }}>{item.playerName}</td>
                    <td style={{ padding: '8px' }}>{item.phoneNumber}</td>
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