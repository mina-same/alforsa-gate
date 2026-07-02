import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';

const LoginForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError(t('forms.required')); return; }
    setLoading(true);
    try {
      await authService.login(email, password);
      navigate('/admin', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message || t('forms.invalid');
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
            placeholder={t('forms.email')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="col-lg-12 mb-25">
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              type={showPwd ? 'text' : 'password'}
              placeholder={t('forms.password')}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              tabIndex={-1}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', color: '#888',
              }}
            >
              {showPwd ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {error && (
          <div className="col-lg-12 mb-15">
            <p style={{ color: '#ef4444', fontSize: 14, margin: 0 }}>{error}</p>
          </div>
        )}
        <div className="col-lg-12">
          <button type="submit" className="tg-btn w-100" disabled={loading}>
            {loading ? t('forms.signing_in') : t('forms.sign_in')}
          </button>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
