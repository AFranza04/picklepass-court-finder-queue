import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function PlayerDashboard() {
  const [serverMsg, setServerMsg] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/player/dashboard')
      .then((res) => setServerMsg(res.data.message))
      .catch(() => handleLogout());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '12px' }}>
        <h2>PicklePass | Player Dashboard</h2>
        <div>
          <span style={{ marginRight: '15px' }}>{user.fullName} ({user.role})</span>
          <button onClick={handleLogout} style={{ padding: '8px 14px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </header>

      <nav style={{ display: 'flex', gap: '15px', margin: '20px 0', backgroundColor: '#f3f4f6', padding: '12px', borderRadius: '6px' }}>
        <strong>Player Menu:</strong>
        <span>Find Nearby Courts (Map)</span> |
        <span>Join Digital Match Queue</span> |
        <span>My Queue Status & SMS Settings ({user.phoneNumber})</span>
      </nav>

      <div style={{ padding: '16px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '6px' }}>
        <p>{serverMsg}</p>
      </div>
    </div>
  );
}