import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import classNames from 'classnames';
import { getUrl } from 'pages';
import { Button, OutlineBtn } from 'components/Button';
import { toPrice } from 'utils/number';
import ReactSVG from 'components/ReactSVG';
import style from './style.scss';

const ConvertToCredits = ({ vouchers, total, type, onClose, onSubmit }, { frame }) => {
  const [convertLoading, setConvertLoading] = useState(false);

  const handleClose = () => {
    if (type === 'modal') {
      frame.removeModal();
    } else if (onClose) {
      onClose();
    }
  };

  const handleConvert = async () => {
    setConvertLoading(true);
    try {
      await onSubmit();
      setConvertLoading(false);
    } catch (err) {
      setConvertLoading(false);
    }
  };

  return (
    <div
      className={classNames(`${style.convertToCredits}`, {
        'is-modal': type === 'modal',
      })}
    >
      <div className={`${style.convertToCredits}__container`}>
        <div className={`${style.convertToCredits}__title`}>Convert Your Vouchers to Credits</div>

        <div className={`${style.convertToCredits}__description`}>
          <p>
            We’ve launched our <b>Store Credits</b> program! You will now be able to accumulate your rewards and redeem
            your credits for a voucher amount of your choice.
          </p>
          <p>
            If you currently have unused vouchers* in your Castlery account from leaving a product review, you can
            choose to convert all <b>unused and unexpired review vouchers</b> into credits from now till December 31
            2022.
          </p>
          <p>
            All credits will be valid for 1 year from the date of conversion and will expire within 1 year of issue. If
            you prefer not to take action, fret not. Your existing vouchers will still be valid for use, expiring on the
            set date earlier communicated to you at the point of distribution.
          </p>
        </div>

        <div className={`${style.convertToCredits}__rule`}>
          <p>Here’s how you can convert your existing vouchers:</p>

          <table className={`${style.convertToCredits}__rule__table`}>
            <thead>
              <tr>
                <th>Voucher</th>
                <th>Quantity</th>
                <th>Credits</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(vouchers)?.map((key) => (
                <tr key={key}>
                  <td>{toPrice(key)}</td>
                  <td>{vouchers[key].length}</td>
                  <td>50</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>
                  <span>Total</span>
                  <span>{total} credits</span>
                </td>
              </tr>
            </tfoot>
          </table>

          <div className={`${style.convertToCredits}__rule__tip`}>
            Only <b>unused and unexpired review vouchers</b> currently credited to your Castlery account can be
            converted. This limited time only feature ends on December 31 2022; you will no longer be able to perform
            this action from January 1 2023 onwards. This action cannot be undone and will not affect any future
            vouchers you may receive. All vouchers are subject to Castlery’s standard{' '}
            <Link to={getUrl('store-credits-terms')}>Terms & Conditions</Link>.
          </div>
        </div>

        <div className={`${style.convertToCredits}__btn`}>
          <OutlineBtn text="Cancel" color="primary" borderColor="primary" onClick={handleClose} />
          <Button text="Convert" onClick={handleConvert} loading={convertLoading} />
        </div>
      </div>

      {type === 'modal' && (
        <button type="button" className={`btn ${style.convertToCredits}__close`} onClick={handleClose}>
          <ReactSVG name="close" />
        </button>
      )}
    </div>
  );
};

ConvertToCredits.propTypes = {
  vouchers: PropTypes.object,
  total: PropTypes.number,
  type: PropTypes.string,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};
ConvertToCredits.contextTypes = {
  frame: PropTypes.object,
};

export default ConvertToCredits;
