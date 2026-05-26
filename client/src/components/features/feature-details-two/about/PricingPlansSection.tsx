import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../../hooks/useTourDetails';
import { getLang } from '../../../../utils/getLang';

type Currency = 'USD' | 'EGP' | 'SAR';

const CURRENCY_SYMBOLS: Record<Currency, string> = { USD: '$', EGP: 'EGP ', SAR: 'SAR ' };
const PAX_KEYS = ['solo', 'pax_2_4', 'pax_5_8', 'pax_9_16'] as const;

const PricingPlansSection = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();
  const [currency, setCurrency] = useState<Currency>('USD');
  const [activeSeason, setActiveSeason] = useState(0);

  const plans = tour?.pricingPlans ?? [];
  if (plans.length === 0) return null;

  const PAX_LABELS: Record<string, string> = {
    solo: t('tour.pricing.solo'),
    pax_2_4: t('tour.pricing.pax_2_4'),
    pax_5_8: t('tour.pricing.pax_5_8'),
    pax_9_16: t('tour.pricing.pax_9_16'),
  };

  return (
    <div className="tg-tour-about-inner tg-tour-about-2-inner tg-tour-about-2-inner--plain mb-30">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-20">
        <h4 className="tg-tour-about-title mb-0">
          <i className="fa-solid fa-tags mr-10 tg-tour-section-title-icon"></i>
          {t('tour.sections.tour_pricing')}
        </h4>
        <div className="d-flex" style={{ gap: 6 }}>
          {(['USD', 'EGP', 'SAR'] as Currency[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={currency === c ? 'tg-btn tg-btn-switch-animation' : 'tg-btn tg-btn-gray'}
              style={{ padding: '6px 14px', fontSize: 13, minWidth: 56 }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {plans.map((plan) => (
        <div key={plan.planName} className="mb-25">
          <div className="d-flex flex-wrap mb-15" style={{ gap: 8 }}>
            {plan.seasons.map((season, si) => (
              <button
                key={si}
                type="button"
                onClick={() => setActiveSeason(si)}
                className={activeSeason === si ? 'tg-btn tg-btn-switch-animation' : 'tg-btn tg-btn-gray'}
                style={{ padding: '8px 14px', fontSize: 12, lineHeight: 1.3, textAlign: lang === 'ar' ? 'right' : 'left' }}
              >
                {season.seasonName}
              </button>
            ))}
          </div>

          {plan.seasons[activeSeason] && (
            <div style={{ overflowX: 'auto' }}>
              <table className="tg-tour-pricing-table">
                <thead>
                  <tr>
                    <th>{t('tour.pricing.group_size')}</th>
                    <th>{t('tour.pricing.price_per_person')}</th>
                  </tr>
                </thead>
                <tbody>
                  {PAX_KEYS.map((key, ri) => {
                    const priceObj = plan.seasons[activeSeason].prices[key];
                    const price = priceObj?.[currency];
                    return (
                      <tr key={key} className={ri % 2 === 0 ? 'is-even' : undefined}>
                        <td>{PAX_LABELS[key]}</td>
                        <td>{price != null ? `${CURRENCY_SYMBOLS[currency]}${price.toLocaleString()}` : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {plan.notes?.map((note, ni) => (
            <div key={ni} className="tg-tour-pricing-note mt-15">
              <strong>{getLang(note.title, lang)}: </strong>
              <span>{getLang(note.text, lang)}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PricingPlansSection;
