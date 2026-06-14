import Rate from './Rate';
import Verified from './Verifyed';
import RightArrow from './right-arrow';
import LeftArrow from './left-arrow';

type IconProps = {
  fill?: string;
  width?: number;
  height?: number;
  outerClass?: string;
};

const iconList = {
  Rate,
  Verified,
  RightArrow,
  LeftArrow,
};

export { IconProps, iconList };
