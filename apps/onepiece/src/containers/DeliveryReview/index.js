import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Link } from 'react-router';

import ApiClient from 'helpers/ApiClient';
import Banner from 'components/Banner';
import Spinner from 'components/Spinner';
import Rating from 'components/Form/Rating';
import ReactSVG from 'components/ReactSVG';
import { getUrl } from 'pages';
import { wrapPage } from 'utils/page';

import { Container, useBreakpoints } from '@castlery/fortress';
import { useDispatch } from 'react-redux';
import { EVENT_FORM_SUBMIT, EVENT_LINK_CLICK } from 'utils/track/constants';
import { enableSpecialDeliveryReview } from 'config';
import style from './style.scss';

const client = new ApiClient();

const getDefaultAnswers = (questions) =>
  questions
    .filter((question) => question.type === 'select')
    .reduce((acc, cur) => {
      acc[cur.key] = true;
      return acc;
    }, {});

const DeliveryReview = (props, { router }) => {
  const token = useRef(router.location.query.token);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [rating, setRating] = useState(0);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState(true);
  const [comment, setComment] = useState('');
  const countDownNumberRef = useRef(5);
  const { desktop } = useBreakpoints();
  const [countDownNumber, setCountDownNumber] = useState(5);
  const thirdConfig = useMemo(() => {
    if (enableSpecialDeliveryReview) {
      return {
        text: 'Help new customers make confident decisions when shopping with us by sharing your review on Trustpilot',
        link: 'https://www.trustpilot.com/evaluate/www.castlery.com',
        website: 'Trustpilot',
      };
    }
    return {
      text: 'Help new customers make confident decisions when shopping with us by sharing your review on Google',
      link: 'https://maps.app.goo.gl/Gt6DbJSWMR8x6KjP8',
      website: 'Google',
    };
  }, []);
  const updateRating = useCallback((rating) => {
    setRating(rating);
  }, []);

  const updateAnswers = useCallback(
    (key, value) => {
      const newAnswers = {
        ...answers,
        [key]: value,
      };
      setAnswers(newAnswers);
    },
    [answers]
  );

  const handleCopy = useCallback(() => {
    if (document && navigator && navigator.clipboard) {
      const el = document.querySelector('.feedback-form-control');
      if (el && el.value?.trim()) {
        navigator.clipboard.writeText(el.value).catch((error) => {
          console.error(
            JSON.stringify(
              {
                message: 'Unable to copy text to clipboard',
                error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
              },
              null,
              2
            )
          );
        });
      }
    }
  }, []);
  const middlewareUpdate = useCallback(
    (key, value) => {
      setComment(value);
      updateAnswers(key, value);
    },
    [updateAnswers]
  );
  const handleLink = useCallback(
    async (e) => {
      e.preventDefault();
      const { href } = e.currentTarget;
      await dispatch({
        type: EVENT_LINK_CLICK,
        result: {
          category: 'link_click',
          action: 'third-website click',
          label: thirdConfig.website,
          link: thirdConfig.link,
        },
      });
      setTimeout(() => {
        window.location.href = href;
      }, 500);
    },
    [dispatch, thirdConfig.link, thirdConfig.website]
  );
  const submit = useCallback(() => {
    let realAnswers = answers;
    if (rating === 5) {
      const answersOfSelect = getDefaultAnswers(data.questionnaire.questions);
      realAnswers = {
        ...answers,
        ...answersOfSelect,
      };
    }
    setProcessing(true);
    client
      .post('/delivery_reviews/submit', {
        data: {
          token: token.current,
          rating,
          ...realAnswers,
        },
      })
      .then(() => {
        setProcessing(false);
        setStatus(false);
        dispatch({
          type: EVENT_FORM_SUBMIT,
          result: {
            action: 'delivery_review submit',
            label: thirdConfig.website,
          },
        });
        if (rating === 5) {
          const interval = setInterval(() => {
            if (countDownNumberRef.current === 0) {
              clearInterval(interval);
              dispatch({
                type: EVENT_LINK_CLICK,
                result: {
                  category: 'link_redirect',
                  action: 'third-website redirect',
                  label: thirdConfig.website,
                  link: thirdConfig.link,
                },
              });
              window.setTimeout(() => {
                window.location.href = thirdConfig.link;
              }, 500);
            } else {
              countDownNumberRef.current -= 1;
              setCountDownNumber(countDownNumberRef.current);
            }
          }, 1000);
        }
      })
      .catch((error) => {
        setProcessing(false);
        console.error(
          JSON.stringify(
            {
              message: 'DeliveryReview error',
              error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
            },
            null,
            2
          )
        );
      });
  }, [rating, answers, data]);

  const renderAfterSubmit = useCallback(() => {
    if (rating < 5) {
      return (
        <div className={`${style.deliveryReview}__feedback-message`}>
          {thirdConfig.text}
          <Link className="third-link" href={thirdConfig.link} onClick={handleLink}>
            here
          </Link>
        </div>
      );
    }
    return (
      <div className={`${style.deliveryReview}__feedback-message`}>
        {enableSpecialDeliveryReview && (
          <>
            <div>We're thrilled to hear you had a great experience.</div>
            <div>Please take a moment to leave us a review on Trustpilot.</div>
            <br />
            <div>{`You will be redirected in ${countDownNumberRef.current} seconds…`}</div>
          </>
        )}
        {__COUNTRY__ === 'AU' && (
          <>
            <div>We're thrilled to hear you had a great experience.</div>
            <div>Please take a moment to leave us a review on Google.</div>
            <br />
            <div>{`You will be redirected in ${countDownNumberRef.current} seconds…`}</div>
          </>
        )}
      </div>
    );
  }, [rating, status]);

  const renderContinueBtn = useCallback(() => {
    if (!error) {
      if (rating < 5) {
        return (
          <Link
            data-selenium="DeliveryReview-shopping"
            href={__BASE_URL__}
            className={`${style.deliveryReview}__status-cta btn btn-primary`}
          >
            Continue Shopping
          </Link>
        );
      }
    }
    return null;
  }, [rating, countDownNumber]);

  useEffect(() => {
    // TODO: abstract a useAPI to return all the data and state
    setLoading(true);
    client
      .get(`/delivery_reviews/questionnaire?token=${token.current}`)
      .then((data) => {
        setData(data);
        setLoading(false);
        setStatus(data.status);
        if (data.questionnaire) {
          const defaultAnswers = getDefaultAnswers(data.questionnaire.questions);
          setAnswers(defaultAnswers);
        }
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  return (
    <div className={style.deliveryReview}>
      <Container>
        <Banner
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset: '/static/delivery-review/banner-mobile.jpg',
              loader: { ratio: '0.81333' },
            },
            {
              breakpoint: 'lg',
              srcset: '/static/delivery-review/banner.jpg',
              loader: { ratio: '0.3125' },
            },
          ]}
          lazy={false}
          title="Rate Your Delivery Experience"
        >
          <h1
            className={`${style.deliveryReview}__title`}
            dangerouslySetInnerHTML={{
              __html: 'Rate Your Delivery Experience',
            }}
          />
        </Banner>
      </Container>
      {!status || error ? (
        <div
          className={classnames(`${style.deliveryReview}__status`, {
            [`${style.deliveryReview}__error`]: error,
          })}
        >
          {error ? (
            <ReactSVG name="error-circle" />
          ) : (
            <ReactSVG className={`${style.deliveryReview}__checkCircle`} name="check-circle-deep" fill="#00A676" />
          )}
          <div className={`${style.deliveryReview}__status-message`}>
            {error
              ? `${error.errors[0].detail}`
              : rating !== 5
              ? 'Thank you for sharing your experience!'
              : 'Thank you for your feedback!'}
          </div>
          {!error && rating > 3 && (
            <div>
              {renderAfterSubmit()}
              {rating < 5 && (
                <div className={`${style.deliveryReview}__submit__feedback`}>
                  <textarea
                    data-selenium="DeliveryReview-feedback"
                    className="feedback-form-control"
                    value={comment}
                    maxLength={500}
                    rows="7"
                    autoCapitalize="off"
                    autoCorrect="off"
                    placeholder="Share your feedback here.."
                    readOnly
                  />
                  <div className="delivery_review_copy" onClick={handleCopy}>
                    <ReactSVG name="delivery-review-copy" />
                  </div>
                </div>
              )}
            </div>
          )}
          {renderContinueBtn()}
        </div>
      ) : (
        <>
          <div className={`${style.deliveryReview}__intro`}>
            <div
              className={`${style.deliveryReview}__intro-detail`}
              dangerouslySetInnerHTML={{
                __html:
                  'Thank you for shopping with Castlery.<br /> We would love to hear about your delivery experience!',
              }}
            />
          </div>

          {loading && (
            <div className={`${style.deliveryReview}__loading`}>
              <Spinner />
            </div>
          )}
          {data && data.questionnaire && (
            <div className={`${style.deliveryReview}__container`}>
              <h2>{data.questionnaire.title}</h2>
              <div className={`${style.deliveryReview}__details`}>
                {desktop && (
                  <div className={`${style.deliveryReview}__box`}>
                    <div className={`${style.deliveryReview}__leftPanel`}>
                      <div className={`${style.deliveryReview}__info-label`}>Shipment No:</div>
                      <div className={`${style.deliveryReview}__info-label`}>Delivery Partner:</div>
                      <div className={`${style.deliveryReview}__info-label`}>Item(s) Delivered:</div>
                    </div>
                    <div className={`${style.deliveryReview}__rightPanel`}>
                      <div className={`${style.deliveryReview}__info-value ${style.deliveryReview}__info-value--bold`}>
                        {data.delivery_order_number}
                      </div>
                      <div className={`${style.deliveryReview}__info-value`}>{data.carrier_display_name}</div>
                      <div className={`${style.deliveryReview}__info-value`}>
                        {data.products.map((product) => (
                          <div key={product.product_name} className={`${style.deliveryReview}__product`}>
                            {product.quantity} x {product.product_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {!desktop && (
                  <>
                    <div className={`${style.deliveryReview}__info-label`}>Shipment No:</div>
                    <div className={`${style.deliveryReview}__info-value ${style.deliveryReview}__info-value--bold`}>
                      {data.delivery_order_number}
                    </div>
                    <div className={`${style.deliveryReview}__info-label`}>Delivery Partner:</div>
                    <div className={`${style.deliveryReview}__info-value`}>{data.carrier_display_name}</div>
                    <div className={`${style.deliveryReview}__info-label`}>Item(s) Delivered:</div>
                    <div className={`${style.deliveryReview}__info-value`}>
                      {data.products.map((product) => (
                        <div key={product.product_name} className={`${style.deliveryReview}__product`}>
                          {product.quantity} x {product.product_name}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className={`${style.deliveryReview}__rating-container`}>
                <Rating className={`${style.deliveryReview}__rating`} rating={rating} onChange={updateRating} />
              </div>
              {rating < 5 && rating !== 0 && (
                <div className={`${style.deliveryReview}__questions`}>
                  {data.questionnaire.questions.map((question, index) => {
                    let content = null;
                    if (question.type === 'select' && !!rating && rating < 5) {
                      content = (
                        <div
                          key={question.key}
                          className={`${style.deliveryReview}__question ${style.deliveryReview}__select`}
                        >
                          <div className={`${style.deliveryReview}__question-label`}>{question.display}</div>
                          <div className={`${style.deliveryReview}__question-answers`}>
                            {question.possible_answers.map((answer) => (
                              <div
                                key={answer.display}
                                data-selenium={`DeliveryReview-question${index + 1}-answer${answer.display}`}
                                className={classnames(`${style.deliveryReview}__question-answer`, {
                                  'is-selected': answers[question.key] === answer.value,
                                })}
                                onClick={() => updateAnswers(question.key, answer.value)}
                              >
                                {answer.display}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    } else if (question.type === 'text') {
                      content = (
                        <div className={`${style.deliveryReview}__feedback`}>
                          <textarea
                            data-selenium="DeliveryReview-comment"
                            className="form-control"
                            onChange={(e) => middlewareUpdate(question.key, e.target.value)}
                            value={answers[question.key]}
                            maxLength={500}
                            rows="7"
                            autoCapitalize="off"
                            autoCorrect="off"
                            placeholder="Drop us a compliment or share with us how we can serve you better (Optional)"
                          />
                          <span>{answers[question.key] ? answers[question.key].length : 0} / 500</span>
                        </div>
                      );
                    }
                    return content;
                  })}
                </div>
              )}

              <div className={`${style.deliveryReview}__submit`}>
                <button
                  type="button"
                  data-selenium="DeliveryReview-submit"
                  className={`btn btn-primary ${style.deliveryReview}__submit-button`}
                  onClick={submit}
                  disabled={!rating}
                >
                  Submit Review
                </button>
              </div>

              {processing && (
                <div className={`${style.deliveryReview}__processing`}>
                  <Spinner />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

DeliveryReview.contextTypes = {
  router: PropTypes.object,
};

export default wrapPage()(DeliveryReview);
