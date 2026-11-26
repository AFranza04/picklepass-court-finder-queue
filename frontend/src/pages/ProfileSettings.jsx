import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ProfileSettings() {
  const [profile, setProfile] = useState({ fullName: '', email: '', phoneNumber: '', role: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    api.get('/profile')
      .then((res) => setProfile(res.data))
      .catch(() => navigate('/login'));
  }, [navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    try {
      const res = await api.put('/profile', {
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
      });
      setProfileMsg(res.data.message);
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...storedUser,
        fullName: res.data.fullName,
        phoneNumber: res.data.phoneNumber,
      }));
    } catch (err) {
      setProfileErr(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassMsg('');
    setPassErr('');
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassErr('New password and confirmation do not match.');
      return;
    }
    try {
      const res = await api.put('/profile/change-password', passwords);
      setPassMsg(res.data.message);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassErr(err.response?.data?.message || 'Failed to change password.');
    }
  };

  const backPath = profile.role === 'ORGANIZER' ? '/organizer/dashboard' : '/player/dashboard';

  return (
    <div>
      <header>
        <h2>PicklePass | Account & Security Settings</h2>
        <button
          type="button"
          onClick={() => navigate(backPath)}
          style={{ backgroundColor: '#374151' }}
        >
          Back to Dashboard
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginTop: '24px' }}>
        <section>
          <h3 style={{ marginBottom: '12px', color: '#0f5132' }}>Profile Information</h3>
          {profileMsg && <p style={{ color: '#065f46', backgroundColor: '#ecfdf5', padding: '8px', borderRadius: '6px', marginTop: 0 }}>{profileMsg}</p>}
          {profileErr && <p style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '8px', borderRadius: '6px', marginTop: 0 }}>{profileErr}</p>}
          <form onSubmit={handleProfileUpdate}>
            <label>Email Address (Read-only)</label>
            <input type="email" value={profile.email} disabled />

            <label>Account Role</label>
            <input type="text" value={profile.role} disabled />

            <label>Full Name</label>
            <input
              type="text"
              required
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            />

            <label>Mobile Number (SMS Turn Alerts)</label>
            <input
              type="text"
              required
              value={profile.phoneNumber}
              onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
            />

            <button type="submit">Save Profile Changes</button>
          </form>
        </section>

        <section>
          <h3 style={{ marginBottom: '12px', color: '#0f5132' }}>Change Password</h3>
          {passMsg && <p style={{ color: '#065f46', backgroundColor: '#ecfdf5', padding: '8px', borderRadius: '6px', marginTop: 0 }}>{passMsg}</p>}
          {passErr && <p style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '8px', borderRadius: '6px', marginTop: 0 }}>{passErr}</p>}
          <form onSubmit={handlePasswordChange}>
            <label>Current Password</label>
            <input
              type="password"
              required
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            />

            <label>New Password (min 6 characters)</label>
            <input
              type="password"
              minLength={6}
              required
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            />

            <label>Confirm New Password</label>
            <input
              type="password"
              minLength={6}
              required
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
            />

            <button type="submit">Update Password</button>
          </form>
        </section>
      </div>
    </div>
  );
}