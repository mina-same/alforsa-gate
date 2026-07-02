import BlogDetailSlug from '../components/blogs/blog-detail-slug';
import SEO from '../components/SEO';
import Wrapper from '../layouts/Wrapper';

const BlogDetailSlugMain = () => (
  <Wrapper>
    <SEO pageTitle="Blog Article" />
    <BlogDetailSlug />
  </Wrapper>
);

export default BlogDetailSlugMain;
