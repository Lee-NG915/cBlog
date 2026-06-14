import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Form, { FloatInput, FloatSelect, PhoneNumberInput } from 'components/Form';
import ReCaptcha from 'components/ReCaptcha';
import Spinner from 'components/Spinner';
import ApiClient from 'helpers/ApiClient';
import config, {
  enableIndustryField,
  enableRegisteredAddress,
  globalFeatureInAU,
  globalFeatureInCA,
  globalFeatureInSG,
  globalFeatureInUK,
  globalFeatureInUS,
} from 'config';
import { withUseBreakpoints } from 'utils/page';
import { Checkbox, Typography } from '@castlery/fortress';
import style from './style.scss';

@connect(
  (state) => ({
    user: state.auth.user,
  }),
  null
)
@withUseBreakpoints
export default class TicketForm extends Component {
  static propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    user: PropTypes.object,
    formName: PropTypes.string.isRequired,
    breakpoints: PropTypes.object,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  state = {
    processing: false,
    hasSubscribe: true,
    showIndustryOther: false,
  };

  client = new ApiClient();

  reCaptcha = React.createRef();

  submit = (data, resetForm) => {
    const { breakpoints = {} } = this.props;
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

    const { firstName, lastName, phoneNumber, email } = data;

    const validData = {
      subject: `Join Castlery's Trade Discount Furniture Program`,
      type: 'Sales Enquiry',
      order: '',
      phone_number: phoneNumber,
      name: `${firstName} ${lastName}`,
      email,
      industry: data.Industry === 'Others' ? data.IndustryOther : data.Industry,
      comment: Object.keys(data).reduce((acc, type) => `${acc}${type}: ${data[type]}<br />`, ''),
      recaptcha_response: this.reCaptcha.current.getToken(),
      subscription_status: this.state.hasSubscribe ? 'SUBSCRIBED' : 'NEVER_SUBSCRIBED',
    };
    const { frame } = this.context;
    const request = this.client.post('/contacts', {
      data: validData,
      header: {
        captcha: this.reCaptcha.current.getToken(), // 新：网关校验
      },
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

  handleChange = (data) => {
    this.setState({
      showIndustryOther: data.Industry === 'Others',
    });
  };

  render() {
    const { title, description, user, formName } = this.props;
    const { processing, showIndustryOther, hasSubscribe } = this.state;

    return (
      <div className={`${style.ticketForm}`} ref={(c) => (this.form = c)}>
        <div className={`${style.ticketForm}__header`}>
          <h2 className={`${style.ticketForm}__title`}>{title}</h2>
          <p className={`${style.ticketForm}__description`} dangerouslySetInnerHTML={{ __html: description }} />
        </div>
        <Form formName={formName} onChange={this.handleChange} onValidSubmit={this.submit} noValidate action="/">
          <div className="row">
            <div className={`${style.ticketForm}__input col-sm-6`}>
              <FloatInput
                type="text"
                name="firstName"
                autoCorrect="off"
                placeholder="First Name *"
                maxLength="32"
                value={user ? user.firstname : ''}
                required
              />
            </div>
            <div className={`${style.ticketForm}__input col-sm-6`}>
              <FloatInput
                type="text"
                name="lastName"
                autoCorrect="off"
                placeholder="Last Name *"
                maxLength="32"
                value={user ? user.lastname : ''}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className={`${style.ticketForm}__input col-sm-6`}>
              {globalFeatureInUS ? (
                <PhoneNumberInput
                  name="phoneNumber"
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
              ) : (
                <FloatInput
                  type="tel"
                  name="phoneNumber"
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
            <div className={`${style.ticketForm}__input col-sm-6`}>
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
          </div>
          <div className="row">
            <div className={`${style.ticketForm}__input col-sm-6`}>
              <FloatInput
                type="text"
                name="Trading Name"
                autoCorrect="off"
                autoCapitalize="off"
                placeholder="Trading Name *"
                maxLength="256"
                required
              />
            </div>
            {globalFeatureInSG ? (
              <div className={`${style.ticketForm}__input col-sm-6`}>
                <FloatInput
                  type="text"
                  name="UEN Number"
                  autoCorrect="off"
                  autoCapitalize="off"
                  placeholder="UEN Number *"
                  maxLength="256"
                  required
                />
              </div>
            ) : globalFeatureInAU ? (
              <div className={`${style.ticketForm}__input col-sm-6`}>
                <FloatInput
                  type="text"
                  name="ABN"
                  autoCorrect="off"
                  autoCapitalize="off"
                  placeholder="ABN *"
                  maxLength="256"
                  required
                />
              </div>
            ) : globalFeatureInUK ? (
              <div className={`${style.ticketForm}__input col-sm-6`}>
                <FloatInput
                  type="text"
                  name="Business Number"
                  autoCorrect="off"
                  autoCapitalize="off"
                  placeholder="Company Registration Number *​"
                  maxLength="256"
                  required
                />
              </div>
            ) : (
              <div className={`${style.ticketForm}__input col-sm-6`}>
                <FloatInput
                  type="text"
                  name="Business Number"
                  autoCorrect="off"
                  autoCapitalize="off"
                  placeholder="Business Number *"
                  maxLength="256"
                  required
                />
              </div>
            )}
          </div>
          <div className="row">
            <div className={`${style.ticketForm}__input col-sm-6`}>
              <FloatInput
                type="text"
                name="Registered Address"
                autoCorrect="off"
                autoCapitalize="off"
                placeholder="Registered Address *"
                maxLength="256"
                required
              />
            </div>
            <div className={`${style.ticketForm}__input col-sm-6`}>
              <FloatSelect
                name="Industry"
                placeholder="Industry *"
                value="Interior Designer"
                options={{
                  'Interior Designer': 'Interior Designer',
                  'Hospitality and Retail': 'Hospitality and Retail',
                  'Property Styling': 'Property Styling',
                  'Construction / Fit Out': 'Construction / Fit Out',
                  'Property developer / Property Management': 'Property developer / Property Management',
                  Architect: 'Architect',
                  'Home Staging': 'Home Staging',
                  Others: 'Others',
                }}
              />
            </div>
          </div>

          {showIndustryOther && (
            <div className="row">
              <div className={`${style.ticketForm}__input col-xs-12`}>
                <FloatInput
                  type="text"
                  name="IndustryOther"
                  autoCorrect="off"
                  autoCapitalize="off"
                  placeholder="Industry * (Select Others)"
                  maxLength="256"
                />
              </div>
            </div>
          )}

          <div className="row">
            <div className={`${style.ticketForm}__input col-sm-6`}>
              <FloatInput
                type="text"
                name="Business Website"
                autoCorrect="off"
                autoCapitalize="off"
                placeholder="Business Website *"
                maxLength="256"
                required
              />
            </div>
            <div className={`${style.ticketForm}__input col-sm-6`}>
              <FloatInput
                type="text"
                name="Business Facebook/Instagram"
                autoCorrect="off"
                autoCapitalize="off"
                placeholder="Business Facebook/Instagram *"
                maxLength="256"
                required
              />
            </div>
          </div>
          <div className="row">
            <div className={`${style.ticketForm}__input col-xs-12`}>
              <FloatInput
                type="text"
                name="Additional Enquiries"
                autoCorrect="off"
                autoCapitalize="off"
                placeholder="Additional Enquiries"
                maxLength="256"
              />
            </div>
          </div>
          <div className="row">
            <div className={`${style.ticketForm}__input col-xs-12`}>
              <Checkbox
                name="Yes, l would like to receive marketing emails and special offers from Castlery."
                label={
                  <Typography level="caption1" textColor="brand.charcoal.600" lineHeight="md">
                    Yes, l would like to receive marketing emails and special offers from Castlery.
                  </Typography>
                }
                checked={hasSubscribe}
                onChange={(e) => {
                  this.setState({
                    hasSubscribe: e.target.checked,
                  });
                }}
              />
            </div>
          </div>
          <ReCaptcha className={`${style.ticketForm}__recaptcha`} ref={this.reCaptcha} />
          <div className={`${style.ticketForm}__submit`}>
            <input
              className="btn btn-primary"
              type="submit"
              disabled={processing}
              value={processing ? ' ' : 'Submit'}
            />
            {processing && <Spinner small />}
          </div>
          <div className="row">
            <div className={`${style.ticketForm}__hint`}>
              <em>
                {globalFeatureInSG
                  ? 'All applications are subject to approval and require 3 business days for processing. '
                  : globalFeatureInCA || globalFeatureInUK
                  ? 'All Trade Program applications are subject to approval. You will receive an email notifying you on the outcome of your application.​'
                  : 'All applications are subject to approval and require 3 working days for approval'}
              </em>
            </div>
          </div>
        </Form>
      </div>
    );
  }
}
