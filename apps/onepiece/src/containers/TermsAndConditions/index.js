import { isOutdated } from 'utils/time';
import React from 'react';
import { wrapPage } from 'utils/page';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { loadIfNeeded as loadMarketing } from 'redux/modules/marketing';
import { useSelector } from 'react-redux';
import { Container } from '@castlery/fortress';
import { useLastTerms } from 'components/Welcome/hooks/terms';
import { getUrl } from 'pages';
import style from './style.scss';

function TermsAndConditions(props) {
  const terms = useSelector(
    (state) => state.marketing[`${__COUNTRY__.toLocaleLowerCase()}/general-content/terms/terms-and-conditions`]
  );
  const lastTerms = useLastTerms();
  let { path } = props?.route;
  if (path.indexOf('-') !== -1) {
    path = path.split('-').join('_');
  }
  if (path === 'guarantee') {
    path = 'warranty';
  }
  const errHtml = "<div style='height:100vh;'>Sorry, this page is temporarily unavailable.</div>";
  let content = errHtml;

  try {
    if (props?.route?.path === 'terms-of-use') {
      content = lastTerms?.content;
    } else {
      const term = terms.data.story.content[path].find(
        (story) => !story.disabled && !isOutdated(story.published_at, story.ended_at) && story.content !== ''
      );
      if (term) {
        content = term.content;
      }
    }
  } catch (err) {
    content = errHtml;
  }

  const termsEle = (
    <Container
      fixed
      className={`${style.staticInfo}`}
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );

  return termsEle;
}

export default asyncLoad([
  ({ store: { dispatch } }) =>
    dispatch(loadMarketing(`${__COUNTRY__.toLocaleLowerCase()}/general-content/terms/terms-and-conditions`)),
  // ({ store: { dispatch } }) => dispatch(loadMarketing('terms-of-use')),
])(wrapPage()(TermsAndConditions));
