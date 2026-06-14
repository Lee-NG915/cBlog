import { Typography, Box, Button, Tooltip, SvgIconProps, useBreakpoints } from '@castlery/fortress';
import { Info } from '@castlery/fortress/Icons';

/* eslint-disable-next-line */
export interface InfoButtonProps {
  tooltipTitle: string;
  placement?:
    | 'bottom'
    | 'left'
    | 'right'
    | 'top'
    | 'bottom-end'
    | 'bottom-start'
    | 'left-end'
    | 'left-start'
    | 'right-end'
    | 'right-start'
    | 'top-end'
    | 'top-start'
    | undefined;
  innerStyle: SvgIconProps;
  onClick?: () => void;
}

export function InfoButton(props: InfoButtonProps) {
  const { tooltipTitle, innerStyle, placement, onClick } = props;
  const { desktop } = useBreakpoints();
  if (!desktop) {
    return (
      <Button
        sx={{
          boxSizing: 'border-box',
          padding: 0,
          backgroundColor: 'transparent',
          minHeight: '0 !important',
          '&:hover': {
            background: 'white',
          },
        }}
        onClick={() => {
          if (onClick) {
            onClick();
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Info {...innerStyle} />
        </Box>
      </Button>
    );
  }
  return (
    <Button
      sx={{
        boxSizing: 'border-box',
        padding: 0,
        backgroundColor: 'transparent',
        minHeight: '0 !important',
        color: (theme: any) => theme.palette.brand.charcoal[300],
        '&:hover': {
          background: 'white',
        },
      }}
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
    >
      <Tooltip
        sx={{
          background: 'white',
          padding: 0,
          width: 'min(315,100vw)',
          border: 'none',
          '&:hover': {
            background: 'white',
          },
        }}
        title={
          <Typography
            sx={{
              position: 'relative',
              fontSize: '14px',
              backgroundColor: '#000',
              color: '#fff',
              padding: '0 16px',
              borderRadius: '4px',
              '&::before': {
                position: 'absolute',
                content: '""',
                display: 'inline-block',
                width: 0,
                height: 0,
                top: '50%',
                left: 0,
                transform: 'translate3d(-50%, -50%, 0)',
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderRight: '10px solid #000',
              },
            }}
          >
            {tooltipTitle}
          </Typography>
        }
        placement={placement}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Info {...innerStyle} />
        </Box>
      </Tooltip>
    </Button>
  );
}

export default InfoButton;
