import type { Meta } from '@storybook/react';
import { FortressImage, FortressImageProps } from './fortress-image';
import { Box } from '@castlery/fortress';

const meta: Meta<FortressImageProps> = {
  component: FortressImage,
  title: 'FortressImage',
};
export default meta;
// type Story = FortressImageProps;

export const Primary = {
  args: {
    src: '',
    alt: '',
    imageWidth: '',
    imageHeight: '',
    objectFit: '',
    ratio: 0,
    lazy: false,
  },
};

const src =
  'https://res.cloudinary.com/castlery/image/private/w_500,f_auto,q_auto/b_rgb:F3F3F3,c_fit/v1655432119/crusader/variants/50440781-MC4002/Hamilton-Round-Chaise-Sectional-Sofa-in-Brilliant-White-Square-Set_6-1655432117.jpg';
const alt = 'Hamilton Round Chaise Sectional Sofa 0';

// export const Heading: Story = {
//   args: {
//     src: '',
//     alt: '',
//     imageWidth: '',
//     imageHeight: '',
//     objectFit: '',
//     ratio: 0,
//     lazy: false,
//   },
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement);
//     expect(canvas.getByText(/Welcome to FortressImage!/gi)).toBeTruthy();
//   },
// };
export const noWidthHeight = (props: FortressImageProps) => {
  return (
    <Box
      sx={{
        width: '200px',
        height: '400px',
      }}
    >
      <FortressImage src={src} alt={alt} />
    </Box>
  );
};

export const noHeight = (props: FortressImageProps) => {
  return (
    <Box
      sx={
        {
          // width: '200px',
          // height: '400px',
        }
      }
    >
      <FortressImage src={src} alt={alt} imageWidth="200px" />
    </Box>
  );
};

export const noWidth = (props: FortressImageProps) => {
  return (
    <Box
      sx={
        {
          // width: '200px',
          // height: '400px',
        }
      }
    >
      <FortressImage src={src} alt={alt} imageHeight="400px" />
    </Box>
  );
};

export const widthHeight = (props: FortressImageProps) => {
  return (
    <Box
      sx={
        {
          // width: '200px',
          // height: '400px',
        }
      }
    >
      <FortressImage src={src} alt={alt} imageWidth="400px" imageHeight="600px" />
    </Box>
  );
};

export const noLazy = (props: FortressImageProps) => {
  return (
    <Box
      sx={
        {
          // width: '200px',
          // height: '400px',
        }
      }
    >
      <FortressImage src={src} alt={alt} imageWidth="400px" imageHeight="600px" lazy={false} />
    </Box>
  );
};

export const sizes = (props: FortressImageProps) => {
  return (
    <Box
      sx={
        {
          // width: '200px',
          // height: '400px',
        }
      }
    >
      <FortressImage src={src} alt={alt} imageWidth="400px" imageHeight="600px" sizes={'200px'} />
      <FortressImage src={src} alt={alt} imageWidth="400px" imageHeight="600px" sizes={['100px-md', '0.5']} />
    </Box>
  );
};
