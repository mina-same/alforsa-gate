import { useTranslation } from 'react-i18next';

const ReviewForm = () => {
   const { t } = useTranslation();

   return (
      <form onSubmit={(e) => e.preventDefault()}>
         <div className="row">
            <div className="col-lg-6 mb-15">
               <input className="input" type="text" placeholder={t('forms.your_name')} />
            </div>
            <div className="col-lg-6 mb-15">
               <input className="input" type="email" placeholder={t('forms.email_address')} />
            </div>
            <div className="col-lg-12">
               <textarea className="textarea  mb-5" placeholder={t('forms.write_message')}></textarea>
               <div className="review-checkbox d-flex align-items-center mb-25">
                  <input className="tg-checkbox" type="checkbox" id="australia" />
                  <label htmlFor="australia" className="tg-label">{t('forms.save_comment_info')}</label>
               </div>
               <button type="submit" className="tg-btn tg-btn-switch-animation">{t('forms.submit_review')}</button>
            </div>
         </div>
      </form>
   )
}

export default ReviewForm
