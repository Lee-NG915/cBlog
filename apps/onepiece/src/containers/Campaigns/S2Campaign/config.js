import React from 'react';
import { getUserDevice } from 'utils/device';

const device = getUserDevice() || 'desktop';
export const events = [
  {
    image_small:
      '/v1681872305/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/4_MorningRhythmYoga_Mobile.jpg',
    image_large:
      '/v1681872305/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/4_MorningRhythmYoga_Desktop.jpg',
    name: 'Morning Rhythm Yoga',
    description:
      'Start your day right. Awaken your senses as our wellness advocate, Jacyln, takes you through the practice of being present.',
    joint_name: `Includes a Castlery x Van Gogh:${
      device !== 'desktop' ? '<br />' : ''
    } The Immersive Experience yoga mat`,
  },
  {
    image_small:
      '/v1682428310/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/5_SilentBreakfast_Mobile.jpg',
    image_large:
      '/v1682428310/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/5_SilentBreakfast_Desktop.jpg',
    name: 'Silent Breakfast',
    description:
      "Over a breakfast spread, spend a quiet moment to bring attention to what's on your mind. Amidst the chaos of life, shift your attention to what you're grateful for.",
  },
  {
    image_small:
      '/v1682428317/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/6_MindfulConversations_Mobile.jpg',
    image_large:
      '/v1682428317/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/6_MindfulConversations_Desktop.jpg',
    name: 'Mindful Conversations',
    description:
      'Through this workshop, discover the tangible benefits that practicing mindfulness and gratitude can have on your perspective on life.',
  },
  {
    image_small:
      '/v1683168832/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/Fonts/Journalling_Workshop_Mobile.jpg',
    image_large:
      '/v1683168832/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/Fonts/Journalling_Workshop_Desktop.jpg',
    name: 'Journalling Workshop',
    description:
      "Looking back on the reflections you've gathered this morning, use the prompts provided to guide you as you pen your thoughts on paper.",
  },
];

export const timetable = {
  header: [{ colSpan: 2, text: 'Morning of Mindfulness Programme' }],
  body: [
    ['8am', 'Registration'],
    ['8.10am', 'Morning Rhythm Yoga'],
    ['9am', 'Silent Breakfast'],
    ['9.45am', 'Mindful Conversations'],
    ['10.45am', 'Journalling Workshop'],
    ['11.30am', 'End'],
  ],
};

export const groups = [
  {
    bannerMobileImage:
      '/v1681872268/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/1_SeekingRhythm_Mobile.jpg',
    bannerDesktopImage:
      '/v1681872269/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/1_SeekingRhythm_Desktop.jpg',
    backgroundVideo:
      '/v1681872270/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/1_SeekingRhythm_Curtain',
    title: 'Seeking Rhythm',
    titleMobileImage:
      '/v1682218421/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/Fonts/Seeking_Rhythm_Mobile.png',
    titleDesktopImage:
      '/v1682218421/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/Fonts/Seeking_Rhythm_Desktop.png',
    description:
      "Life's challenges can come in many forms. Find the momentum to get through these storms, with practices like yoga that can be done from home.",
    direction: 'left',
    recommendation: 'Mindfulness Rec 1',
  },
  {
    bannerMobileImage:
      '/v1681872268/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/2_ResetandUnwind_Mobile.jpg',
    bannerDesktopImage:
      '/v1681872269/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/2_ResetandUnwind_Desktop.jpg',
    backgroundVideo:
      '/v1681872271/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/2_ResetandUnwind_Plant',
    title: 'Reset & Unwind',
    titleMobileImage:
      '/v1682218421/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/Fonts/Reset_Unwind_Mobile.png',
    titleDesktopImage:
      '/v1682218421/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/Fonts/Reset_Unwind_Desktop.png',
    description:
      'Step back from daily stressors in a space where you can recharge. Let your thoughts and worries go by penning them down in a journal.',
    direction: 'right',
    recommendation: 'Mindfulness Rec 2',
  },
  {
    bannerMobileImage:
      '/v1681872268/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/3_BeingintheMoment_Mobile.jpg',
    bannerDesktopImage:
      '/v1681872269/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/3_BeingintheMoment_Desktop.jpg',
    backgroundVideo:
      '/v1681872271/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/3_BeingInTheMoment_Linen',
    title: 'Being in the Moment',
    titleMobileImage:
      '/v1682218420/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/Fonts/Being_in_the_Moment_Mobile.png',
    titleDesktopImage:
      '/v1682218421/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/Fonts/Being_in_the_Moment_Desktop.png',
    description:
      'Changes to your environment can disrupt your inner peace. Grab a book or indulge in good company to bring your focus back to the present.',
    direction: 'left',
    recommendation: 'Mindfulness Rec 3',
  },
];
