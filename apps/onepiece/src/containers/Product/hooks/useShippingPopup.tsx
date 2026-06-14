import React from 'react';
import { ShippingPopup } from 'containers/Product/components/Shipping';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { FrameContext, type FrameContextType } from 'containers/Frame/FrameContext';

export interface ZipcodeRes {
  city: string;
  zipcode: string;
  state: string;
}
export interface UseShippingPopupProps {
  changeHandler: (data: ZipcodeRes, frame: FrameContextType | null) => Promise<void>;
}
export const useShippingPopup = ({ changeHandler }: UseShippingPopupProps) => {
  const { desktop } = useBreakpoints();
  const frame = React.useContext(FrameContext);

  const submitZipCode = async (data: ZipcodeRes) => await changeHandler(data, frame);

  const openZipSelection = () => {
    if (!desktop) {
      frame?.openModal(
        'mobileModal',
        {
          content: <ShippingPopup onSubmit={submitZipCode} useGooglePlace={false} />,
        },
        // @ts-ignore
        { height: 40, styleOverflow: 'initial' }
      );
    } else {
      // @ts-ignore
      frame?.addModal(<ShippingPopup onSubmit={submitZipCode} useGooglePlace={false} />, 'side', {
        // @ts-ignore
        dismiss: () => frame?.removeModal(),
        position: 'right',
        maxWidth: 500,
        showMask: true,
      });
    }
  };
  return [openZipSelection];
};
