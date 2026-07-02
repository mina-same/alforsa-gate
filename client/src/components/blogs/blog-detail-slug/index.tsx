import { useTranslation } from 'react-i18next';
import FooterThree from '../../../layouts/footers/FooterThree';
import HeaderFour from '../../../layouts/headers/HeaderFour';
import BreadCrumb from '../../common/BreadCrumb';
import BlogDetailSlugArea from './BlogDetailSlugArea';

const BlogDetailSlug = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <>
      <HeaderFour />
      <main>
        <BreadCrumb
          title={isAr ? 'تفاصيل المقال' : 'Blog Details'}
          sub_title={isAr ? 'المدونة' : 'Blog'}
        />
        <BlogDetailSlugArea />
      </main>
      <FooterThree />
    </>
  );
};

export default BlogDetailSlug;
