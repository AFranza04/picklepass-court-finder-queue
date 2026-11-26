import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword, confirmPassword });
      alert(res.data.message);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Token may be invalid or expired.');
    }
  };

  return (
    <div>
      <h2>PicklePass — Reset Password</h2>
      {error && <p style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px' }}>{error}</p>}
      <form onSubmit={handleReset}>
        <input
          type="text"
          placeholder="Reset Token"
          required
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password (min 6 characters)"
          minLength={6}
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          minLength={6}
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit">Reset Password</button>
      </form>
      <p><Link to="/login">Back to Login</Link></p>
    </div>
  );
}