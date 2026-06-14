import React, { memo } from 'react';
import { Box, Typography, IconButton } from '@castlery/fortress';
import { Leaf, Info } from '@castlery/fortress/Icons';
import { FrameContext } from 'containers/Frame/FrameContext';
import { EVENT_CLICK_ECO_INFO_ICON } from 'utils/track/constants';
import { useDispatch } from 'react-redux';
import EcoDetail from './EcoContent';

interface EcoDeliveryTipProps {
  sx?: object;
}
const EcoDeliveryTip: React.FC<EcoDeliveryTipProps> = ({ sx = {} }) => {
  const frame = React.useContext(FrameContext);
  const dispatch = useDispatch();

  const handleOpen = () => {
    dispatch({ type: EVENT_CLICK_ECO_INFO_ICON });
    frame?.addModal(<EcoDetail close={() => frame?.removeModal()} />, 'side', {
      dismiss: () => frame.removeModal(),
      position: 'right',
      maxWidth: 500,
      showMask: true,
    });
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 1, ...sx }}>
      <Leaf sx={{ width: 16, height: 16, color: '#2e2e1c', mr: 0.5 }} />
      <Typography level="body2" textColor="#2e2e1c">
        Your order supports ECO Delivery
      </Typography>
      <IconButton
        onClick={handleOpen}
        sx={{
          // pX: '4px',
          // pY: '2px',
          ml: '4px',
          width: 24,
          height: 24,
          minWidth: 'auto',
          minHeight: 'auto',

          svg: {
            // color: 'red',
            path: {
              fill: '#2e2e1c',
            },
          },
        }}
      >
        <Info />
      </IconButton>
    </Box>
  );
};

export default memo(EcoDeliveryTip);
