import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import SvgIcon from 'components/SvgIcon';
import Spot from 'components/Spot';
import ReadMore from 'components/Review/ReadMore';
import { FrameContext } from 'containers/Frame/FrameContext';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from '../style.scss';

const Props = {
  tip: PropTypes.shape({
    x: PropTypes.string,
    y: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    variant_id: PropTypes.string,
    popup: PropTypes.string,
  }),
  viewAll: PropTypes.bool,
  onClick: PropTypes.func,
};

const showUpPosition = {
  above: { bottom: '100%' },
  below: { top: '100%' },
  left: { right: '100%' },
  right: { left: '100%' },
};
function Tip(props) {
  const { tip, viewAll, onClick, ...propsArg } = props;
  const { desktop } = useBreakpoints();
  const frame = useContext(FrameContext);
  const positionStyle = tip
    ? {
        gridColumn: `${tip.x}/${+tip.x + 1}`,
        gridRow: `${tip.y}/${+tip.y + 1}`,
      }
    : {};

  const TipPopup = ({ show }) => (
    <div
      className={`${style.theLook}__popup ${style.theLook}__tip  ${show ? 'active' : ' '}`}
      style={{ ...showUpPosition[tip?.popup], width: '375px' }}
    >
      {/* popup title */}
      <div className={`${style.theLook}__tip__header`} style={{ paddingTop: '10px' }}>
        <SvgIcon name="tip" />
        <span className={`${style.theLook}__tip__title`}>{tip.title}</span>
      </div>
      <div className={`${style.theLook}__tip__description`}>
        <ReadMore showLess underline maxLength={215} content={tip.description} color={style.primaryColor} />
      </div>
    </div>
  );

  const onClickSpot = () => {
    // eslint-disable-next-line no-unused-expressions
    onClick && onClick();
  };

  return (
    <div style={{ ...positionStyle }} className={`${style.theLook}__togglePopup`}>
      <Spot stopAnimation={viewAll} {...propsArg} onClick={onClickSpot} bgColor="#DBBDAF">
        {desktop ? <TipPopup show={viewAll} /> : null}
      </Spot>
    </div>
  );
}

Tip.propTypes = Props;
export default Tip;
