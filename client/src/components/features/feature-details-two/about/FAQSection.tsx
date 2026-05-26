import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../../hooks/useTourDetails';
import { getLang } from '../../../../utils/getLang';

const FAQSection = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = tour?.faqs ?? [];
  if (faqs.length === 0) return null;

  return (
    <div className="tg-tour-about-inner tg-tour-about-2-inner tg-tour-about-2-inner--plain mb-30">
      <h4 className="tg-tour-about-title mb-20">
        <i className="fa-solid fa-circle-question mr-10 tg-tour-section-title-icon"></i>
        {t('tour.sections.faq')}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: lang === 'ar' ? 'right' : 'left',
                  fontWeight: 600,
                  fontSize: 14,
                  color: isOpen ? 'var(--tg-color-1, #7b2ff7)' : '#333',
                  gap: 12,
                }}
              >
                <span>{getLang(faq.question, lang)}</span>
                <i
                  className={`fa-sharp fa-solid fa-${isOpen ? 'minus' : 'plus'}`}
                  style={{ fontSize: 12, flexShrink: 0, color: 'var(--tg-color-1, #7b2ff7)' }}
                />
              </button>
              {isOpen && (
                <div style={{ padding: '0 18px 16px 18px' }}>
                  {typeof getLang(faq.answer, lang) === 'string' ? (
                    <p className="mb-0 lh-28" style={{ color: '#555', fontSize: 14 }}>
                      {getLang(faq.answer, lang)}
                    </p>
                  ) : (
                    <div className="mb-0 lh-28" style={{ color: '#555', fontSize: 14 }}
                      dangerouslySetInnerHTML={{ __html: getLang(faq.answer, lang) }} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQSection;
