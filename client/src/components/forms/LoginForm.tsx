import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      await authService.login(email, password);
      navigate('/admin', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message || 'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-lg-12 mb-25">
          <input
            className="input"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="col-lg-12 mb-25">
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error && (
          <div className="col-lg-12 mb-15">
            <p style={{ color: '#ef4444', fontSize: 14, margin: 0 }}>{error}</p>
          </div>
        )}
        <div className="col-lg-12">
          <button type="submit" className="tg-btn w-100" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
