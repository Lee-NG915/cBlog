import PropTypes from 'prop-types';

export const propTypes = {
  containerClassName: PropTypes.string,
  containerStyle: PropTypes.object,
  leftClassName: PropTypes.string,
  rightClassName: PropTypes.string,
  leftStyle: PropTypes.object,
  rightStyle: PropTypes.object,
  leftComponent: PropTypes.any,
  rightComponent: PropTypes.any,
  whichIsTop: PropTypes.oneOf(['left', 'right']),
  border: PropTypes.bool,
  borderColor: PropTypes.string,

  href: PropTypes.string,
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
};

export const defaultProps = {
  containerStyle: {},
  whichIsTop: 'left',
  leftClassName: '',
  rightClassName: '',
  leftStyle: {},
  rightStyle: {},
  border: false,
};
