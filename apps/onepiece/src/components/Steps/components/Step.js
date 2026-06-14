import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import style from '../style.scss';

const Step = ({ isCurrentStep, status = 'wait', stepLast, stepNumber, title, description, url }, { router }) => {
  const handleClick = () => {
    if (status === 'finish') {
      router.push(url);
    }
  };

  return (
    <div className={classNames(`${style.steps}__item`, `${style.steps}__status-${status}`)}>
      {!stepLast && (
        <div className={`${style.steps}__tail`}>
          <i />
        </div>
      )}

      <div className={`${style.steps}__step`}>
        <div
          className={classNames(`${style.step}__head`, {
            'is-current': isCurrentStep,
            'is-finished': status === 'finish',
          })}
          role="button"
          onClick={handleClick}
        >
          <div className={`${style.step}__head-inner`}>{stepNumber}</div>
        </div>

        <div
          className={classNames(`${style.step}__main`, {
            'is-current': isCurrentStep,
            'is-finished': status === 'finish',
          })}
          role="button"
          onClick={handleClick}
        >
          <div className={`${style.step}__main__title`}>{title}</div>

          {description && <div className={`${style.step}__main__description`}>{description}</div>}
        </div>
      </div>
    </div>
  );
};

Step.propTypes = {
  isCurrentStep: PropTypes.bool,
  status: PropTypes.string,
  stepLast: PropTypes.bool,
  stepNumber: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  url: PropTypes.string,
};
Step.defaultProps = {
  description: '',
};
Step.contextTypes = {
  router: PropTypes.object,
};

export default Step;
