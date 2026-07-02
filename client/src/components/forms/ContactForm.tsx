import { toast } from 'react-toastify';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { submitContact } from '../../api/contacts';

interface FormData {
  name: string;
  email: string;
  website: string;
  message: string;
}

const ContactForm = () => {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const isRtl = lang === "ar";

  const TX = {
    name:     lang === "ar" ? "الاسم" : "Name",
    email:    lang === "ar" ? "البريد الإلكتروني" : "E-mail",
    website:  lang === "ar" ? "الموقع الإلكتروني" : "Website",
    comments: lang === "ar" ? "رسالتك" : "Comments",
    save:     lang === "ar" ? "احفظ اسمي وبريدي الإلكتروني في هذا المتصفح للمرة القادمة." : "Save my name, email, and website in this browser for the next time I comment.",
    send:     lang === "ar" ? "إرسال الرسالة" : "Send Message",
    sending:  lang === "ar" ? "جاري الإرسال..." : "Sending...",
    success:  lang === "ar" ? "تم إرسال الرسالة بنجاح" : "Message sent successfully",
    error:    lang === "ar" ? "فشل الإرسال. حاول مرة أخرى." : "Failed to send message. Please try again.",
  };

  const schema = yup.object({
    name:    yup.string().required().label(TX.name),
    email:   yup.string().required().email().label(TX.email),
    website: yup.string().label(TX.website),
    message: yup.string().required().label(TX.comments),
  }).required();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await submitContact({
        name:    data.name,
        email:   data.email,
        website: data.website || '',
        message: data.message,
      });
      toast.success(TX.success, { position: 'top-center' });
      reset();
    } catch {
      toast.error(TX.error, { position: 'top-center' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="contact-form" dir={isRtl ? "rtl" : "ltr"}>
      <div className="row">
        <div className="col-lg-6 mb-25">
          <input className="input" type="text" {...register("name")} placeholder={TX.name} style={{ textAlign: isRtl ? "right" : "left" }} />
          <p className="form_error">{errors.name?.message}</p>
        </div>
        <div className="col-lg-6 mb-25">
          <input className="input" type="email" {...register("email")} placeholder={TX.email} style={{ textAlign: isRtl ? "right" : "left" }} />
          <p className="form_error">{errors.email?.message}</p>
        </div>
        <div className="col-lg-12 mb-25">
          <input className="input" type="text" {...register("website")} placeholder={TX.website} style={{ textAlign: isRtl ? "right" : "left" }} />
          <p className="form_error">{errors.website?.message}</p>
        </div>
        <div className="col-lg-12">
          <textarea className="textarea mb-5" {...register("message")} placeholder={TX.comments} style={{ textAlign: isRtl ? "right" : "left" }} />
          <p className="form_error">{errors.message?.message}</p>
          <div className="review-checkbox d-flex align-items-center mb-25" style={{ flexDirection: isRtl ? "row-reverse" : "row" }}>
            <input name="checkbox" className="tg-checkbox" type="checkbox" id="contact-save" />
            <label htmlFor="contact-save" className="tg-label" style={{ textAlign: isRtl ? "right" : "left" }}>
              {TX.save}
            </label>
          </div>
          <button type="submit" className="tg-btn" disabled={isSubmitting}>
            {isSubmitting ? TX.sending : TX.send}
          </button>
          <p className="ajax-response mb-0 pt-10"></p>
        </div>
      </div>
    </form>
  );
};

export default ContactForm;
