import PropTypes from 'prop-types';

export const propTypes = {
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']), // raw button type,
  href: PropTypes.string, // link to
  color: PropTypes.string, // white, primary etc...
  backgroundcolor: PropTypes.string, // white, primary etc...
  shape: PropTypes.string, // default, square, round, cricle
  size: PropTypes.string, // small, medium, large
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  text: PropTypes.string,
  leftIcon: PropTypes.element,
  rightIcon: PropTypes.element,

  block: PropTypes.bool,
  border: PropTypes.bool,
  disabled: PropTypes.bool,
  disabledClass: PropTypes.string,
  loading: PropTypes.bool,
  hoverClass: PropTypes.string,
  hoverStyle: PropTypes.object,
  disabledColor: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
};
