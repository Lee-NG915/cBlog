import { globalFeatureInUS } from 'config';

export const sales = [
  {
    title: 'Living Room',
    url: `/new?category[0]=sofas&category[1]=chairs%2F${
      globalFeatureInUS ? 'armchairs-accent-chairs' : 'armchairs'
    }&category[2]=storage&category[3]=tables%2Fcoffee-tables&category[4]=tables%2Fside-tables&tags[0]=new`,
    image_small:
      '/v1677471413/S1%20Microsite%20Assets/Create%20Your%20Sanctuary%20Thumbnails/Owen-3-Seater-Sofa-Haze-Walnut-Set_2.jpg',
    image_large:
      '/v1677471413/S1%20Microsite%20Assets/Create%20Your%20Sanctuary%20Thumbnails/Owen-3-Seater-Sofa-Haze-Walnut-Set_2.jpg',
  },
  {
    title: 'Dining Room',
    url: '/new?category[0]=tables%2Fdining-tables&category[1]=chairs%2Fdining-chairs&tags[0]=new',
    image_small:
      '/v1677471413/S1%20Microsite%20Assets/Create%20Your%20Sanctuary%20Thumbnails/Sloane-Dining-Table-With-Dining-Bench-With-4-Cane-Chair-with-Armrest-Dune-Grey-Oak-Set_1.jpg',
    image_large:
      '/v1677471413/S1%20Microsite%20Assets/Create%20Your%20Sanctuary%20Thumbnails/Sloane-Dining-Table-With-Dining-Bench-With-4-Cane-Chair-with-Armrest-Dune-Grey-Oak-Set_1.jpg',
  },
  {
    title: 'Bedroom',
    url: '/new?category[0]=beds&tags[0]=new',
    image_small:
      '/v1677471413/S1%20Microsite%20Assets/Create%20Your%20Sanctuary%20Thumbnails/Dalton-Bed-Campaign-Set_10.jpg',
    image_large:
      '/v1677471413/S1%20Microsite%20Assets/Create%20Your%20Sanctuary%20Thumbnails/Dalton-Bed-Campaign-Set_10.jpg',
  },
  globalFeatureInUS && {
    title: 'Outdoor',
    url: '/new?category[0]=outdoor&tags[0]=new',
    image_small:
      '/v1677471413/S1%20Microsite%20Assets/Create%20Your%20Sanctuary%20Thumbnails/Malta-3-Seater-Sofa-With-Lounge-Chairs-With-Pedestal-Coffee-Table-Square-Set_2.jpg',
    image_large:
      '/v1677471413/S1%20Microsite%20Assets/Create%20Your%20Sanctuary%20Thumbnails/Malta-3-Seater-Sofa-With-Lounge-Chairs-With-Pedestal-Coffee-Table-Square-Set_2.jpg',
  },
].filter(Boolean);

// const testIds = [2330, 2310, 2470, 2341, 2402];
export const quizConfig = {
  'seeking-mindfulness': {
    title: 'Seeking Mindfulness',
    description:
      'Inhale, exhale. Need a release from the tension of the day? Settle down on comfy, generous seats, and get a good stretch in.',
    productsId: {
      SG: [5300, 5301, 5137, 5273, 5275],
      AU: [1713, 1714, 1541, 1686, 1688],
      US: [2788, 2789, 2644, 2756, 2758],
    },
    image_small: '/v1677636788/S1%20Microsite%20Assets/Quiz%20Results/Seeking%20Mindfulness_1.jpg',
    image_large: '/v1677636767/S1%20Microsite%20Assets/Quiz%20Results/Seeking%20Mindfulness_2.jpg',
  },
  'reset-unwind': {
    title: 'Reset & Unwind',
    description: `Clear your mind and seek comfort in a decluttered space. Once you’re all tidied up, settle into bed and be cocooned by ${
      globalFeatureInUS ? 'coziness' : 'cosiness'
    } as you unwind for the night.`,
    productsId: {
      SG: [5321, 5269, 4701],
      AU: [1726, 1682, 1128],
      US: [2803, 2752, 2180],
    },
    image_small: '/v1677472086/S1%20Microsite%20Assets/Quiz%20Results/Dalton-Bed-Campaign-Set_5.jpg',
    image_large: '/v1677472086/S1%20Microsite%20Assets/Quiz%20Results/Dalton-Bed-Campaign-Set_2.jpg',
  },
  'taking-in-the-view': globalFeatureInUS
    ? {
        title: 'Taking in the View',
        description:
          'Fresh air, birds chirping. Sit back on lounge-worthy seats as you immerse yourself in the positive energy boost from being in nature.',
        productsId: {
          US: [2780, 2781, 2783, 2782],
        },
        image_small: '/v1677472021/S1%20Microsite%20Assets/Quiz%20Results/Taking%20in%20the%20View_1.jpg',
        image_large: '/v1677472021/S1%20Microsite%20Assets/Quiz%20Results/Taking%20in%20the%20View_2.jpg',
      }
    : null,
  'hosting-a-meal': {
    title: 'Hosting a Meal',
    description:
      'Nothing beats quality time with the people who matter. Enjoy a meal with loved ones on performance fabric seats - so you’ll never have to let a wine spill hold you back from a good time.',
    productsId: {
      SG: [5287, 5286, 5293, 5318, 5271],
      AU: [1699, 1700, 1706, 1746, 1684],
      US: [2770, 2769, 2776, 2822, 2754],
    },
    image_small: '/v1677472133/S1%20Microsite%20Assets/Quiz%20Results/Hosting%20a%20Meal_2.jpg',
    image_large: '/v1677472133/S1%20Microsite%20Assets/Quiz%20Results/Hosting%20a%20Meal_1.jpg',
  },
};
