import React from 'react';
import PropTypes from 'prop-types';

export default class ReCaptcha extends React.Component {
  static callbackList = [];

  static loadJs = () => {
    if (typeof window._$_recaptcha_initialize_$_ !== 'undefined') {
      return;
    }

    window._$_recaptcha_initialize_$_ = function () {
      delete window._$_recaptcha_initialize_$_;
      ReCaptcha.callbackList.forEach((callback) => callback(window.grecaptcha));
      ReCaptcha.callbackList = [];
    };
    // FIXME can use Script Component
    const loadApi = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://www.google.com/recaptcha/api.js?onload=_$_recaptcha_initialize_$_&render=explicit';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });

    loadApi.catch(() => {
      if (typeof window.grecaptcha === 'undefined') {
        console.error('reCaptcha initialization error (not loaded)');
      }
    });
  };

  static propTypes = {
    className: PropTypes.string,
  };

  container = React.createRef();

  componentDidMount() {
    this.addCallback((grecaptcha) => {
      this.widget = grecaptcha.render(this.container.current, {
        sitekey: __RECAPTCHA_KEY__,
        theme: 'light',
      });
    });
  }

  getToken = () => {
    if (this.widget !== undefined) {
      return window.grecaptcha.getResponse(this.widget);
    }
  };

  reset = () => {
    if (this.widget !== undefined) {
      return window.grecaptcha.reset(this.widget);
    }
  };

  addCallback = (callback) => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.grecaptcha) {
      callback(window.grecaptcha);
    } else {
      ReCaptcha.callbackList.push(callback);
      ReCaptcha.loadJs();
    }
  };

  render() {
    const { className } = this.props;
    return <div className={className} ref={this.container} />;
  }
}
