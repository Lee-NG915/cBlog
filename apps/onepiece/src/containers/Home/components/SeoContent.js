import React from 'react';
import { useSelector } from 'react-redux';
import Collapse from 'components/Collapse/v2';
import style from '../style.scss';

const SeoContent = () => {
  const homePageStory = useSelector(
    (state) => state.marketing[`${__COUNTRY__.toLocaleLowerCase()}/general-content/main-pages/new-home-page`]
  );
  const seoContents = homePageStory?.data?.story?.content?.seo_content;
  return (
    <>
      {seoContents && seoContents.length && (
        <div className={`${style.seoContent}`}>
          {seoContents.map((seoItem) => (
            <div key={seoItem._uid} className={`${style.seoContent}__item`}>
              <h2>{seoItem.title}</h2>
              <div>
                {seoItem.contents &&
                  seoItem.contents.map((content) => (
                    <Collapse
                      key={content._uid}
                      header={<h3 className={`${style.seoContent}__title`}>{content.title}</h3>}
                      border={false}
                    >
                      <div
                        className={`${style.seoContent}__content`}
                        dangerouslySetInnerHTML={{ __html: content.description }}
                      />
                    </Collapse>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
export default SeoContent;
