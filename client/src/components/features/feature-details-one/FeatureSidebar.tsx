import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../hooks/useTourDetails';
import bookingService from '../../../services/bookingService';
import { getLang } from '../../../utils/getLang';

const FeatureSidebar = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();

  const adultPrice  = tour?.priceStartingFrom?.USD ?? 20;
  const youthPrice  = Math.round(adultPrice * 0.8);
  const childPrice  = Math.round(adultPrice * 0.6);
  const remaining   = tour?.groupSize?.remaining ?? 0;
  const total_spots = tour?.groupSize?.total ?? 0;

  // Dynamic extras from tour model
  const tourExtras = tour?.extras ?? [];

  // Form state
  const [date,          setDate]          = useState('');
  const [time,          setTime]          = useState<'12:00' | '19:00'>('12:00');
  const [adults,        setAdults]        = useState(0);
  const [youth,         setYouth]         = useState(0);
  const [children,      setChildren]      = useState(0);
  const [extraChecked,  setExtraChecked]  = useState<boolean[]>([]);
  const [customerName,  setCustomerName]  = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes,         setNotes]         = useState('');
  const [fieldErrors,   setFieldErrors]   = useState<Record<string, string>>({});
  const [submitting,    setSubmitting]    = useState(false);
  const [success,       setSuccess]       = useState(false);
  const [serverError,   setServerError]   = useState('');
  const [showExtras,    setShowExtras]    = useState(false);
  const [showOptional,  setShowOptional]  = useState(false);

  // Sync checked state length when tour extras load
  useEffect(() => {
    setExtraChecked(prev =>
      prev.length === tourExtras.length ? prev : new Array(tourExtras.length).fill(false)
    );
  }, [tourExtras.length]);

  const pax = adults + youth + children;

  const totalAmount =
    adults * adultPrice +
    youth  * youthPrice +
    children * childPrice +
    tourExtras.reduce((sum, ex, i) =>
      extraChecked[i] ? sum + (ex.price?.USD ?? 0) * (ex.perPerson ? pax : 1) : sum, 0);

  const toggleExtra = (i: number) =>
    setExtraChecked(prev => prev.map((v, idx) => (idx === i ? !v : v)));

  const counter = (val: number, set: (n: number) => void) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        type="button"
        onClick={() => set(Math.max(0, val - 1))}
        style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
      >−</button>
      <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>{val}</span>
      <button
        type="button"
        onClick={() => set(val + 1)}
        style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
      >+</button>
    </div>
  );

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!date) errs.date = t('tour.sidebar.error_date');
    if (pax === 0) errs.pax = t('tour.sidebar.error_pax');
    if (!customerName.trim()) errs.customerName = t('tour.sidebar.error_name');
    if (!customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
      errs.customerEmail = t('tour.sidebar.error_email');
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setServerError('');
    setSubmitting(true);
    try {
      await bookingService.submitBooking({
        tourId:        tour!._id,
        tourName:      tour!.heading,
        tourSlug:      getLang(tour!.slug, lang),
        customerName:  customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || undefined,
        travelDate:    date,
        travelTime:    time,
        adults,
        youth,
        children,
        extras: tourExtras
          .map((ex, i) => extraChecked[i]
            ? { label: getLang(ex.label, lang), price: ex.price?.USD ?? 0 }
            : null)
          .filter(Boolean) as Array<{ label: string; price: number }>,
        totalAmount,
        notes: notes.trim() || undefined,
      });
      setSuccess(true);
    } catch {
      setServerError(t('tour.sidebar.booking_error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px' }}>
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ marginBottom: 16 }}>
          <circle cx="26" cy="26" r="26" fill="#22c55e" opacity=".15" />
          <path d="M16 26l7 7 13-13" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h5 style={{ color: '#15803d', marginBottom: 8 }}>
          {t('tour.sidebar.booking_success_title')}
        </h5>
        <p style={{ color: '#555', fontSize: 14 }}>
          {t('tour.sidebar.booking_success_body')}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bks-form">
      <style>{`
        @media (min-width: 992px) {
          .bks-form { display: flex; flex-direction: column; max-height: calc(100vh - 190px); }
          .bks-scroll { flex: 1 1 auto; min-height: 0; overflow-y: auto; margin-right: -14px; padding-right: 14px; }
          .bks-scroll { scrollbar-width: thin; scrollbar-color: #d1d5db transparent; }
          .bks-scroll::-webkit-scrollbar { width: 5px; }
          .bks-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
        }
        .bks-footer { padding-top: 14px; border-top: 1px dashed #e5e7eb; }
        .bks-section-toggle {
          width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px;
          background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;
          padding: 10px 12px; font-size: 13px; font-weight: 600; color: #374151; cursor: pointer;
        }
        .bks-section-toggle:hover { background: #f3f4f6; }
        .bks-section-toggle svg { transition: transform .2s ease-out; flex-shrink: 0; }
        .bks-section-toggle--open svg { transform: rotate(180deg); }

        /* Customer-detail inputs (name / email / phone / special requests) */
        .bks-form .bks-field { gap: 4px; margin-bottom: 8px; }
        .bks-form .bks-field .input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #fff;
          padding: 8px 12px;
          font-size: 13.5px;
          line-height: 1.45;
          color: #111827;
          outline: none;
          box-shadow: none;
          transition: border-color .15s ease, box-shadow .15s ease;
        }
        .bks-form .bks-field .input:hover { border-color: #cbd5e1; }
        .bks-form .bks-field .input:focus {
          border-color: var(--tg-theme-primary, #560CE3);
          box-shadow: 0 0 0 3px rgba(86, 12, 227, 0.08);
        }
        .bks-form .bks-field .input::placeholder { color: #9ca3af; opacity: 1; }
        .bks-form .bks-field textarea.input { min-height: 64px; }
      `}</style>

      <h4 className="tg-tour-about-title title-2 mb-15">{t('tour.sidebar.book_this_tour')}</h4>

      {total_spots > 0 && (
        <div className="mb-15" style={{ fontSize: 13, color: '#555' }}>
          <span style={{ fontWeight: 600, color: remaining <= 4 ? '#ef4444' : '#22c55e' }}>
            {remaining} {t('tour.sidebar.spots_available')}
          </span>{' '}
          {t('tour.sidebar.available_out_of')} {total_spots}
        </div>
      )}

      <div className="bks-scroll">

      {/* Date */}
      <div className="tg-booking-form-parent-inner mb-10">
        <div className="tg-tour-about-date p-relative">
          <input
            className="input"
            type="date"
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => { setDate(e.target.value); setFieldErrors(prev => ({ ...prev, date: '' })); }}
            style={{ paddingLeft: 36 }}
          />
          <span className="calender">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11.1111 1V3.80003M4.88888 1V3.80003M1 6.59992H15M2.55556 2.39988H13.4444C14.3036 2.39988 15 3.02668 15 3.79989V13.6C15 14.3732 14.3036 15 13.4444 15H2.55556C1.69645 15 1 14.3732 1 13.6V3.79989C1 3.02668 1.69645 2.39988 2.55556 2.39988Z" stroke="#560CE3" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
        {fieldErrors.date && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fieldErrors.date}</p>}
      </div>

      {/* Time */}
      <div className="tg-tour-about-time d-flex align-items-center mb-10">
        <span className="time">{t('tour.sidebar.time')}</span>
        <div className="form-check mr-15">
          <input className="form-check-input" type="radio" name="travelTime" id="time1"
            checked={time === '12:00'} onChange={() => setTime('12:00')} />
          <label className="form-check-label" htmlFor="time1">12:00</label>
        </div>
        <div className="form-check">
          <input className="form-check-input" type="radio" name="travelTime" id="time2"
            checked={time === '19:00'} onChange={() => setTime('19:00')} />
          <label className="form-check-label" htmlFor="time2">19:00</label>
        </div>
      </div>

      <div className="tg-tour-about-border-doted mb-15"></div>

      {/* Tickets */}
      <div className="tg-tour-about-tickets-wrap mb-15">
        <span className="tg-tour-about-sidebar-title">{t('tour.sidebar.tickets')}</span>

        <div className="tg-tour-about-tickets mb-10">
          <div className="tg-tour-about-tickets-adult">
            <span>{t('tour.sidebar.adult')}</span>
            <p className="mb-0">{t('tour.sidebar.adult_age')} <span>${adultPrice}</span></p>
          </div>
          <div className="tg-tour-about-tickets-quantity">{counter(adults, setAdults)}</div>
        </div>

        <div className="tg-tour-about-tickets mb-10">
          <div className="tg-tour-about-tickets-adult">
            <span>{t('tour.sidebar.youth')}</span>
            <p className="mb-0">{t('tour.sidebar.youth_age')} <span>${youthPrice}</span></p>
          </div>
          <div className="tg-tour-about-tickets-quantity">{counter(youth, setYouth)}</div>
        </div>

        <div className="tg-tour-about-tickets mb-10">
          <div className="tg-tour-about-tickets-adult">
            <span>{t('tour.sidebar.children')}</span>
            <p className="mb-0">{t('tour.sidebar.children_age')} <span>${childPrice}</span></p>
          </div>
          <div className="tg-tour-about-tickets-quantity">{counter(children, setChildren)}</div>
        </div>
        {fieldErrors.pax && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fieldErrors.pax}</p>}
      </div>

      {/* Extras — shown only when the tour has add-ons, collapsed by default */}
      {tourExtras.length > 0 && (
        <>
          <div className="tg-tour-about-border-doted mb-15"></div>
          <div className="tg-tour-about-extra mb-15">
            <button
              type="button"
              className={`bks-section-toggle${showExtras ? ' bks-section-toggle--open' : ''}`}
              aria-expanded={showExtras}
              onClick={() => setShowExtras(v => !v)}
            >
              <span>
                {t('tour.sidebar.add_extra')}
                {!showExtras && extraChecked.some(Boolean) && (
                  <span style={{ fontWeight: 500, color: '#560CE3', marginLeft: 6 }}>
                    ({extraChecked.filter(Boolean).length})
                  </span>
                )}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 9l6 6 6-6" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {showExtras && (
            <div className="tg-filter-list" style={{ marginTop: 10 }}>
              <ul>
                {tourExtras.map((ex, i) => (
                  <li key={i}>
                    <div className="checkbox d-flex">
                      <input
                        className="tg-checkbox"
                        type="checkbox"
                        id={`extra-${i}`}
                        checked={extraChecked[i] ?? false}
                        onChange={() => toggleExtra(i)}
                      />
                      <label htmlFor={`extra-${i}`} className="tg-label">
                        {getLang(ex.label, lang)}
                        {ex.perPerson ? ` ($${ex.price?.USD ?? 0}/person)` : ''}
                      </label>
                    </div>
                    <span className="quantity">${ex.price?.USD ?? 0}.00</span>
                  </li>
                ))}
                {adults > 0 && (
                  <li>
                    <span className="adult">{t('tour.sidebar.adult')} ×{adults}:</span>
                    <span className="quantity">${adults * adultPrice}.00</span>
                  </li>
                )}
                {youth > 0 && (
                  <li>
                    <span className="adult">{t('tour.sidebar.youth')} ×{youth}:</span>
                    <span className="quantity">${youth * youthPrice}.00</span>
                  </li>
                )}
                {children > 0 && (
                  <li>
                    <span className="adult">{t('tour.sidebar.children')} ×{children}:</span>
                    <span className="quantity">${children * childPrice}.00</span>
                  </li>
                )}
              </ul>
            </div>
            )}
          </div>
        </>
      )}

      <div className="tg-tour-about-border-doted mb-15"></div>

      {/* Customer info */}
      <div className="mb-15">
        <span className="tg-tour-about-sidebar-title mb-10 d-inline-block">
          {t('tour.sidebar.your_details')}
        </span>

        <div className="bks-field mb-10">
          <label className="bks-field__label bks-field__label--required" htmlFor="bks-name">
            {t('tour.sidebar.your_name')}
          </label>
          <input
            id="bks-name"
            className={`input${fieldErrors.customerName ? ' bks-field--error' : ''}`}
            type="text"
            autoComplete="name"
            placeholder="John Smith"
            value={customerName}
            onChange={e => { setCustomerName(e.target.value); setFieldErrors(prev => ({ ...prev, customerName: '' })); }}
          />
          {fieldErrors.customerName && (
            <p style={{ color: '#ef4444', fontSize: 12, marginTop: 3 }}>{fieldErrors.customerName}</p>
          )}
        </div>

        <div className="bks-field mb-10">
          <label className="bks-field__label bks-field__label--required" htmlFor="bks-email">
            {t('tour.sidebar.your_email')}
          </label>
          <input
            id="bks-email"
            className={`input${fieldErrors.customerEmail ? ' bks-field--error' : ''}`}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={customerEmail}
            onChange={e => { setCustomerEmail(e.target.value); setFieldErrors(prev => ({ ...prev, customerEmail: '' })); }}
          />
          {fieldErrors.customerEmail && (
            <p style={{ color: '#ef4444', fontSize: 12, marginTop: 3 }}>{fieldErrors.customerEmail}</p>
          )}
        </div>

        <button
          type="button"
          className={`bks-section-toggle${showOptional ? ' bks-section-toggle--open' : ''}`}
          aria-expanded={showOptional}
          onClick={() => setShowOptional(v => !v)}
        >
          <span>
            {t('tour.sidebar.your_phone')} / {t('tour.sidebar.notes')}
            <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 6 }}>(optional)</span>
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {showOptional && (
          <div style={{ marginTop: 10 }}>
            <div className="bks-field mb-10">
              <label className="bks-field__label" htmlFor="bks-phone">
                {t('tour.sidebar.your_phone')}
                <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 4 }}>(optional)</span>
              </label>
              <input
                id="bks-phone"
                className="input"
                type="tel"
                autoComplete="tel"
                placeholder="+1 234 567 8900"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
              />
            </div>

            <div className="bks-field mb-10">
              <label className="bks-field__label" htmlFor="bks-notes">
                {t('tour.sidebar.notes')}
                <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 4 }}>(optional)</span>
              </label>
              <textarea
                id="bks-notes"
                className="input"
                placeholder="Dietary requirements, accessibility needs…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        )}
      </div>

      </div>{/* /bks-scroll */}

      <div className="bks-footer">
      {/* Total */}
      <div className="tg-tour-about-coast d-flex align-items-center flex-wrap justify-content-between mb-20">
        <span className="tg-tour-about-sidebar-title d-inline-block">{t('tour.sidebar.total_cost')}</span>
        <h5 className="total-price">${totalAmount.toFixed(2)}</h5>
      </div>

      {serverError && (
        <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{serverError}</p>
      )}

      <button type="submit" className="tg-btn tg-btn-switch-animation w-100" disabled={submitting}>
        {submitting ? t('tour.sidebar.submitting') : t('tour.sidebar.book_now')}
      </button>
      </div>{/* /bks-footer */}
    </form>
  );
};

export default FeatureSidebar;
