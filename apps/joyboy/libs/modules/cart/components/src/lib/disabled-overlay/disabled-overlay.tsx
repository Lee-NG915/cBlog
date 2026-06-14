import { Box } from '@castlery/fortress';

export interface DisabledOverlayProps {
  light?: boolean;
}

export const DisabledOverlay = ({ light = true }: DisabledOverlayProps) => (
  <Box
    sx={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: light ? 'rgba(255,255,255, 0.5)' : 'rgba(0,0,0,0.5)',
      zIndex: 10,
      left: 0,
      top: 0,
    }}
  />
);

export default DisabledOverlay;
