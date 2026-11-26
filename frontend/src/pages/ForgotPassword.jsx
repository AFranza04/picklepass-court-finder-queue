import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setInfo(res.data.message);
      setResetToken(res.data.resetToken);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to process password reset request.');
    }
  };

  return (
    <div>
      <h2>PicklePass — Forgot Password</h2>
      {error && <p style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px' }}>{error}</p>}
      {info && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', padding: '12px', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>
          <p style={{ marginTop: 0, color: '#065f46', textAlign: 'left' }}>{info}</p>
          <p style={{ marginTop: '8px', wordBreak: 'break-all', textAlign: 'left', color: '#111827' }}>
            <strong>Single-Use Reset Token:</strong> {resetToken}
          </p>
          <button
            type="button"
            onClick={() => navigate(`/reset-password?token=${resetToken}`)}
            style={{ marginTop: '10px', width: '100%', padding: '10px', backgroundColor: '#15803d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Proceed to Reset Password
          </button>
        </div>
      )}
      <form onSubmit={handleRequestReset}>
        <input
          type="email"
          placeholder="Enter your registered email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Send Reset Token</button>
      </form>
      <p><Link to="/login">Back to Login</Link></p>
    </div>
  );
}