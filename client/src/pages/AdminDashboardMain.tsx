import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AdminLayout from '../components/admin/AdminLayout';
import SEO from '../components/SEO';

const AdminGate = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f9fafb', fontFamily: 'Poppins, sans-serif', color: '#6b7280', fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  if (!user) return null;

  return <AdminLayout />;
};

const AdminDashboardMain = () => (
  <AuthProvider>
    <SEO pageTitle="Admin Dashboard" />
    <AdminGate />
  </AuthProvider>
);

export default AdminDashboardMain;
