import React from 'react';
import PropTypes from 'prop-types';
import ApiClient from 'helpers/ApiClient';
import classNames from 'classnames';
import { toPrice, validateCreditCard } from 'utils/number';
import Spinner from 'components/Spinner';
import ReactSVG from 'components/ReactSVG';

import { connect } from 'react-redux';
import { load as loadInstalment } from 'redux/modules/instalment';
import { get2c2pEncryption } from 'redux/modules/cart';
import { globalFeatureInSG } from 'config';
import Input from './Input';

import imgOCBC from '../images/instalment-ocbc.png';
import imgUOB from '../images/instalment-uob.png';
import imgAMEX from '../images/instalment-amex.png';
import imageCVV from '../images/cvv.jpg';
import imgDBS from '../images/dbs.png';
import imgPOSB from '../images/posb.png';
import style from './style.scss';

// because 2c2p contains some client unique variables, we only require it on client side
let my2c2p;
if (__CLIENT__) {
  my2c2p = require('../utils/2c2p');
}

const icons = {
  ocbc: imgOCBC,
  uob: imgUOB,
  amex: imgAMEX,
  dbs: imgDBS,
  posb: imgPOSB,
};

@connect(
  (state) => ({
    instalment: state.instalment,
  }),
  { loadInstalment, get2c2pEncryption },
  null,
  { forwardRef: true }
)
export default class InstalmentForm extends React.Component {
  static propTypes = {
    instalment: PropTypes.object,
    loadInstalment: PropTypes.func,
    get2c2pEncryption: PropTypes.func,

    total: PropTypes.number.isRequired,
    updateSelectedBank: PropTypes.func,
    className: PropTypes.string,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  state = {
    error: '',

    selectedBankIndex: -1,
    selectedBankOptionIndex: -1,

    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',

    // input errors
    errorNumber: '',
    errorExpiry: '',
    errorCVV: '',

    validNumber: false,
    validExpiry: false,
    validCVV: false,
  };

  componentDidMount() {
    this.props.loadInstalment();
  }

  client = new ApiClient();

  changeBank(bankIndex) {
    const { instalment, updateSelectedBank } = this.props;
    const bank = instalment.data.ipp_options[bankIndex];
    updateSelectedBank(bank);

    this.setState({
      selectedBankIndex: bankIndex,
      selectedBankOptionIndex: -1,
      cardName: '',
      cardNumber: '',
      cardExpiry: '',
      cardCVV: '',
      errorNumber: '',
      errorName: '',
      errorExpiry: '',
      errorCVV: '',
      validNumber: false,
      validName: false,
      validExpiry: false,
      validCVV: false,
    });
  }

  changeBankOption(optionIndex) {
    this.setState({
      selectedBankOptionIndex: optionIndex,
    });
  }

  cardNumberChange = (number) => {
    const { instalment } = this.props;
    const { selectedBankIndex } = this.state;
    const instalmentOptions = instalment.data.ipp_options;
    const bank = instalmentOptions[selectedBankIndex];

    this.setState({
      cardNumber: number,
    });

    const { bins } = bank;
    const length = Math.min(number.length, 6);
    if (new RegExp(`^(${bins.map((bin) => bin.slice(0, length)).join('|')})`).test(number)) {
      // for normal banks
      if (bank.bank_code !== 'AMEX' && ((number.length === 16 && validateCreditCard(number)) || number.length < 16)) {
        this.setState({
          errorNumber: '',
          validNumber: number.length === 16,
        });
        return;
      }

      if (bank.bank_code === 'AMEX' && ((number.length === 15 && validateCreditCard(number)) || number.length < 15)) {
        this.setState({
          errorNumber: '',
          validNumber: number.length === 15,
        });
        return;
      }
    }

    this.setState({
      errorNumber: 'Please provide a valid credit card',
      validNumber: false,
    });
  };

  cardExpiryChange = (value) => {
    this.setState({
      cardExpiry: value,
    });

    if (value.length === 4 || value.length === 6) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const year = +`${value.length === 4 ? '20' : ''}${value.slice(2)}`;
      const month = +value.slice(0, 2);

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        this.setState({
          errorExpiry: 'Please input a valid expiry date',
          validExpiry: false,
        });
        return;
      }
    }

    this.setState({
      errorExpiry: '',
      validExpiry: value.length === 4 || value.length === 6,
    });
  };

  cardCVVChange = (value) => {
    const { selectedBankIndex } = this.state;
    const { instalment } = this.props;
    const instalmentOptions = instalment.data.ipp_options;
    const bank = instalmentOptions[selectedBankIndex];

    this.setState({
      cardCVV: value,
    });

    if (/^\d*$/.test(value) && !(bank.bank_code !== 'AMEX' && value.length === 4)) {
      this.setState({
        errorCVV: '',
        validCVV:
          (value.length === 3 && bank.bank_code !== 'AMEX') || (value.length === 4 && bank.bank_code === 'AMEX'),
      });
    } else {
      this.setState({
        errorCVV: 'Please input a valid CVV',
        validCVV: false,
      });
    }
  };

  // return value to parent
  submit() {
    const { instalment, get2c2pEncryption } = this.props;
    const {
      selectedBankIndex,
      selectedBankOptionIndex,
      errorNumber,
      errorExpiry,
      errorCVV,
      cardNumber,
      cardCVV,
      cardExpiry,
    } = this.state;

    const instalmentOptions = instalment.data.ipp_options;

    const bank = instalmentOptions[selectedBankIndex];

    if (selectedBankIndex === -1 || selectedBankOptionIndex === -1) {
      this.setState({
        error: 'Please select a valid instalment plan',
      });
      return;
    }

    this.setState({
      error: '',
    });

    if (errorNumber || errorExpiry || errorCVV) {
      return;
    }

    if (
      !(
        (bank.bank_code === 'AMEX' && /^\d{15}$/.test(cardNumber)) ||
        (bank.bank_code !== 'AMEX' && /^\d{16}$/.test(cardNumber))
      )
    ) {
      this.setState({
        errorNumber: 'Please input a valid credit card number',
      });
      return;
    }

    if (cardExpiry.length !== 4 && cardExpiry.length !== 6) {
      this.setState({
        errorExpiry: 'Please input a valid expiry date',
      });
      return;
    }

    if (!((cardCVV.length === 3 && bank.bank_code !== 'AMEX') || (cardCVV.length === 4 && bank.bank_code === 'AMEX'))) {
      this.setState({
        errorCVV: 'Please input a valid CVV',
      });
      return;
    }

    my2c2p.getEncrypted('2c2p-payment-form', (encryptedData, errCode, errDesc) => {
      if (errCode !== 0) {
        console.error(
          JSON.stringify(
            { message: 'Error encrypting credit card information', error: `${errDesc}: ${errCode}` },
            null,
            2
          )
        );
      } else {
        get2c2pEncryption({
          tctp_attributes: {
            encrypted_card_info: encryptedData.encryptedCardInfo,
            masked_card_info: encryptedData.maskedCardInfo,
            exp_month_card_info: encryptedData.expMonthCardInfo,
            exp_year_card_info: encryptedData.expYearCardInfo,
            ipp_period: bank.options[selectedBankOptionIndex].period,
            bank_name: bank.bank_code,
          },
        })
          .then((payload) => {
            const form = document.createElement('form');
            const input = document.createElement('input');

            form.method = 'POST';
            form.action = __INSTALMENT_URL__;

            input.type = 'hidden';
            input.name = 'paymentRequest';
            input.value = payload.payment_request;
            form.appendChild(input);

            document.body.appendChild(form);

            form.submit();
          })
          .catch((error) => {
            this.context.frame.openModal('response', { body: error });
          });
      }
    });
  }

  explainCVV() {
    this.context.frame.addModal(
      <div
        className={style.cvvModal}
        onClick={(e) => {
          if (e.target.classList.contains(style.cvvModal)) {
            this.context.frame.removeModal();
          }
        }}
      >
        <div className={`${style.cvvModal}__container`}>
          <img src={imageCVV} alt="CVV" />
          <button
            type="button"
            onClick={() => this.context.frame.removeModal()}
            className={`${style.cvvModal}__close btn`}
          >
            <ReactSVG name="close" />
          </button>
        </div>
      </div>
    );
  }

  render() {
    const { className, total, instalment } = this.props;
    const {
      selectedBankIndex,
      selectedBankOptionIndex,
      error,
      errorNumber,
      errorExpiry,
      errorCVV,
      validNumber,
      validExpiry,
      validCVV,
      cardExpiry,
    } = this.state;

    if (!instalment.data) {
      return (
        <div className={`${style.instalment}__loading ${className}`}>
          <Spinner />
        </div>
      );
    }
    const instalmentOptions = globalFeatureInSG
      ? instalment.data.ipp_options
      : instalment.data.ipp_options?.filter((item) => item.bank_code.toLowerCase() !== 'dbs' && item);
    if (instalmentOptions.length > 0) {
      return (
        <div className={classNames(style.instalment, className)}>
          <p>Please select your instalment plan:</p>
          <div className={classNames(`${style.instalment}__banks`, style.radio)}>
            {instalmentOptions.map((option, index) => {
              const bankCodeStr = option.bank_code?.toLowerCase();
              const isDBS = bankCodeStr === 'dbs';
              return (
                <button
                  key={option.bank}
                  onClick={() => this.changeBank(index)}
                  type="button"
                  disabled={index === selectedBankIndex}
                  className={classNames('btn', {
                    'is-selected': index === selectedBankIndex,
                  })}
                >
                  <img src={icons[bankCodeStr]} className={classNames({ dbs: isDBS })} alt={option.bank} />
                  {isDBS && <img src={icons.posb} alt="posb" />}
                </button>
              );
            })}
          </div>
          {selectedBankIndex > -1 && (
            <div className={`${style.instalment}__options`}>
              {instalmentOptions[selectedBankIndex].options.map((option, index) => (
                <div key={index}>
                  <button
                    onClick={() => this.changeBankOption(index)}
                    disabled={index === selectedBankOptionIndex || total < +option.min_amount}
                    className={classNames('btn', {
                      'is-selected': index === selectedBankOptionIndex,
                    })}
                    type="button"
                  >
                    {total >= +option.min_amount ? (
                      <div>
                        <span>
                          {toPrice(total / option.period)} x {option.period} months
                        </span>
                        <span>0% interest</span>
                      </div>
                    ) : (
                      <div>
                        <span>
                          {option.period} months, for order above {toPrice(option.min_amount)}
                        </span>
                        <span>0% interest</span>
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
          {selectedBankOptionIndex > -1 && (
            <form
              id="2c2p-payment-form"
              className={`${style.instalment}__form`}
              onSubmit={(e) => e.preventDefault()}
              noValidate
              action="/"
            >
              <div className="row">
                <div className="col-xs-12">
                  <label className={`${style.instalment}__form__title`}>Card number</label>
                  <Input
                    type="tel"
                    data-encrypt="cardnumber"
                    placeholder="0000 0000 0000 1234"
                    autoComplete="cc-number"
                    onChange={this.cardNumberChange}
                    error={errorNumber}
                    isValid={validNumber}
                    options={{ creditCard: true }}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-xs-6">
                  <label className={`${style.instalment}__form__title`}>Expiry Date</label>
                  <Input
                    type="tel"
                    placeholder="MM / YY"
                    autoComplete="cc-exp"
                    onChange={this.cardExpiryChange}
                    error={errorExpiry}
                    isValid={validExpiry}
                    options={{
                      date: true,
                      datePattern: ['m', 'Y'],
                      delimiter: ' / ',
                    }}
                  />
                </div>
                <div className="col-xs-6">
                  <label className={`${style.instalment}__form__title`}>
                    CVV
                    <button tabIndex="-1" type="button" onClick={this.explainCVV.bind(this)} className={style.hint}>
                      <ReactSVG name="help" />
                    </button>
                  </label>
                  <Input
                    type="tel"
                    data-encrypt="cvv"
                    placeholder="123"
                    onChange={this.cardCVVChange}
                    error={errorCVV}
                    isValid={validCVV}
                    autoComplete="off"
                    maxLength="4"
                  />
                </div>
              </div>
              <input type="hidden" data-encrypt="month" value={cardExpiry.slice(0, 2)} />
              <input
                type="hidden"
                data-encrypt="year"
                value={`${cardExpiry.length <= 4 ? '20' : ''}${cardExpiry.slice(2)}`}
              />
            </form>
          )}
          {error && <div className={`${style.instalment}__error`}>{error}</div>}
        </div>
      );
    }
    if (error) {
      return <div>{error}</div>;
    }
    return null;
  }
}
