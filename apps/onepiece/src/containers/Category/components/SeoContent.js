import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { getPageByUrl } from 'pages';
import Collapse from 'components/Collapse/v2';
import { Container } from '@castlery/fortress';
import { toCamel } from 'utils/common';
import style from './style.scss';

// use section tag wrap seo content
// for Collapse
const formatContent = (seoContent = '') => {
  const titleReg = /<h2>(.*?)<\/h2>/g;
  const contentReg = /<section>(.*?)<\/section>/gs;
  const h2StartReg = /<h2[^>]*>/g;
  const h2EndReg = /<\/h2[^>]*>/gi;
  let content;
  let ignoreFirst = true; // ignore first <h2>

  const titles = [];
  const contents = [];
  // replace <h2> => </section> <h2>
  content = seoContent.replace(h2StartReg, (tag) => {
    if (!ignoreFirst) {
      return `</section>${tag}`;
    }
    ignoreFirst = false;
    return tag;
  });
  // replace </h2> => </h2><section>
  content = content?.replace(h2EndReg, (tag) => `${tag}<section>`);
  content = `${content}</section>`;

  content?.replace(titleReg, ($0, $1) => {
    titles.push($1);
  });
  content?.replace(contentReg, (_, $1) => {
    contents.push($1);
  });
  return [titles, contents];
};

const SeoContent = ({ location = {} }) => {
  const page = toCamel(useMemo(() => getPageByUrl(location.pathname) || {}, [location]));
  const faqData = page?.faqs || [];
  const [seoTitles, seoContents] = formatContent(page?.seoContent || '');
  return (
    <Container className={`${style.seo}__content`}>
      {page.seoContent && (
        <div className={`${style.seo}__seoContent ${style.seo}__section`}>
          <h2 className={`${style.seo}__content__title`}>{page.name}</h2>
          {seoTitles.map((title, index) => (
            <Collapse key={index} header={<h3 className={`${style.seo}__section__title`}>{title}</h3>} border={false}>
              <div
                className={`${style.seo}__section__content`}
                dangerouslySetInnerHTML={{ __html: seoContents[index] || '' }}
              />
            </Collapse>
          ))}
        </div>
      )}
      {faqData?.length > 0 && Array.isArray(faqData) && (
        <div className={`${style.seo}__section`}>
          <h2 className={`${style.seo}__content__title`}>FAQ</h2>
          {faqData.map((content, i) => (
            <Collapse
              key={i}
              header={<h3 className={`${style.seo}__section__title`}>{content.question}</h3>}
              border={false}
            >
              <div
                className={`${style.seo}__section__content`}
                dangerouslySetInnerHTML={{
                  __html: content.answer,
                }}
              />
            </Collapse>
          ))}
        </div>
      )}
    </Container>
  );
};

SeoContent.propTypes = {
  location: PropTypes.object,
};

export default SeoContent;
