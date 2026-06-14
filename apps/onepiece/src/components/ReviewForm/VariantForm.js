import React from 'react';
import PropTypes from 'prop-types';
import { Rating } from 'components/Form';
import Dropzone from 'react-dropzone';
import ReactSVG from 'components/ReactSVG';
import ApiClient from 'helpers/ApiClient';
import Spinner from 'components/Spinner';
import { loadSingleImage } from 'utils/image';
import omit from 'lodash/omit';

import { Button } from 'components/Button';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { EVENT_FORM_SUBMIT } from 'utils/track/constants';
import style from './style.scss';

@connect(
  (state) => ({
    user: state.auth.user,
  }),
  {
    trackFormSubmit: (result) => (dispatch) => dispatch({ type: EVENT_FORM_SUBMIT, result }),
  },
  null,
  { forwardRef: true }
)
export default class VariantForm extends React.Component {
  static propTypes = {
    showSubmit: PropTypes.bool,
    reviewId: PropTypes.number,

    orderNumber: PropTypes.string,
    productId: PropTypes.number,
    variantId: PropTypes.number,
    variantCode: PropTypes.string,
    bundleOptions: PropTypes.array,
    anonymous: PropTypes.bool,
    rating: PropTypes.number,
    title: PropTypes.string,
    content: PropTypes.string,
    images: PropTypes.array,
    onProcessing: PropTypes.func,

    onUpdate: PropTypes.func,
    onSuccess: PropTypes.func,
    classNames: PropTypes.string,

    user: PropTypes.object,
    trackFormSubmit: PropTypes.func,
    coupon: PropTypes.number,
    loadedImages: PropTypes.array,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  static defaultProps = {
    showSubmit: false,
    anonymous: false,
    rating: 0,
    title: '',
    content: '',
    images: [],
    loadedImages: [],
  };

  constructor(props) {
    super(props);

    this.MAX_FILE_NUM = 10;
    this.MAX_FILE_SIZE = 10 * 1024 * 1024;
    this.MAX_TITLE = 60;
    this.counter = 0;
    this.uploadQueue = 0; // record image uploading process
    this.client = new ApiClient();
    this.MAX_WORDS = 500;
    this.MIN_WORDS = 50;

    this.state = {
      rating: this.props.rating,
      title: this.props.title,
      content: this.props.content,
      images: this.props.images.reduce(
        (result, image) => ({
          ...result,
          [this.counter++]: image,
        }),
        {}
      ),
      loadedImages: this.props.images.reduce(
        (result, image) => ({
          ...result,
          [this.counter++]: image,
        }),
        {}
      ),
      anonymous: this.props.anonymous,
      // show error when rating is not made but other fileds are not empty
      error: '',
      processing: false,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.anonymous !== this.props.anonymous && nextProps.anonymous !== this.state.anonymous) {
      this.setState({
        anonymous: nextProps.anonymous,
      });
    }
  }

  // props changes won't trigger rendering
  shouldComponentUpdate(nextProps, nextState) {
    return nextState !== this.state;
  }

  componentDidUpdate(prevProps, prevState) {
    // update state if relative props change
    if (
      prevProps.rating !== this.props.rating ||
      prevProps.content !== this.props.content ||
      prevProps.images !== this.props.images ||
      prevProps.loadedImages !== this.props.loadedImages
    ) {
      this.counter = 0;
      this.setState({
        rating: this.props.rating,
        content: this.props.content,
        images: this.props.images.reduce(
          (result, image) => ({
            ...result,
            [this.counter++]: image,
          }),
          {}
        ),
        loadedImages: this.props.images.reduce(
          (result, image) => ({
            ...result,
            [this.counter++]: image,
          }),
          {}
        ),
      });
    }

    // notify parent changes
    if (this.props.onUpdate) {
      if (
        prevState.rating !== this.state.rating ||
        prevState.content !== this.state.content ||
        prevState.images !== this.state.images ||
        prevProps.loadedImages !== this.props.loadedImages
      ) {
        this.props.onUpdate(this.state.rating, this.state.content, this.state.images, this.state.images);
      }
    }
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  updateRating(rating) {
    this.setState({
      rating,
    });
  }

  updateContent(content) {
    this.setState({
      content,
    });
  }

  updateTitle(title) {
    this.setState({
      title,
    });
  }

  onDrop(files) {
    if (!this.state.processing) {
      const { images } = this.state;
      this.setState(
        {
          processing: true,
        },
        () => {
          if (this.props?.onProcessing) {
            this.props.onProcessing(true);
          }
        }
      );
      let acceptedFiles = files;
      const imageSpitArray = acceptedFiles[0].name.split('.');
      const imageType = acceptedFiles[0].name.split('.')[imageSpitArray.length - 1];

      if (!(imageType === 'jpeg' || imageType === 'jpg' || imageType === 'png')) {
        acceptedFiles = files.slice(0, this.MAX_FILE_NUM - Object.keys(images).length);
        this.context.frame.openModal('response', {
          body: `You cannot upload ${imageType} images, allowed .jpeg, .jpg, .png`,
        });
        this.setState(
          {
            processing: false,
          },
          () => {
            if (this.props?.onProcessing) {
              this.props.onProcessing(false);
            }
          }
        );
        return;
      }

      if (Object.keys(images).length + files.length > this.MAX_FILE_NUM) {
        acceptedFiles = files.slice(0, this.MAX_FILE_NUM - Object.keys(images).length);

        this.context.frame.openModal('response', {
          body: `You can upload at most ${this.MAX_FILE_NUM} images`,
        });
      }

      if (acceptedFiles.some((file) => file.size > this.MAX_FILE_SIZE)) {
        this.context.frame.openModal('response', {
          body: 'The maximum image size allowed is 10MB',
        });
      }

      const finalAcceptedFiles = acceptedFiles.filter((file) => file.size <= this.MAX_FILE_SIZE);

      if (finalAcceptedFiles.length > 0) {
        const addedImages = {};
        const ids = [];
        const promises = [];

        finalAcceptedFiles.forEach((file) => {
          const id = this.counter++;
          ids.push(id);

          addedImages[id] = {
            image_url: file.preview,
          };

          const data = new FormData();
          data.append('file', file);

          const options = { data, auth: 'strict' };
          const promise = this.client.post('/gw/attachments', options);
          promises.push(promise);
        });

        this.setState((state) => ({
          images: {
            ...state.images,
            ...addedImages,
          },
        }));

        this.setState((state) => ({
          loadedImages: {
            ...state.loadedImages,
            ...addedImages,
          },
        }));

        // Use Promise.race to wait for the first image to be uploaded
        Promise.race(promises)
          .then((img) => {
            const realImages = ids.reduce((result, id) => {
              if (this.state.images[id] !== undefined) {
                return {
                  ...result,
                  [id]: {
                    image_url: img.attachment.url,
                    key: img.attachment.key,
                  },
                };
              }
              return result;
            }, {});

            this.setState(
              (state) => ({
                images: {
                  ...state.images,
                  ...realImages,
                },
              }),
              () => this.uploadQueue--
            );

            return loadSingleImage(img.attachment.url).then(() => realImages);
          })
          .then((realImages) => {
            this.setState(
              {
                processing: false,
              },
              () => {
                if (this.props?.onProcessing) {
                  this.props.onProcessing(false);
                }
              }
            );
            // this.setState(
            //   (state) => ({
            //     images: {
            //       ...state.images,
            //       ...realImages,
            //     },
            //   }),
            //   () => this.uploadQueue--
            // );
          })
          .catch((error) => {
            this.context.frame.openModal('response', {
              body: `${error}` || undefined,
            });
            this.setState((state) => ({
              images: omit(state.images, Object.keys(addedImages)),
            }));
            this.uploadQueue--;
          });
      }
    }
  }

  removeImage(id) {
    const { images, loadedImages } = this.state;

    let findIndex = -1;
    Object.keys(loadedImages).forEach((key, index) => {
      if (key === id) {
        findIndex = index;
      }
    });
    // reduce counter if removed image hasn't uploaded yet.
    // if (images[id].ratio === undefined) {
    //   this.uploadQueue--;
    // }

    this.setState({
      images: omit(images, findIndex),
      loadedImages: omit(loadedImages, id),
    });
  }

  toggleAnonymous() {
    const { anonymous } = this.state;
    this.setState({
      anonymous: !anonymous,
    });
  }

  newSubmit() {
    if (!this.state.processing) {
      const { images, rating, title, content, anonymous } = this.state;
      const {
        orderNumber,
        productId,
        variantId,
        bundleOptions,
        onSuccess,
        trackFormSubmit,
        user,
        coupon,
        variantCode,
      } = this.props;
      const keysArr = Object.values(images).map((item) => item.key);

      const params = {
        review: {
          // variant_code: `Variant-${variantId}`,
          variant_code: variantCode,
          order_number: orderNumber,
          title,
          content,
          rating,
          is_anonymous: anonymous,
          attachment_keys: keysArr,
        },
      };
      let request;
      // trim content
      const realTitle = title.trim();
      const realContent = content.trim();
      if (rating === 0) {
        request = Promise.reject('Please give a rating for reviewed products.');
      }
      if (!request && this.uploadQueue > 0) {
        request = Promise.reject('Please wait until all images are uploaded.');
      }
      if (!request && (!realTitle || realTitle.length > this.MAX_TITLE)) {
        request = Promise.reject('Please write a short title for reviewed product.');
      }
      if (!request && (!realContent || realContent.length < this.MIN_WORDS)) {
        request = Promise.reject('Reviews must be at least 50 characters.');
      }
      if (request) {
        request.catch((error) => {
          this.context.frame.openModal('response', { body: error });
        });
        return request;
      }
      this.setState({
        error: '',
        processing: true,
      });

      const options = { data: params, auth: 'strict' };

      const { frame } = this.context;
      request = this.client.post('/gw/reviews', options);

      request
        .then(() => {
          this.setState({
            processing: false,
          });
          if (onSuccess) {
            onSuccess(productId, variantId);
          }
          frame.openModal('response', {
            status: 'successful',
            title: 'Thank You!',
            body: {
              contentHtml: (
                <>
                  You will be notified of the status of your review within 3 working days.
                  {coupon > 0 && __YOTPO_ENABLED__ && (
                    <p className={`${style.variantForm}__couponTip`}>
                      You will receive credits after the review is approved.
                    </p>
                  )}
                </>
              ),
            },
          });
          trackFormSubmit({
            action: 'Review Submission',
            label: user?.id,
          });
        })
        .catch((error) => {
          this.setState({
            processing: false,
          });
          frame.openModal('response', { body: error });
        });
      return request;
    }
  }

  update() {
    const { images, rating, content, title, anonymous } = this.state;
    const { reviewId } = this.props;

    // trim content
    const realContent = content.trim();
    const realTitle = title.trim();

    if (this.uploadQueue > 0) {
      return Promise.reject('Please wait until all images are uploaded.');
    }
    if (!realTitle || realTitle.length > this.MAX_TITLE) {
      return Promise.reject('Please write a short title for reviewed product.');
    }
    if (!realContent || realContent.length < this.MIN_WORDS) {
      return Promise.reject('Reviews must be at least 50 characters.');
    }

    this.setState({
      error: '',
      processing: true,
    });

    const request = this.client.put(`/gw/reviews/${reviewId}`, {
      auth: 'strict',
      data: {
        review: {
          title: realTitle,
          content: realContent,
          rating,
          is_anonymous: anonymous,
          attachment_keys: Object.values(images).map((obj) => obj.key),
        },
      },
    });

    request
      .catch(() => {})
      .then(() => {
        if (!this.isUnmounted) {
          this.setState({
            processing: false,
          });
        }
      });

    return request;
  }

  render() {
    const { showSubmit } = this.props;
    const { rating, title, content, images, error, processing, anonymous, loadedImages } = this.state;
    const imageNum = Object.keys(loadedImages).length;

    return (
      <div className={`${style.variantForm} ${this.props.classNames}`}>
        {error && <p className={`${style.variantForm}__error`}>{error}</p>}
        <Rating
          className={`${style.variantForm}__rating`}
          rating={rating}
          onChange={(rating) => this.updateRating(rating)}
          disabled={processing}
        />
        <div className={`${style.variantForm}__title`}>
          <input
            disabled={processing}
            className="form-control"
            onChange={(e) => this.updateTitle(e.target.value)}
            value={title}
            autoCapitalize="sentences"
            autoCorrect="off"
            placeholder="Write a short title"
            maxLength={this.MAX_TITLE}
          />
        </div>
        <div className={`${style.variantForm}__content`}>
          <textarea
            disabled={processing}
            className="form-control"
            onChange={(e) => this.updateContent(e.target.value)}
            value={content}
            maxLength={this.MAX_WORDS}
            rows="5"
            autoCapitalize="sentences"
            autoCorrect="off"
            placeholder="What do you like about this product? Consider how it fits your home, the assembly process, and how the quality feels."
          />
          <span>
            {content.length} / {this.MAX_WORDS}
          </span>
        </div>
        <div className={`${style.variantForm}__images`}>
          <div>
            {Object.keys(loadedImages).map((key) => {
              const image = loadedImages[key];
              if (image === null) {
                return null;
              }
              if (image?.url) {
                image.image_url = image.url;
              }
              return (
                <div key={key}>
                  <div
                    className={`${style.variantForm}__image`}
                    style={{
                      backgroundImage: `url(${
                        /^blob:/.test(image.image_url)
                          ? image.image_url
                          : image.image_url.replace(/upload/, 'upload/w_300,f_auto,q_auto')
                      })`,
                    }}
                  >
                    {/* {image.ratio === undefined && (
                      <div className={`${style.variantForm}__image__loading`}>
                        <Spinner small />
                      </div>
                    )} */}
                    {!processing && (
                      <button type="button" onClick={() => this.removeImage(key)} className="btn">
                        <ReactSVG name="close" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {imageNum < this.MAX_FILE_NUM && (
              <div>
                <Dropzone
                  disabled={processing}
                  className={`${style.variantForm}__dropzone`}
                  accept="image/*"
                  maxSize={100 * 1024 * 1024}
                  onDrop={this.onDrop.bind(this)}
                >
                  <div>
                    <ReactSVG name="camera" />
                    <p>{imageNum > 0 ? `${imageNum} / ${this.MAX_FILE_NUM}` : 'Upload Images'}</p>
                  </div>
                </Dropzone>
              </div>
            )}
          </div>
        </div>

        <div
          className={classNames(`${style.variantForm}__submit`, {
            'is-enable': showSubmit,
          })}
        >
          <button
            type="button"
            className={classNames(`${style.variantForm}__anonymous`, 'btn', {
              'is-checked': anonymous,
            })}
            onClick={this.toggleAnonymous.bind(this)}
          >
            Submit as Anonymous user
          </button>
          <Button
            type="button"
            text="Submit Your Review"
            size="medium"
            onClick={() => this.newSubmit()}
            disabled={processing}
            loading={processing}
          />
        </div>
      </div>
    );
  }
}
