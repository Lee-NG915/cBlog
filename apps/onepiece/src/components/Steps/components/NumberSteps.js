import React, { Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import style from '../style.scss';

const NumberSteps = ({ className, children, current, status, direction, sequence }) => {
  const lastIndex = Children.count(children) - 1;

  return (
    <div className={classNames(className, style.steps, `${style.steps}__${direction}`)}>
      {Children.map(children, (item, index) => {
        const np = {
          sequence,
          stepNumber: (index + 1).toString(),
          stepLast: index === lastIndex,
          isCurrentStep: index === current - 1,
          isLastFinishStep: status === 'error' && index === current - 2,
          status: 'wait',
        };

        if (!item.props.status) {
          if (index === current - 1) {
            np.status = status;
          } else if (index < current - 1) {
            np.status = 'finish';
          } else {
            np.status = 'wait';
          }
        }

        return cloneElement(item, np);
      })}
    </div>
  );
};

NumberSteps.propTypes = {
  className: PropTypes.string,
  children: PropTypes.object,
  current: PropTypes.number,
  status: PropTypes.string,
  direction: PropTypes.string,
  sequence: PropTypes.bool,
};

export default NumberSteps;
