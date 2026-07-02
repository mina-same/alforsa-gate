import { useTranslation } from 'react-i18next';
import FooterThree from '../../../layouts/footers/FooterThree';
import HeaderFour from '../../../layouts/headers/HeaderFour';
import BreadCrumb from '../../common/BreadCrumb';
import BlogLiveArea from './BlogLiveArea';

const BlogLive = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <>
      <HeaderFour />
      <main>
        <BreadCrumb title={isAr ? 'المدونة' : 'Blog'} sub_title={isAr ? 'المدونة' : 'Blog'} />
        <BlogLiveArea />
      </main>
      <FooterThree />
    </>
  );
};

export default BlogLive;
