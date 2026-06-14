import React, { useRef, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import { wrapPage } from 'utils/page';
import Dropzone from 'react-dropzone';
import { useSelector } from 'react-redux';
import ReactSVG from 'components/ReactSVG';
import Banner from 'components/Banner';
import ReCaptcha from 'components/ReCaptcha';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { loadIfNeeded as loadCelebrateHome } from 'redux/modules/marketing';
import ApiClient from 'helpers/ApiClient';
import Form, { FloatInput, FloatSelect, FloatTextarea, Checkbox } from 'components/Form';
import Spinner from 'components/Spinner';
import { Container } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import photo from '../images/image.svg';
import style from './style.scss';

const maxFileSize = 10 * 1024 * 1024;

const CelebrateHome = (props, second) => {
  const { desktop } = useBreakpoints();
  const frame = second?.frame;
  const celebrateHome = useSelector((state) => state.marketing['celebrate-home']);
  const client = useMemo(() => new ApiClient(), []);
  const pageData = useMemo(() => celebrateHome?.data?.story.content, []);
  const [uploadedImages, setUploadedImages] = useState([null, null, null]);
  const [processing, setProcessing] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const reCatpcha = useRef(null);

  const uploadImage = useCallback(
    (files, index) => {
      const file = files[0];
      if (!file) {
        frame.openModal('response', {
          body: 'The maximum image size allowed is 10MB',
        });
        return;
      }
      const images = uploadedImages.map((image, i) => {
        if (i === index) {
          return file;
        }
        return image;
      });
      setUploadedImages(images);
    },
    [uploadedImages, setUploadedImages]
  );

  const removeImage = useCallback(
    (index) => {
      const images = uploadedImages.map((image, i) => {
        if (i === index) {
          return null;
        }
        return image;
      });
      setUploadedImages(images);
    },
    [uploadedImages, setUploadedImages]
  );

  const submit = useCallback(
    (data) => {
      const validImages = uploadedImages.filter((file) => file);
      const imageData = new FormData();
      if (validImages.length >= 2) {
        validImages.forEach((file) => {
          imageData.append('image[]', file);
        });
      } else {
        frame.openModal('response', {
          body: 'Please upload at least 2 images of your home!',
        });
        return;
      }
      if (!data.agreed) {
        frame.openModal('response', {
          body: 'Please agree to the terms & conditions!',
        });
        return;
      }
      imageData.append('folder', 'national_day_giveaway');
      imageData.append(
        'options',
        JSON.stringify({
          use_filename: false,
          unique_filename: true,
        })
      );
      data.recaptcha_response = reCatpcha.current?.getToken();
      if (!data.recaptcha_response) {
        frame.openModal('response', {
          body: 'Please check reCAPTCHA verification!',
        });
        return;
      }
      setProcessing(true);
      const request = client
        .post('/cloudinary_images', {
          data: imageData,
        })
        .then((imgs) => {
          data.cloudinary_images_attributes = imgs.map((img) => ({
            image: img.secure_url,
          }));
          data.label = 'celebrate home giveaway';
          return client.post('/statistics/campaign', { data });
        });
      request
        .then(() => {
          setHasSubmitted(true);
          setTimeout(() => {
            document.querySelector('#thankyoutitle')?.scrollIntoView();
          });
        })
        .catch((err) => {
          frame.openModal('response', {
            body: err && err.errors && `${err.errors[0].title} ${err.errors[0].detail}`,
          });
        })
        .finally(() => {
          setProcessing(false);
        });
      return request;
    },
    [client, frame, uploadedImages, setProcessing, setHasSubmitted]
  );

  if (!pageData) {
    return null;
  }
  return (
    <div className={style.celebrateHome}>
      <Container>
        <Banner
          className={`${style.celebrateHome}__banner`}
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset: pageData.mobile_banner_img,
              loader: { ratio: '0.81333' },
            },
            {
              breakpoint: 'lg',
              srcset: pageData.desktop_banner_img,
              loader: { ratio: '0.31250' },
            },
          ]}
          lazy={false}
          title="Celebrate Home"
        >
          <h1 className={`${style.celebrateHome}__title`}>{pageData.title}</h1>
        </Banner>
        <div className={`${style.celebrateHome}__container`}>
          <div className={`${style.celebrateHome}__intro`}>
            <div
              className={`${style.celebrateHome}__intro-text`}
              dangerouslySetInnerHTML={{
                __html: pageData.enable_announcement ? pageData.announce_intro : pageData.intro,
              }}
            />
          </div>

          {pageData.detail && !pageData.enable_announcement && (
            <div
              className={`${style.celebrateHome}__detail`}
              dangerouslySetInnerHTML={{
                __html: pageData.detail,
              }}
            />
          )}

          {!pageData.enable_announcement && !hasSubmitted && (
            <div className={`${style.celebrateHome}__form`}>
              <h2>{pageData.form_title}</h2>
              <div
                className={`${style.celebrateHome}__form__desc`}
                dangerouslySetInnerHTML={{ __html: pageData.form_desc }}
              />

              <Form formName="Celebrate Home Giveaway" onValidSubmit={submit} action="/">
                <div className="row">
                  <div className="col-xs-12 col-md-6">
                    <FloatInput
                      type="text"
                      name="name"
                      autoCorrect="off"
                      autoComplete="given-name"
                      placeholder="Full Name *"
                      maxLength="256"
                      required
                      disabled={processing}
                    />
                  </div>
                  <div className="col-xs-12 col-md-6">
                    <FloatInput
                      type="email"
                      name="email"
                      autoCapitalize="off"
                      autoCorrect="off"
                      autoComplete="email"
                      placeholder="Email *"
                      validations="isEmail"
                      validationError="Please provide a valid email."
                      required
                      disabled={processing}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-xs-12 col-md-6">
                    <FloatSelect
                      placeholder="Age *"
                      name="age"
                      options={{
                        '': 'Choose an age range',
                        '18-30': '18-30',
                        '31-39': '31-39',
                        '40-54': '40-54',
                        '55 and above': '55 and above',
                      }}
                      required
                      disabled={processing}
                    />
                  </div>
                  <div className="col-xs-12 col-md-6">
                    <FloatInput
                      type="text"
                      name="ig_handle"
                      autoCapitalize="off"
                      autoCorrect="off"
                      placeholder="Instagram Handle *"
                      maxLength="50"
                      required
                      disabled={processing}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-xs-12 col-md-6">
                    <FloatInput
                      type="text"
                      name="fb_handle"
                      autoCapitalize="off"
                      autoCorrect="off"
                      placeholder="Facebook Handle *"
                      maxLength="50"
                      required
                      disabled={processing}
                    />
                  </div>
                  <div className="col-xs-12 col-md-6">
                    <FloatSelect
                      placeholder="Reason for participating *"
                      name="reason"
                      options={{
                        '': 'Choose a reason',
                        "I'm ready to furnish my new home!": "I'm ready to furnish my new home!",
                        'I want to revamp my current home!': 'I want to revamp my current home!',
                        Others: 'Others',
                      }}
                      required
                      disabled={processing}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-xs-12 ">
                    <FloatTextarea
                      style={{ wihteSpace: 'nowrap' }}
                      name="story"
                      autoCapitalize="off"
                      autoCorrect="off"
                      placeholder="Tell us why you should win – We want to hear your story! *"
                      maxLength="300"
                      rows={!desktop ? '7' : '3'}
                      showWordcount
                      required
                      disabled={processing}
                    />
                  </div>
                </div>
                <div className={`${style.celebrateHome}__form__uploads`}>
                  <div className={`${style.celebrateHome}__form__uploads__intro`}>
                    Upload 2 to 3 images of your home*
                  </div>
                  <div className={`${style.celebrateHome}__form__uploads__container`}>
                    {[0, 1, 2].map((index) => (
                      <div key={index} className={`${style.celebrateHome}__form__upload`}>
                        {uploadedImages[index] ? (
                          <div
                            className={`${style.celebrateHome}__form__upload__image`}
                            style={{
                              backgroundImage: `url(${uploadedImages[index].preview})`,
                            }}
                          >
                            <button type="button" onClick={() => removeImage(index)} className="btn">
                              <ReactSVG name="close" />
                            </button>
                          </div>
                        ) : (
                          <Dropzone
                            className={`${style.celebrateHome}__form__dropzone`}
                            accept="image/*"
                            maxSize={maxFileSize}
                            onDrop={(file) => uploadImage(file, index)}
                          >
                            <div className={`${style.celebrateHome}__form__dropzone__container`}>
                              <img alt="Upload" src={photo} className={`${style.celebrateHome}__form__dropzone__img`} />
                              <div className={`${style.celebrateHome}__form__dropzone__text`}>Upload Image</div>
                            </div>
                          </Dropzone>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Checkbox
                  id="subscribed_checkbox"
                  name="subscribe"
                  value={!!true}
                  label="I agree to subscribe to Castlery's email newsletter and notifications."
                />
                <Checkbox
                  id="terms_conditions_checkbox"
                  name="agreed"
                  value={!!true}
                  label={`I agree to the <a class='terms_conditions'  href='/${__COUNTRY__.toLowerCase()}/promo-terms#celebrate-home' target='_blank' >terms & conditions</a>.`}
                />

                <div
                  className={`${style.celebrateHome}__form__note`}
                  dangerouslySetInnerHTML={{
                    __html: pageData.form_note,
                  }}
                />
                <ReCaptcha className={`${style.celebrateHome}__form__recaptch`} ref={reCatpcha} />
                <div className={`${style.celebrateHome}__form__submit`}>
                  <input
                    className="btn btn-primary"
                    type="submit"
                    disabled={processing}
                    value={processing ? ' ' : 'Submit'}
                  />
                  {processing && <Spinner small />}
                </div>
              </Form>
            </div>
          )}
          {!pageData.enable_announcement && hasSubmitted && (
            <div className={`${style.celebrateHome}__thank`}>
              <h2 id="thankyoutitle">{pageData.thank_title}</h2>
              <div
                className={`${style.celebrateHome}__thank__content`}
                dangerouslySetInnerHTML={{ __html: pageData.thank_content }}
              />

              <p className={`${style.celebrateHome}__thank__note`}>{pageData.thank_note}</p>
            </div>
          )}
        </div>

        {!pageData.enable_announcement && hasSubmitted && (
          <Link to="/national-day-sale" className={`${style.celebrateHome}__card`}>
            <Banner
              className={`${style.celebrateHome}__card__banner`}
              mediaQueries={[
                {
                  breakpoint: 'xs',
                  srcset: pageData.mobile_shop_banner_img,
                  loader: { ratio: '1.06666' },
                },
                {
                  breakpoint: 'lg',
                  srcset: pageData.desktop_shop_banner_img,
                  loader: { ratio: '0.3125' },
                },
              ]}
              lazy={false}
              title="Celebrate Home"
            />
          </Link>
        )}
        {pageData.enable_announcement && (
          <div className={`${style.celebrateHome}__announcement`}>
            <div className={`${style.celebrateHome}__announcement__box`}>
              <h2>{pageData.announce_title}</h2>
              <div
                className={`${style.celebrateHome}__announcement__content`}
                dangerouslySetInnerHTML={{ __html: pageData.announce_content }}
              />
            </div>
            <p className={`${style.celebrateHome}__announcement__note`}>{pageData.announce_note}</p>
          </div>
        )}
        {(hasSubmitted || pageData.enable_announcement) && <div data-campaign="LP Mid Year Sale (Bestseller)" />}
      </Container>
    </div>
  );
};

CelebrateHome.contextTypes = {
  frame: PropTypes.object,
};

export default asyncLoad([({ store: { dispatch } }) => dispatch(loadCelebrateHome('celebrate-home'))])(
  wrapPage()(CelebrateHome)
);
