import React, { Fragment, useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { wrapPage } from 'utils/page';
import ReactSVG from 'components/ReactSVG';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { loadIfNeeded as loadMarketing } from 'redux/modules/marketing';
import classNames from 'classnames';
import { animate } from 'utils/animate';
import { Container } from '@castlery/fortress';
import style from './style.scss';

function Faq(props) {
  const faqs = useSelector((state) => state.marketing.faqs);
  const faqData = useMemo(() => faqs.data?.story?.content || {}, [faqs]);
  const sectionRefs = useRef([]);
  const isFirstCome = useRef(true);

  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    const {
      location: { hash },
    } = props;
    if (!hash) return;
    const hashVal = hash.substring(1);
    // find category and open it
    if (faqData && faqData.faq_contents) {
      const faqContents = faqData.faq_contents;
      faqContents.some((content, i) => {
        const { questions } = content;
        return questions.some((q) => {
          const { question_text: questionText } = q;
          if (joinWordWithDash(questionText) === hashVal) {
            setOpenIndex(i);
            return true;
          }
          return false;
        });
      });
    }
  }, []);

  useEffect(() => {
    if (!document.scrollingElement || openIndex === -1) {
      return;
    }
    // if there's hash in location
    const {
      location: { hash },
    } = props;
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        animate({
          from: document.scrollingElement.scrollTop,
          to: target.offsetTop,
          duration: 300,
          callback: (d) => {
            document.scrollingElement.scrollTop = d;
          },
        });
        isFirstCome.current = false;
        return;
      }
    }
    if (!isFirstCome.current) {
      animate({
        from: document.scrollingElement.scrollTop,
        to: sectionRefs.current[openIndex].offsetTop,
        duration: 300,
        callback: (d) => {
          document.scrollingElement.scrollTop = d;
        },
      });
    } else {
      isFirstCome.current = false;
    }
  }, [openIndex]);

  const open = useCallback(
    (index) => {
      if (openIndex === index) {
        setOpenIndex(-1);
      } else {
        setOpenIndex(index);
      }
    },
    [openIndex, setOpenIndex]
  );

  const joinWordWithDash = useCallback((text) => {
    try {
      let result = text
        .trim()
        .split(/[^a-zA-Z\d]+/)
        .join('-')
        .toLowerCase();
      if (result.startsWith('-')) {
        result = result.substring(1);
      }
      if (result.endsWith('-')) {
        result = result.substring(0, result.length - 1);
      }
      return result;
    } catch (err) {
      console.log(err);
      return '';
    }
  }, []);

  return (
    <Container maxWidth="md" className={`${style.faq}`}>
      <h1>{faqData.title}</h1>
      <div
        className={`${style.faq}__covid`}
        dangerouslySetInnerHTML={{
          __html: faqData.related,
        }}
      />
      <div>
        {faqData.faq_contents &&
          faqData.faq_contents.map(
            (f, index) =>
              f.category && (
                <div ref={(c) => (sectionRefs.current[index] = c)} key={index} className={`${style.faq}__section`}>
                  <button
                    type="button"
                    onClick={() => open(index)}
                    className={classNames(`${style.faq}__header btn`, {
                      'is-open': index === openIndex,
                    })}
                  >
                    <div>
                      {f.category}
                      <ReactSVG name="plus" />
                    </div>
                  </button>
                  {index === openIndex && f.questions && (
                    <div className={`${style.faq}__body`}>
                      {f.questions.map((q, i) => {
                        const id = joinWordWithDash(q.question_text);
                        return (
                          <Fragment key={i}>
                            <h3 id={id}>
                              <a href={`#${id}`} className={`${style.faq}__headerAnchor`}>
                                #
                              </a>
                              {q.question_text}
                            </h3>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: q.question_answer,
                              }}
                            />
                          </Fragment>
                        );
                      })}
                    </div>
                  )}
                </div>
              )
          )}
      </div>
    </Container>
  );
}

Faq.contextTypes = {
  frame: PropTypes.object,
};
export default asyncLoad([({ store: { dispatch } }) => dispatch(loadMarketing('faqs'))])(
  wrapPage({ border: true })(Faq)
);
