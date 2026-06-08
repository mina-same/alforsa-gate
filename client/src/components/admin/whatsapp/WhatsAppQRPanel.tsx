import { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';

type SessionStatus = 'not_configured' | 'disconnected' | 'initializing' | 'qr_ready' | 'authenticating' | 'ready' | 'error';

interface QRData {
  qrCode: string;
  status: SessionStatus;
}

interface StatusData {
  status: SessionStatus;
  phone?: string;
  pushName?: string;
}

const STATUS_LABELS: Record<SessionStatus, string> = {
  not_configured: 'Not Configured',
  disconnected:   'Disconnected',
  initializing:   'Initializing…',
  qr_ready:       'Scan QR Code',
  authenticating: 'Authenticating…',
  ready:          'Connected',
  error:          'Error',
};

const STATUS_COLORS: Record<SessionStatus, string> = {
  not_configured: '#9ca3af',
  disconnected:   '#ef4444',
  initializing:   '#f59e0b',
  qr_ready:       '#3b82f6',
  authenticating: '#f59e0b',
  ready:          '#10b981',
  error:          '#ef4444',
};

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

const WhatsAppQRPanel = () => {
  const [qrData, setQrData]         = useState<QRData | null>(null);
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/whatsapp/status');
      setStatusData(data.data?.session ?? data.data ?? null);
    } catch {
      // ignore status errors silently
    }
  }, []);

  const fetchQR = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/whatsapp/qr');
      if (data.success && data.data) {
        setQrData(data.data);
      } else {
        setQrData(null);
        setError('QR code not available. The session may already be connected or not started yet.');
      }
    } catch (err: any) {
      setQrData(null);
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch QR code';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchQR();
  }, [fetchStatus, fetchQR]);

  // Poll while QR is displayed to detect when session connects
  useEffect(() => {
    if (qrData?.status !== 'qr_ready') return;
    const id = setInterval(async () => {
      try {
        const { data } = await api.get('/whatsapp/status');
        const session = data.data?.session ?? data.data;
        if (session?.status === 'ready') {
          setStatusData(session);
          setQrData(null);
          clearInterval(id);
        }
      } catch { /* ignore */ }
    }, 4000);
    return () => clearInterval(id);
  }, [qrData?.status]);

  const status: SessionStatus = (qrData?.status ?? statusData?.status ?? 'disconnected') as SessionStatus;
  const isConnected = status === 'ready';

  return (
    <div className="admin-content">
      <div className="admin-card" style={{ maxWidth: 520 }}>
        <div className="admin-card__head">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#25d366' }}><WhatsAppIcon /></span>
            WhatsApp Session
          </h3>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600, padding: '3px 10px',
            borderRadius: 12, background: STATUS_COLORS[status] + '20',
            color: STATUS_COLORS[status],
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLORS[status], display: 'inline-block' }} />
            {STATUS_LABELS[status] ?? status}
          </span>
        </div>

        <div className="admin-card__body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '24px 0' }}>

          {isConnected ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
              <p style={{ fontWeight: 600, color: '#10b981', marginBottom: 4 }}>Connected</p>
              {statusData?.phone && (
                <p style={{ color: '#6b7280', fontSize: 14 }}>+{statusData.phone}{statusData.pushName ? ` · ${statusData.pushName}` : ''}</p>
              )}
            </div>
          ) : loading ? (
            <div style={{ padding: 40, color: '#9ca3af', fontSize: 14 }}>Loading QR code…</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 16 }}>{error}</p>
              <button
                className="quick-action-btn quick-action-btn--outline"
                onClick={fetchQR}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <RefreshIcon /> Retry
              </button>
            </div>
          ) : qrData?.qrCode ? (
            <>
              <p style={{ color: '#6b7280', fontSize: 13, textAlign: 'center' }}>
                Open WhatsApp on your phone → Linked Devices → Link a Device, then scan this code.
              </p>
              <img
                src={qrData.qrCode}
                alt="WhatsApp QR Code"
                style={{ width: 240, height: 240, borderRadius: 12, border: '1px solid #e5e7eb' }}
              />
              <button
                className="quick-action-btn quick-action-btn--outline"
                onClick={fetchQR}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <RefreshIcon /> Refresh QR
              </button>
            </>
          ) : null}

        </div>
      </div>
    </div>
  );
};

export default WhatsAppQRPanel;
