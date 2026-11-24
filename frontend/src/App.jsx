import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PlayerDashboard from './pages/PlayerDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import ProfileSettings from './pages/ProfileSettings';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={
          <ProtectedRoute><ProfileSettings /></ProtectedRoute>
        } />
        <Route path="/player/dashboard" element={
          <ProtectedRoute allowedRole="PLAYER"><PlayerDashboard /></ProtectedRoute>
        } />
        <Route path="/organizer/dashboard" element={
          <ProtectedRoute allowedRole="ORGANIZER"><OrganizerDashboard /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}