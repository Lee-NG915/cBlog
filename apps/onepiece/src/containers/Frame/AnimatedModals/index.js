import PlainModal from './PlainModal';
import BottomUpFadeModal from './BottomUpFadeModal';
import BottomUpModal from './BottomUpModal';
import FadeModal from './FadeModal';
import SideModal from './SideModal';

const animatedModals = {
  side: SideModal,
  fade: FadeModal,
  plain: PlainModal,
  bottomUp: BottomUpModal,
  bottomUpFade: BottomUpFadeModal,
};

export default animatedModals;
