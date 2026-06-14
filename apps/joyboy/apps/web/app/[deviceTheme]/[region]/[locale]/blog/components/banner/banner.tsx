import React from 'react';
import { HeadBanner } from '@castlery/modules-others-components';

const BlogBanner = () => {
  return (
    <HeadBanner
      header="Blog"
      description="Discover the latest interior design trends and furniture tips on our blog."
      image={{
        desktop_url: 'https://res.cloudinary.com/castlery/image/upload/v1755154245/hardcode%20pages/reviews_banner.jpg',
        mobile_url:
          'https://res.cloudinary.com/castlery/image/upload/v1755246293/hardcode%20pages/reviews__banner_mobile.jpg',
        tablet_url:
          'https://res.cloudinary.com/castlery/image/upload/v1755246293/hardcode%20pages/reviews__banner_mobile.jpg',
        alt: 'Blog Banner',
      }}
    />
  );
};

export default BlogBanner;
