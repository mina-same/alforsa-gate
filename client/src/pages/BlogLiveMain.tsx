import BlogLive from '../components/blogs/blog-live';
import SEO from '../components/SEO';
import Wrapper from '../layouts/Wrapper';

const BlogLiveMain = () => (
  <Wrapper>
    <SEO pageTitle="Blog" />
    <BlogLive />
  </Wrapper>
);

export default BlogLiveMain;
