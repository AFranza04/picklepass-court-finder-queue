import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'PLAYER',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', form);
      alert('Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Check all fields.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>PicklePass — Create Account</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Full Name"
          required
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Email Address"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Mobile Number (for SMS Turn Alerts)"
          required
          value={form.phoneNumber}
          onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          minLength={6}
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          style={styles.input}
        />
        <label style={styles.label}>Select Account Role:</label>
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          style={styles.input}
        >
          <option value="PLAYER">Pickleball Player</option>
          <option value="ORGANIZER">Court Organizer / Venue Owner</option>
        </select>
        <button type="submit" style={styles.button}>Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
}

const styles = {
  container: { maxWidth: '400px', margin: '60px auto', padding: '24px', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'sans-serif' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '10px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' },
  label: { fontSize: '13px', fontWeight: 'bold' },
  button: { padding: '10px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  error: { color: '#dc2626', backgroundColor: '#fee2e2', padding: '8px', borderRadius: '4px', fontSize: '13px' }
};