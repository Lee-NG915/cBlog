import { hostUrl } from 'config';

export const baseImgUrl = `https://res.cloudinary.com/castlery/image/upload/f_auto`;

export const intro = {
  title: 'Come Join Our Global Management Associate Programme!',
  desc: `Our Global Graduate Programme is a two-year flagship professional development program by Castlery, in partnership with Enterprise Singapore, aimed to grow all-rounded future leader and experts in our industry.

  Our programme is meticulously crafted to furnish you with a comprehensive perspective and an extensive, hands-on skill set. Immerse yourself in focused rotations within pertinent functions, tailored to your chosen career track, such as Product Strategy and Retail Excellence.

  But that's not all – exciting overseas assignments and enriching learning trips are on the horizon. Seize the chance to glean insights from our esteemed senior leaders and industry experts. This isn't just a programme; it's an odyssey of growth and learning.

  Calling all aspiring product strategists and enthusiasts of retail excellence! If you’re fuelled by a passion for reshaping the global furniture industry, then look no further – this program is tailor-made for you! Join us in bringing your vision to life and making your mark in the world of product strategy and retail. Your journey begins here!`,
};

export const customBreadcrumbs = [
  {
    name: 'Home',
    customUrl: hostUrl,
  },
  {
    name: 'Careers',
    customUrl: `${hostUrl}/careers`,
  },
  {
    name: 'Graduate programme',
    // customUrl: `${hostUrl}/careers/graduate-programme`,
  },
];

export const bannerDescription = `We believe that the world is your oyster, so what better way to figure out your career calling than to try your hand at different things?`;
