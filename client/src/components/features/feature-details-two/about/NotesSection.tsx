import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../../hooks/useTourDetails';
import { getLang } from '../../../../utils/getLang';

const NotesSection = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();
  const notes = tour?.notes ?? [];
  if (notes.length === 0) return null;

  return (
    <div className="tg-tour-about-inner tg-tour-about-2-inner tg-tour-about-2-inner--plain mb-30">
      <h4 className="tg-tour-about-title mb-20">
        <i className="fa-solid fa-triangle-exclamation mr-10 tg-tour-section-title-icon"></i>
        {t('tour.sections.important_notes')}
      </h4>
      <div className="tg-tour-notes-list">
        {notes.map((note, i) => (
          <div key={i} className="tg-tour-note-item">
            <p className="mb-5">
              <i className="fa-solid fa-triangle-exclamation mr-8"></i>
              {getLang(note.title, lang)}
            </p>
            <p className="mb-0 lh-28">{getLang(note.text, lang)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesSection;
