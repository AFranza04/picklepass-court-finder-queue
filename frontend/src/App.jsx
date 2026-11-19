import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PlayerDashboard from './pages/PlayerDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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