import Modal from './Modal';
import MobileModal from './MobileModal';
import CartModal from './CartModal';
import SearchModal from './SearchModal';
import ResponseModal from './ResponseModal';
import LoginModal from './LoginModal';
import AddressModal from './AddressModal';
import ConfirmModal from './ConfirmModal';
import NewConfirmModal from './NewConfirmModal';
import ImageModal from './ImageModal';
import SectionModal from './SectionModal';
import AppointmentModal from './AppointmentModal';
import SwatchModal from './SwatchModal';
import SubscriptionModal from './SubscriptionModal';
import CalendarModal from './CalendarModal';
import CountrySelectModal from './CountrySelectModal';
import FreeSwatchesModal from './FreeSwatchesModal';
import ContainerModal from './ContainerModal';
import PromptModal from './PromptModal';
import DiscountModal from './DiscountModal';
import HomeownersModal from './HomeownersModal';
import TextModal from './TextModal';
import { LLTNotifyDesktopModal, LLTNotifyMobileModal } from './LLTModal/LLTNotify';
import { LLTPopupDesktopModal, LLTPopupMobileModal } from './LLTModal/LLTPopup';
import UpgradeShippingMethods from './UpgradeShippingMethods';
import DeliveryServicesDetail from './DeliveryServicesDetail';
import { ARDesktopModal, ARMobileModal } from './ARModal';
import ARErrorModal from './ARErrorModal';
import AfterpayModal from './AfterpayModal';

export const desktopModals = {
  modal: Modal,
  cart: CartModal,
  response: ResponseModal,
  login: LoginModal,
  address: AddressModal,
  confirm: ConfirmModal,
  confirmation: NewConfirmModal,
  image: ImageModal,
  section: SectionModal,
  appointment: AppointmentModal,
  swatch: SwatchModal,
  subscription: SubscriptionModal,
  calendar: CalendarModal,
  countrySelect: CountrySelectModal,
  freeSwatches: FreeSwatchesModal,
  container: ContainerModal,
  prompt: PromptModal,
  textModal: TextModal,
  discount: DiscountModal,
  homeowners: HomeownersModal,
  lltNotify: LLTNotifyDesktopModal,
  lltPopup: LLTPopupDesktopModal,
  upgradeShippingMethods: UpgradeShippingMethods,
  deliveryServicesDetail: DeliveryServicesDetail,
  arModal: ARDesktopModal,
  afterpay: AfterpayModal,
};

export const mobileModals = {
  modal: Modal,
  mobileModal: MobileModal,
  cart: CartModal,
  search: SearchModal,
  response: ResponseModal,
  login: LoginModal,
  address: AddressModal,
  confirm: ConfirmModal,
  confirmation: NewConfirmModal,
  image: ImageModal,
  appointment: AppointmentModal,
  swatch: SwatchModal,
  subscription: SubscriptionModal,
  calendar: CalendarModal,
  countrySelect: CountrySelectModal,
  freeSwatches: FreeSwatchesModal,
  container: ContainerModal,
  prompt: PromptModal,
  textModal: TextModal,
  discount: DiscountModal,
  homeowners: HomeownersModal,
  lltNotify: LLTNotifyMobileModal,
  lltPopup: LLTPopupMobileModal,
  upgradeShippingMethods: UpgradeShippingMethods,
  deliveryServicesDetail: DeliveryServicesDetail,
  arModal: ARMobileModal,
  arErrorModal: ARErrorModal,
  afterpay: AfterpayModal,
};
