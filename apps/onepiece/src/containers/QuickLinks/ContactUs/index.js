/**
 * @description: Contact Us page
 * url hash: #contactUsForm
 * query: ?type= xxxx
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Dropzone from 'react-dropzone';
import Form, { FloatInput, FloatSelect, FloatTextarea, PhoneNumberInput } from 'components/Form';
import { EVENT_CONTACT_FORM_FILLUP } from 'utils/track/constants';

import config, {
  cloudinaryRoot,
  enableDisplayContactText,
  enableDisplayDataPrivacyText,
  enableShowPONumberExplanation,
  globalFeatureInAU,
  globalFeatureInCA,
  globalFeatureInSG,
  globalFeatureInUK,
  globalFeatureInUS,
} from 'config';
import { getUrl } from 'pages';
import lang from 'utils/lang';
import { wrapPage, withUseBreakpoints } from 'utils/page';
import ApiClient from 'helpers/ApiClient';
import { loadIfNeeded as loadStores } from 'redux/modules/stores';
import { getCustomerServiceApi } from 'utils/customer-service/sdk-loader';

import ReCaptcha from 'components/ReCaptcha';
import ReactSVG from 'components/ReactSVG';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { Button } from 'components/Button';
import ReactPicture from 'components/ReactPicture';
import { Container, Typography } from '@castlery/fortress';
import Banner from '../Components/Banner';

import image from '../images/contact-us.jpg';
import contact1 from '../images/contact-1.jpg';
import contact2 from '../images/contact-2.jpg';
import contact3 from '../images/contact-3.jpg';
import whatsapp from '../images/whatsapp.jpg';
import onlineStore from '../images/online-store.svg';
import photo from '../images/image.svg';

import style from './style.scss';

// value is true if this query requires order number, otherwise false
const damagesType = 'Damages / Repairs';
const cancelType = 'Change / Cancel My Order';
const returnType = 'Request Return';
const dataPrivacyType = 'Data Privacy';

const getQueryTypeByCountry = (country = 'US') => {
  const baseTypes = {
    'Sales / Product Enquiry': false,
    'Shipping / Order Status': true,
    [cancelType]: true,
    [damagesType]: true,
    [returnType]: true,
    'Price Protection': true,
    'Feedback / Suggestions': false,
  };
  const types = {
    US: {
      ...baseTypes,
      [dataPrivacyType]: false,
      'Other Enquiry': false,
    },
    SG: {
      ...baseTypes,
      [dataPrivacyType]: false,
      'Other Enquiry': false,
    },
    AU: {
      ...baseTypes,
      [dataPrivacyType]: false,
      'Other Enquiry': false,
    },
    CA: {
      ...baseTypes,
      [dataPrivacyType]: false,
      'Other Enquiry': false,
    },
    UK: {
      ...baseTypes,
      [dataPrivacyType]: false,
      'Other Enquiry': false,
    },
  };
  return types[country];
};
const QUERY_TYPES = getQueryTypeByCountry(__COUNTRY__);

const damagesPhotoStandards = [
  {
    key: 'full-view',
    name: 'Full View',
    src: 'static/contact-us/full-view-v2.jpg',
  },
  {
    key: 'angled-view',
    name: 'Angled View',
    src: 'static/contact-us/angled-view-v2.jpg',
  },
  {
    key: 'close-up-view',
    name: 'Close-up View',
    src: 'static/contact-us/close-up-view-v2.jpg',
  },
];
const returnRequestPhotoStandards = [
  {
    key: 'front-view',
    name: 'Front View',
    src: 'static/contact-us/return-front-view.jpg',
  },
  {
    key: 'top-view',
    name: 'Top',
    src: 'static/contact-us/return-top-view.jpg',
  },
  {
    key: 'angled-right-view',
    name: 'Angled Right',
    src: 'static/contact-us/return-angledRight-view.jpg',
  },
  {
    key: 'angled-left-view',
    name: 'Angled Left',
    src: 'static/contact-us/return-angledLeft-view.jpg',
  },
  {
    key: 'back-view',
    name: 'Back View',
    src: 'static/contact-us/return-back-view.jpg',
  },
];

const photoStandards = {
  [returnType]: returnRequestPhotoStandards,
  [cancelType]: damagesPhotoStandards,
  [damagesType]: damagesPhotoStandards,
};
const maxFileSize = 10 * 1024 * 1024;
const initialType = Object.keys(QUERY_TYPES)[0];
const color = globalFeatureInUS ? 'color' : 'colour';
const cancelReasons = {
  '': 'Select a reason',
  'Customer - Product': 'I would like to change / remove a product / service from my order',
  'Customer - Address': 'I would like to change my delivery address',
  'Customer - Combine Order': 'I would like to combine with another existing order',
  'Customer - Sales': 'The product/s that I have purchased is currently on sale',
  'Customer - Payment': 'I would like to change my payment method',
  'Customer - Delivery TAT': 'The estimated delivery time is too long',
  'Remorse - Remorse': 'I have changed my mind',
  Others: 'Others',
};
const returnReasons = {
  '': 'Select a reason',
  'Issue – Quality': `The ${color} or material doesn't suit my home`,
  'Issue - Quality (Comfort)': 'I wanted something softer / firmer',
  'Issue - Quality (Size)': 'It doesn’t fit my space ',
  Others: 'Others',
};
const dataPrivacyRequests = {
  '': 'Select a data subject request',
  'Request to Delete': 'Request to Delete',
  'Request to Correct': 'Request to Correct',
  'Request to Know/Access - Categories Report': 'Request to Know/Access - Categories Report',
  'Request to Know/Access - Specific Pieces Report': 'Request to Know/Access - Specific Pieces Report',
};

const acknowledgementTexts = {
  'Request to Delete': '(Request that we delete personal data we maintain about you)',
  'Request to Correct': '(Request that we correct inaccurate personal data we maintain about you)',
  'Request to Know/Access - Categories Report':
    '(Request to know the categories of personal data we have about you and how we use and disclose it)',
  'Request to Know/Access - Specific Pieces Report':
    '(Request to know the specific pieces of personal data we maintain about you)',
};
@asyncLoad([({ store: { dispatch } }) => dispatch(loadStores())])
@connect(
  (state) => ({
    stores: state.stores.data,
    user: state.auth.user,
  }),
  {
    trackContactFillUp: (result) => (dispatch) => dispatch({ type: EVENT_CONTACT_FORM_FILLUP, result }),
  }
)
@wrapPage()
@withUseBreakpoints
export default class ContactUs extends React.Component {
  static propTypes = {
    stores: PropTypes.array,
    user: PropTypes.object,
    trackContactFillUp: PropTypes.func,
    location: PropTypes.object,
    breakpoints: PropTypes.object,
  };

  static defaultProps = {
    stores: [],
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  state = {
    processing: false,
    currentType: initialType,
    currentReason: '',
    uploadedImages: {},
    formIsValid: false,
  };

  scrollToFormRef = React.createRef();

  scrollToPhotoRef = React.createRef();

  client = new ApiClient();

  reCaptcha = React.createRef();

  componentDidMount() {
    this.onDataPrivacyHash();
  }

  componentWillUnmount() {
    window.history.scrollRestoration = 'auto';
  }

  onDataPrivacyHash() {
    const { location = {} } = this.props;
    const { hash } = location;
    if (hash === '#data-privacy') {
      window.history.scrollRestoration = 'manual';
      this.scrollToFormRef.current.scrollIntoView();
      this.setState({
        currentType: 'Data Privacy',
      });
    }
  }

  submit = (data, resetForm) => {
    // blur input on mobile to hide virtual keyboard
    const { uploadedImages, currentType, formIsValid } = this.state;
    const { frame } = this.context;
    const { trackContactFillUp, breakpoints = {} } = this.props;
    const { desktop } = breakpoints;

    if (!desktop) {
      const focusedInput = this.form.querySelector('input:focus');
      const focusedTextarea = this.form.querySelector('textarea:focus');
      const focused = focusedInput || focusedTextarea;
      if (focused) {
        focused.blur();
      }
    }

    this.setState({
      processing: true,
    });

    if (!formIsValid) {
      frame.openModal('response', {
        status: 'failed',
        title: 'OOPS!',
        body: 'Please fill out required field',
      });
      this.setState({
        processing: false,
      });
      this.scrollToFormRef.current.scrollIntoView();
      return;
    }

    // check for picture uploads
    if ([damagesType, returnType].includes(currentType)) {
      const ERROR_TYPE = {
        MISSING: 'Please upload all required photos',
        EXCEED_MAX_SIZE: 'The total file size limit is 20MB',
      };
      let error = '';
      let totalBytes = 0;
      let showErrorModal = false;
      let photoCount = 3;
      if (currentType === returnType) {
        photoCount = 5;
      }
      if (Object.keys(uploadedImages).length !== photoCount) {
        showErrorModal = true;
        error = ERROR_TYPE.MISSING;
      } else {
        Object.keys(uploadedImages).forEach((key) => {
          if (uploadedImages[key] === '') {
            showErrorModal = true;
            error = ERROR_TYPE.MISSING;
          } else {
            totalBytes += uploadedImages[key].size;
          }
        });
      }
      if (!showErrorModal && totalBytes > 20 * 1024 * 1024) {
        showErrorModal = true;
        error = ERROR_TYPE.EXCEED_MAX_SIZE;
      }
      if (showErrorModal) {
        frame.openModal('response', {
          status: 'failed',
          title: 'OOPS!',
          body: error,
        });
        this.setState({
          processing: false,
        });
        this.scrollToPhotoRef.current.scrollIntoView();
        return;
      }
    }

    if (data.firstName || data.lastName) {
      data.name = `${data.firstName || ''} ${data.lastName || ''}`;
    }

    data.recaptcha_response = this.reCaptcha.current.getToken(); // 旧：后端校验

    let request;

    if (data.reason) {
      data.data = {
        reason: data.reason,
      };
      if (data.reason === 'Others') {
        data.data = {
          reason: `Others - ${data.specifyReason}`,
        };
        delete data.specifyReason;
      }
      delete data.reason;
    }

    if ([damagesType, cancelType, returnType].includes(currentType) && Object.keys(uploadedImages).length !== 0) {
      const imageData = new FormData();
      Object.values(uploadedImages).forEach((file) => {
        if (file) {
          imageData.append('image[]', file);
        }
      });

      imageData.append('folder', 'customer_damages');
      imageData.append(
        'options',
        JSON.stringify({
          use_filename: false,
          unique_filename: true,
        })
      );

      request = this.client
        .post('/cloudinary_images', {
          data: imageData,
        })
        .then((imgs) => {
          data.image_urls = imgs.map((img) => img.secure_url);
          return this.client.post('/contacts', {
            data,
            header: {
              captcha: this.reCaptcha.current.getToken(),
            },
          });
        });
    } else {
      request = this.client.post('/contacts', {
        data,
        header: {
          captcha: this.reCaptcha.current.getToken(),
        },
      });
    }
    trackContactFillUp({
      label: data?.name,
      email: data?.email,
      phone: data?.phone_number,
    });

    request
      .then(() => {
        frame.openModal('response', {
          status: 'successful',
          title: 'Thank you!',
          body: 'Your message has been successfully sent.',
        });
        this.setState({
          processing: false,
          uploadedImages: {},
        });
        resetForm();
        this.reCaptcha.current.reset();
      })
      .catch((err) => {
        frame.openModal('response', {
          body: err?.errors?.[0]?.detail,
        });
        this.setState({
          processing: false,
        });
        this.reCaptcha.current.reset();
      });
    return request;
  };

  onChange = (currentValues) => {
    const { type, reason } = currentValues;
    this.setState({
      currentType: type,
      currentReason: [cancelType, returnType, dataPrivacyType].includes(type) ? reason : '',
    });
  };

  showChat = () => {
    getCustomerServiceApi()
      .then((api) => api.openChat())
      .catch(() => {});
  };

  showPONumberExplanation = () => {
    const { frame } = this.context;
    frame.addModal(
      <div className={`${style.contact}__modal`}>
        <div className={`${style.contact}__modal__container`}>
          <img
            src="https://res.cloudinary.com/castlery/image/upload/v1605710427/static/contact-us/po_number.jpg"
            alt="PO Number Example"
          />
          <button type="button" className={`btn ${style.contact}__modal__close`} onClick={() => frame.removeModal()}>
            <ReactSVG name="close" />
          </button>
        </div>
      </div>,
      'fade',
      { dismiss: () => frame.removeModal() }
    );
  };

  uploadImage = (key, files) => {
    const { frame } = this.context;

    const file = files[0];
    if (!file) {
      frame.openModal('response', {
        body: 'The maximum image size allowed is 10MB',
      });
      return;
    }
    this.setState((state) => ({
      uploadedImages: {
        ...state.uploadedImages,
        [key]: file,
      },
    }));
  };

  removeImage = (key) => {
    this.setState((state) => ({
      uploadedImages: {
        ...state.uploadedImages,
        [key]: '',
      },
    }));
  };

  render() {
    const { user, stores: _stores, breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    const { processing, currentType, currentReason, uploadedImages } = this.state;
    const isOrderNumberRequired = QUERY_TYPES[currentType];
    const responseTime = globalFeatureInAU ? 'one business day' : '3 business days';
    const isDataPrivacyType = currentType === dataPrivacyType;
    const stores = _stores.filter((s) => s.is_public);
    let store;
    if (stores) {
      [store] = stores;
    }
    const contactUsLink = `https://wa.me/${lang.t('common.whatsapp.value')}`;
    const contactMethodTitle = {
      US: 'WhatsApp / SMS / Call',
      AU: 'WhatsApp / SMS / Call',
      SG: 'WhatsApp',
      CA: 'WhatsApp',
      UK: 'WhatsApp / SMS / Call',
    };

    return (
      <div className={style.contact}>
        <Banner
          className={`${style.contact}__banner`}
          image={image}
          title="Contact Us"
          subtitle="Whether you have questions about our products, payments,
          delivery or returns, please don't hesitate to get in touch with us"
        />

        <div className={`${style.contact}__body`}>
          <Container fixed>
            <div className={`${style.contact}__info`}>
              <h2>We Are Ready To Help</h2>
              <p>
                Got questions about our products or need help with your order? We’re here for you
                {globalFeatureInUS ? ' 24/7' : ''}.
              </p>

              <div className={`${style.contact}__methods`}>
                {/* US */}
                {globalFeatureInUS && (
                  <>
                    <div className={`${style.contact}__methods__cell`}>
                      <img src={onlineStore} alt="Online Store" />
                      <Link className={`${style.contact}__methods__title`} to={getUrl('help-center')}>
                        FAQ
                      </Link>
                      <Link to={getUrl('help-center')} className={`${style.contact}__methods__subtitle`}>
                        {'Read here >'}
                      </Link>
                    </div>

                    <div className={`${style.contact}__methods__cell`}>
                      <>
                        <img src={contact3} alt="Live Chat Castlery" />
                        <button
                          type="button"
                          onClick={() => this.showChat()}
                          className={`${style.contact}__methods__title btn`}
                        >
                          Live Chat
                        </button>
                        <div
                          role="button"
                          onClick={() => this.showChat()}
                          className={`${style.contact}__methods__subtitle`}
                        >
                          {'Chat with us >'}
                        </div>
                      </>
                    </div>

                    <div className={`${style.contact}__methods__cell`}>
                      <img src={whatsapp} alt="Call Castlery" />
                      <a className={`${style.contact}__methods__title`} href={contactUsLink}>
                        {contactMethodTitle[__COUNTRY__] || 'WhatsApp'}
                      </a>
                      <a href={contactUsLink} className={`${style.contact}__methods__subtitle`}>
                        {`${lang.t('common.whatsapp.presentation')} >`}
                      </a>
                    </div>
                  </>
                )}
                {/* CA */}
                {globalFeatureInCA && (
                  <>
                    <div className={`${style.contact}__methods__cell`}>
                      <>
                        <img src={contact3} alt="Live Chat Castlery" />
                        <button
                          type="button"
                          onClick={() => this.showChat()}
                          className={`${style.contact}__methods__title btn`}
                        >
                          Live Chat
                        </button>
                        <div
                          role="button"
                          onClick={() => this.showChat()}
                          className={`${style.contact}__methods__subtitle`}
                        >
                          {'Chat with us >'}
                        </div>
                      </>
                      <p>
                        <strong>
                          Mon - Fri
                          <br />
                          8:00am - 8:00pm (PST)
                          <br />
                          <br />
                        </strong>
                      </p>
                    </div>

                    <div className={`${style.contact}__methods__cell`}>
                      <img src={whatsapp} alt="Call Castlery" />
                      <a className={`${style.contact}__methods__title`} href={contactUsLink}>
                        {contactMethodTitle[__COUNTRY__] || 'WhatsApp'}
                      </a>
                      <a href={contactUsLink} className={`${style.contact}__methods__subtitle`}>
                        {`${lang.t('common.whatsapp.presentation')} >`}
                      </a>
                      <p>
                        <strong>
                          Mon - Fri
                          <br />
                          8:00am - 8:00pm (PST)
                          <br />
                          <br />
                        </strong>
                      </p>
                    </div>

                    <div className={`${style.contact}__methods__cell`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70" fill="none">
                        <path
                          d="M36.75 32.302V13.8541C36.75 13.2708 36.9804 12.7604 37.4412 12.3229C37.904 11.8854 38.427 11.6666 39.0104 11.6666H55.8541C56.4375 11.6666 56.9479 11.8854 57.3854 12.3229C57.8229 12.7604 58.0416 13.2708 58.0416 13.8541V24.427C58.0416 25.0104 57.8229 25.5325 57.3854 25.9933C56.9479 26.4561 56.4375 26.6875 55.8541 26.6875H42.3645L36.75 32.302ZM39.6666 23.7708H55.125V14.5833H39.6666V23.7708ZM54.9791 57.9687C49.9236 57.9687 44.8077 56.6805 39.6316 54.1041C34.4536 51.5277 29.7986 48.1619 25.6666 44.0066C21.5347 39.8494 18.1688 35.1944 15.5691 30.0416C12.9675 24.8888 11.6666 19.7847 11.6666 14.7291C11.6666 13.8541 11.9583 13.125 12.5416 12.5416C13.125 11.9583 13.8541 11.6666 14.7291 11.6666H21.875C22.75 11.6666 23.4791 11.9097 24.0625 12.3958C24.6458 12.8819 25.0104 13.5382 25.1562 14.3645L26.6145 21.2916C26.7604 22.0694 26.7487 22.7616 26.5795 23.3683C26.4084 23.9769 26.0798 24.5 25.5937 24.9375L19.25 30.9166C21.8263 35.243 24.7557 39.022 28.0379 42.2537C31.3182 45.4873 35.1458 48.3437 39.5208 50.8229L45.7187 44.4062C46.2048 43.9201 46.7522 43.5798 47.3608 43.3854C47.9675 43.1909 48.6111 43.1666 49.2916 43.3125L55.4166 44.552C56.1944 44.7465 56.8263 45.1354 57.3125 45.7187C57.7986 46.302 58.0416 47.0069 58.0416 47.8333V54.9062C58.0416 55.7812 57.75 56.5104 57.1666 57.0937C56.5833 57.677 55.8541 57.9687 54.9791 57.9687ZM17.7916 28.1458L23.4062 23.0416C23.6007 22.8472 23.7222 22.6284 23.7708 22.3854C23.8194 22.1423 23.8194 21.8993 23.7708 21.6562L22.4583 15.4583C22.3611 15.1666 22.2279 14.9479 22.0587 14.802C21.8876 14.6562 21.6562 14.5833 21.3645 14.5833H15.3854C15.1423 14.5833 14.9479 14.6562 14.802 14.802C14.6562 14.9479 14.5833 15.1423 14.5833 15.3854C14.6319 17.3784 14.9362 19.4561 15.4962 21.6183C16.0543 23.7825 16.8194 25.9583 17.7916 28.1458ZM42.2187 52.1354C44.2118 53.1076 46.3263 53.8251 48.5625 54.2879C50.7986 54.7487 52.743 55.0034 54.3958 55.052C54.5902 55.052 54.7604 54.9791 54.9062 54.8333C55.052 54.6875 55.125 54.493 55.125 54.25V48.4166C55.125 48.125 55.052 47.8819 54.9062 47.6875C54.7604 47.493 54.5416 47.3472 54.25 47.25L48.8541 46.1562C48.6597 46.1076 48.4779 46.1076 48.3087 46.1562C48.1376 46.2048 47.9548 46.3263 47.7604 46.5208L42.2187 52.1354Z"
                          fill="#212121"
                        />
                      </svg>
                      <div style={{ marginBottom: '13.5px' }} />
                      <div className={`${style.contact}__methods__titleNoHover`}>SMS / Call</div>
                      <div className={`${style.contact}__methods__subtitleNoCursor`}>+1 833-853-5777</div>
                      <p>
                        <strong>
                          Mon - Fri
                          <br />
                          8:00am - 8:00pm (PST)
                          <br />
                          <br />
                        </strong>
                      </p>
                    </div>
                  </>
                )}
                {/* SG */}
                {globalFeatureInSG && (
                  <>
                    {stores && stores.length > 0 && (
                      <div className={`${style.contact}__methods__cell`}>
                        <img src={contact1} alt="Visit Castlery" />
                        <Link className={`${style.contact}__methods__title`} to={getUrl('showroom')}>
                          Visit Us
                        </Link>
                        <Link to={getUrl('showroom')} className={`${style.contact}__methods__subtitle`}>
                          {'Showroom Location >'}
                        </Link>
                        <p>
                          <strong>
                            Mon - Sun & PH
                            <br />
                            10:00am - 9:00pm
                            <br />
                            <br />
                          </strong>
                          <strong>Note:</strong> Some public holidays may have special hours. Check our Google listing
                          for the latest info.
                        </p>
                      </div>
                    )}
                    {/* <div className={`${style.contact}__methods__cell`}>
                      <>
                        <img src={contact3} alt="Live Chat Castlery" />
                        <button
                          type="button"
                          onClick={() => this.showChat()}
                          className={`${style.contact}__methods__title btn`}
                        >
                          Live Chat
                        </button>
                        <div
                          role="button"
                          onClick={() => this.showChat()}
                          className={`${style.contact}__methods__subtitle`}
                        >
                          {'Chat with us >'}
                        </div>
                      </>
                      <p>
                        <strong>
                          Mon - Sun & PH
                          <br />
                          10:00am - 9:00pm
                          <br />
                          <br />
                        </strong>
                      </p>
                    </div> */}

                    <div className={`${style.contact}__methods__cell`}>
                      <img src={whatsapp} alt="Call Castlery" />
                      <a className={`${style.contact}__methods__title`} href={contactUsLink}>
                        {contactMethodTitle[__COUNTRY__] || 'WhatsApp'}
                      </a>
                      <a href={contactUsLink} className={`${style.contact}__methods__subtitle`}>
                        {`${lang.t('common.whatsapp.presentation')} >`}
                      </a>

                      <p>
                        <strong>
                          Mon - Sun <br />
                          10:00am - 9:00pm
                        </strong>
                        <br />
                        <br />
                        <strong>Note: </strong>Some public holidays may have special hours.
                        <br />
                        <br />
                      </p>
                    </div>
                  </>
                )}
                {/* AU */}
                {globalFeatureInAU && (
                  <>
                    <div className={`${style.contact}__methods__cell`}>
                      <>
                        <div className={`${style.contact}__methods__cell`}>
                          <img src={contact1} alt="Visit Castlery" />
                          <Link className={`${style.contact}__methods__title`} to={getUrl('sydney-showroom')}>
                            Visit Us
                          </Link>
                          <Link to={getUrl('sydney-showroom')} className={`${style.contact}__methods__subtitle`}>
                            {'Sydney Showroom >'}
                          </Link>
                        </div>
                      </>

                      <p>
                        <strong>
                          Mon - Wed & Fri
                          <br />
                          9:00am - 5:30pm
                          <br />
                          <br />
                          Thu
                          <br />
                          9:00am - 9:00pm
                          <br />
                          <br />
                          Sat
                          <br />
                          9:00am - 5:00pm
                          <br />
                          <br />
                          Sun
                          <br />
                          10:00am - 5:00pm
                          <br />
                        </strong>
                        <br />
                      </p>

                      <Link
                        to={getUrl('au/general-content/main-pages/castlery-brisbane-showroom-launch-test')}
                        className={`${style.contact}__methods__subtitle`}
                      >
                        {'Brisbane Showroom >'}
                      </Link>

                      <p>
                        <strong>
                          Mon - Sat
                          <br />
                          9:00am - 5:00pm
                          <br />
                          <br />
                          Sun
                          <br />
                          10:00am - 5:00pm
                          <br />
                          <br />
                        </strong>
                        <strong>Note: </strong>Some public holidays may have special hours. Check our Google listing for
                        the latest info.
                        <br />
                      </p>
                    </div>

                    <div className={`${style.contact}__methods__cell`}>
                      <>
                        <img src={contact3} alt="Live Chat Castlery" />
                        <button
                          type="button"
                          onClick={() => this.showChat()}
                          // onClick={() => window.open('https://www.castlery.com/sg/contact-us')}
                          className={`${style.contact}__methods__title btn`}
                        >
                          Live Chat
                        </button>
                        <div
                          role="button"
                          // onClick={() => window.open('https://www.castlery.com/sg/contact-us')}
                          onClick={() => this.showChat()}
                          className={`${style.contact}__methods__subtitle`}
                        >
                          {'Chat with us >'}
                        </div>
                      </>
                      <p>
                        <strong>
                          Mon - Sun
                          <br />
                          9:00am - 9:00pm AEST
                          <br />
                          <br />
                        </strong>
                      </p>
                    </div>

                    <div className={`${style.contact}__methods__cell`}>
                      <img src={whatsapp} alt="Call Castlery" />
                      <a className={`${style.contact}__methods__title`} href={contactUsLink}>
                        {contactMethodTitle[__COUNTRY__] || 'WhatsApp'}
                      </a>
                      <a href={contactUsLink} className={`${style.contact}__methods__subtitle`}>
                        {`${lang.t('common.whatsapp.presentation')} >`}
                      </a>

                      <p>
                        <strong>
                          Mon - Sun
                          <br />
                          9:00am - 9:00pm AEST
                          <br />
                          <br />
                        </strong>
                        <br />
                        <br />
                      </p>
                    </div>
                  </>
                )}
                {/* UK */}
                {globalFeatureInUK && (
                  <>
                    <div className={`${style.contact}__methods__cell`}>
                      <>
                        <img src={contact3} alt="Live Chat Castlery" />
                        <button
                          type="button"
                          onClick={() => this.showChat()}
                          className={`${style.contact}__methods__title btn`}
                        >
                          Live Chat
                        </button>
                        <div
                          role="button"
                          onClick={() => this.showChat()}
                          className={`${style.contact}__methods__subtitle`}
                        >
                          {'Chat with us >'}
                        </div>
                      </>
                      <p>
                        <strong>
                          Mon - Fri
                          <br />
                          8:00am - 8:00pm (UK time)
                          <br />
                          <br />
                        </strong>
                      </p>
                    </div>

                    <div className={`${style.contact}__methods__cell`}>
                      <img src={whatsapp} alt="Call Castlery" />
                      <a className={`${style.contact}__methods__title`} href={contactUsLink}>
                        {contactMethodTitle[__COUNTRY__] || 'WhatsApp'}
                      </a>
                      <a href={contactUsLink} className={`${style.contact}__methods__subtitle`}>
                        {`${lang.t('common.whatsapp.presentation')} >`}
                      </a>
                      <p>
                        <strong>
                          Mon - Fri
                          <br />
                          8:00am - 8:00pm (UK time)
                          <br />
                          <br />
                        </strong>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {enableDisplayContactText && (
              <div>
                <Typography
                  sx={{
                    fontStyle: 'italic',
                    px: !desktop ? 4 : 6,
                  }}
                  level="caption1"
                  textColor="brand.charcoal.500"
                >
                  By texting us, you consent to receive text messages from Castlery at the mobile number you use to text
                  and you are opting-in to receive future messages or a phone call in the number you provided. Message &
                  Data rates may apply. View our Terms and Privacy Policy for more information.
                </Typography>
              </div>
            )}
            <div id="contactUsForm" className={`${style.contact}__form`} ref={(c) => (this.form = c)}>
              <h2 ref={this.scrollToFormRef}>Need More Assistance? Email Us Via This Form</h2>

              {isDataPrivacyType ? (
                <p className={`${style.contact}__form__subtitle`}>
                  <span>State Privacy Rights: </span>
                  Depending on where you reside, you may have certain rights regarding your personal data under
                  applicable law. If you would like to exercise your rights, please complete this form.{' '}
                </p>
              ) : enableDisplayDataPrivacyText ? (
                <p>We generally respond within {responseTime}</p>
              ) : null}
              <Form
                formName="Contact Us"
                onChange={this.onChange}
                noValidate
                action="/"
                onSubmit={this.submit}
                onValid={() => this.setState({ formIsValid: true })}
                onInvalid={() => this.setState({ formIsValid: false })}
              >
                <div className="row">
                  <div className="col-xs-6">
                    <FloatInput
                      type="text"
                      name="firstName"
                      autoCorrect="off"
                      autoComplete="given-name"
                      placeholder="First Name *"
                      maxLength="64"
                      value={user ? user.firstname : ''}
                      required
                    />
                  </div>
                  <div className="col-xs-6">
                    <FloatInput
                      type="text"
                      name="lastName"
                      autoCorrect="off"
                      autoComplete="given-name"
                      placeholder="Last Name *"
                      maxLength="64"
                      value={user ? user.lastname : ''}
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className={`${!isDataPrivacyType ? 'col-sm-6' : 'col-sm-12'}`}>
                    <FloatInput
                      type="email"
                      name="email"
                      autoCapitalize="off"
                      autoCorrect="off"
                      autoComplete="email"
                      placeholder="Email *"
                      validations="isEmail"
                      validationError="Please provide a valid email."
                      value={user ? user.email : ''}
                      required
                    />
                  </div>
                  {!isDataPrivacyType && (
                    <div className="col-sm-6">
                      {globalFeatureInUS ? (
                        !isDataPrivacyType && (
                          <PhoneNumberInput
                            name="phone_number"
                            autoCorrect="off"
                            placeholder="Contact Number *"
                            options={{
                              numericOnly: true,
                              blocks: [0, 3, 0, 3, 4],
                              delimiters: ['(', ')', ' ', '-'],
                            }}
                            validations={{
                              matchRegexp: config.phoneRegExp,
                            }}
                            validationError="Please provide a valid phone number."
                            value={user && user.phone ? user.phone : ''}
                            required
                          />
                        )
                      ) : (
                        <FloatInput
                          type="tel"
                          name="phone_number"
                          autoCorrect="off"
                          autoComplete="tel"
                          placeholder={globalFeatureInCA ? 'Contact Number * ' : 'Contact Number * (no space or dash)'}
                          validations={{
                            matchRegexp: config.phoneRegExp,
                          }}
                          validationError="Please provide a valid phone number."
                          value={user && user.phone ? user.phone : ''}
                          required
                        />
                      )}
                    </div>
                  )}
                </div>
                <div className="row">
                  <div className="col-xs-12">
                    <FloatSelect
                      name="type"
                      placeholder="Type *"
                      options={Object.keys(QUERY_TYPES).reduce(
                        (res, key) => ({
                          ...res,
                          [key]: key,
                        }),
                        {}
                      )}
                      value={currentType}
                      required
                    />
                  </div>
                  <div className="col-xs-12" />
                </div>
                {[cancelType, returnType].includes(currentType) && (
                  <div className="row">
                    <div className="col-xs-12">
                      <FloatSelect
                        name="reason"
                        placeholder="Reason *"
                        options={currentType === cancelType ? cancelReasons : returnReasons}
                        required
                      />
                    </div>
                  </div>
                )}
                {[cancelType, returnType].includes(currentType) && currentReason === 'Others' && (
                  <div className="row">
                    <div className="col-xs-12">
                      <FloatInput name="specifyReason" placeholder="Please specify your reason *" required />
                    </div>
                  </div>
                )}

                {isDataPrivacyType && (
                  <div className="row">
                    <div className="col-xs-12">
                      <FloatSelect
                        name="reason"
                        placeholder="Data Subject Request *"
                        options={dataPrivacyRequests}
                        CustomOption={({ value, className }) => (
                          <>
                            {value}
                            &nbsp;&nbsp;
                            <span
                              className={className}
                              style={{
                                color: '#666',
                                fontSize: '14px',
                              }}
                            >
                              {acknowledgementTexts[value] || ''}
                            </span>
                          </>
                        )}
                        required
                      />
                    </div>
                  </div>
                )}

                {!isDataPrivacyType && (
                  <div className="row">
                    <div className="col-xs-12">
                      <FloatInput
                        type="text"
                        name="order_number"
                        autoCorrect="off"
                        placeholder={`Order Number ${isOrderNumberRequired ? '*' : '(Optional)'}`}
                        validations={{
                          matchRegexp: /^\d{9}$/,
                        }}
                        validationError="Please provide a valid order number."
                        required={isOrderNumberRequired}
                      />
                    </div>
                  </div>
                )}
                <div className="row">
                  <div className="col-xs-12">
                    <FloatInput
                      type="text"
                      name="subject"
                      autoCorrect="off"
                      placeholder="Subject *"
                      maxLength="150"
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-xs-12">
                    <FloatTextarea rows="3" name="comment" autoCorrect="off" placeholder="Message *" required />
                  </div>
                </div>

                {[damagesType, cancelType, returnType].includes(currentType) && (
                  <>
                    {enableShowPONumberExplanation && (
                      <div className="row">
                        <div className="col-sm-6">
                          <div className={`${style.contact}__form__po`}>
                            <FloatInput
                              type="text"
                              name="po_number"
                              autoCapitalize="off"
                              autoCorrect="off"
                              placeholder={`PO Number <span style="font-size: 14px">(Optional, locate it on the packaging)</span>`}
                            />
                            <ReactSVG
                              name="info"
                              className={`${style.contact}__form__po-info`}
                              onClick={this.showPONumberExplanation}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className={`${style.contact}__form__uploads`} ref={this.scrollToPhotoRef}>
                      <div className={`${style.contact}__form__uploads__intro`}>
                        Please note that we require photos of the item you received for our own records.
                      </div>
                      <div className={`${style.contact}__form__uploads__container`}>
                        {photoStandards[currentType].map((photoStandard) => (
                          <div key={photoStandard.key} className={`${style.contact}__form__upload`}>
                            {uploadedImages[photoStandard.key] ? (
                              <div
                                className={`${style.contact}__form__upload__image`}
                                style={{
                                  backgroundImage: `url(${uploadedImages[photoStandard.key].preview})`,
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => this.removeImage(photoStandard.key)}
                                  className="btn"
                                >
                                  <ReactSVG name="close" />
                                </button>
                              </div>
                            ) : (
                              <Dropzone
                                className={`${style.contact}__form__dropzone`}
                                accept="image/*"
                                maxSize={maxFileSize}
                                onDrop={(file) => this.uploadImage(photoStandard.key, file)}
                              >
                                <div className={`${style.contact}__form__dropzone__container`}>
                                  <img alt="Upload" src={photo} className={`${style.contact}__form__dropzone__img`} />
                                  <div className={`${style.contact}__form__dropzone__text`}>{photoStandard.name}</div>
                                </div>
                              </Dropzone>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={`${style.contact}__form__damages`}>
                      {currentType === returnType ? (
                        <h4>Please take a photo of the furniture with these few angles</h4>
                      ) : (
                        <>
                          <h4>Examples of required photo angles:</h4>
                          <div className={`${style.contact}__form__damages__intro`}>
                            Place a coin next to the defective area for size reference.
                          </div>
                        </>
                      )}
                      <div className={`${style.contact}__form__damages__photos`}>
                        {photoStandards[currentType].map((photoStandard) => (
                          <div className={`${style.contact}__form__damages__photo-container`} key={photoStandard.key}>
                            <div className={`${style.contact}__form__damages__photo`}>
                              <ReactPicture
                                srcset={`${cloudinaryRoot}/${photoStandard.src}`}
                                loader={{ ratio: 1, widths: [200, 250] }}
                                alt={photoStandard.name}
                              />
                            </div>
                            <div className={`${style.contact}__form__damages__standard`}>{photoStandard.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <ReCaptcha className={`${style.contact}__form__recaptch`} ref={this.reCaptcha} />
                <div className={`${style.contact}__form__submit`}>
                  <Button text="Send" type="submit" loading={processing} width={200} size="medium" />
                </div>
              </Form>
            </div>
          </Container>
        </div>
      </div>
    );
  }
}
