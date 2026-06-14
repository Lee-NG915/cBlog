import { EcEnv } from '@castlery/config';

export interface IdealVacationHomeConfiguration {
  index: number;
  pageType: string;
  subType?: string;
  questionIdList?: string[];
  questionType?: 'statement_pair' | 'agree_disagree' | 'sustainability_multi';
  title: {
    text: string;
    level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'subh1' | 'subh2' | 'subh3' | 'body1' | 'body2' | 'caption1' | 'caption2';
    styles: {
      color: string;
      fontSize: {
        desktop: string;
        mobile: string;
      };
    };
  };
  description: {
    text: string;
    level: 'body1' | 'body2' | 'caption1' | 'caption2';
    styles: {
      color: string;
      fontSize: {
        desktop: string;
        mobile: string;
      };
    };
  } | null;
  tips?: {
    text: string;
    position: 'left' | 'right' | 'center';
  };
  backgroundImage?: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
  illustration?: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
  nextAction: {
    elementType: string;
    text: string;
    styles: {
      backgroundColor: string;
      color: string;
      fontSize: {
        desktop: string;
        mobile: string;
      };
    };
    action: {
      type: 'goNext' | 'submit';
      payload: {
        index: number;
      };
    };
  };
  previousAction?: {
    elementType: string;
    text: string;
    styles: {
      backgroundColor: string;
      color: string;
      fontSize: {
        desktop: string;
        mobile: string;
      };
    };
    action: {
      type: 'goPrevious';
      payload: {
        index: number;
      };
    };
  };
  choices?: {
    id?: string;
    text?: string;
    lowest?: string;
    highest?: string;
    low?: string;
    high?: string;
    mid?: string;
    extraAction?: string;
  }[];
}

const EN_LANGUAGE =
  EcEnv.NEXT_PUBLIC_COUNTRY === 'SG' || EcEnv.NEXT_PUBLIC_COUNTRY === 'AU' || EcEnv.NEXT_PUBLIC_COUNTRY === 'UK';

export const idealVacationHomeConfiguration: IdealVacationHomeConfiguration[] = [
  {
    index: 0,
    pageType: 'landing-page',
    title: {
      text: 'What’s your ideal vacation home?',
      level: 'h1',
      styles: {
        color: '#F6F3E7',
        fontSize: {
          desktop: '72px',
          mobile: '36px',
        },
      },
    },
    description: {
      text: 'Ever wondered where you’d feel most at home on holiday? A few quick questions will reveal the vacation home that matches your personality — your ideal retreat is just a click away.',
      level: 'body1',
      styles: {
        color: '#F6F3E7',
        fontSize: {
          desktop: '18px',
          mobile: '16px',
        },
      },
    },
    backgroundImage: {
      desktop: 'https://res.cloudinary.com/castlery/image/upload/v1779939085/hardcode%20pages/quiz_main_desktop.jpg',
      tablet: 'https://res.cloudinary.com/castlery/image/upload/v1779939120/hardcode%20pages/quiz_main_mobile.jpg',
      mobile: 'https://res.cloudinary.com/castlery/image/upload/v1779939120/hardcode%20pages/quiz_main_mobile.jpg',
    },
    nextAction: {
      elementType: 'button',
      text: 'Take the quiz now',
      styles: {
        backgroundColor: '#D25C1B',
        color: '#F6F3E7',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goNext',
        payload: {
          index: 1,
        },
      },
    },
  },
  {
    index: 1,
    pageType: 'question-page',
    subType: 'single-choice',
    title: {
      text: 'You arrive at the airport and make your way to the gate. Boarding begins. You...',
      level: 'h3',
      styles: {
        color: '#844025',
        fontSize: {
          desktop: '28px',
          mobile: '20px',
        },
      },
    },
    description: null,
    illustration: {
      desktop: 'https://res.cloudinary.com/castlery/image/upload/v1779939260/hardcode%20pages/quiz_first_pic.png',
      tablet: 'https://res.cloudinary.com/castlery/image/upload/v1779939260/hardcode%20pages/quiz_first_pic.png',
      mobile: 'https://res.cloudinary.com/castlery/image/upload/v1779939260/hardcode%20pages/quiz_first_pic.png',
    },
    nextAction: {
      elementType: 'button',
      text: 'NEXT',
      styles: {
        backgroundColor: '#D25C1B',
        color: '#F6F3E7',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goNext',
        payload: {
          index: 2,
        },
      },
    },
    choices: [
      {
        text: 'Glide in early, snacks tucked away and everything in order',
      },
      {
        text: 'Walk in right on time, calm and entirely unbothered',
      },
      {
        text: 'Rush in at final call, iced latte still in hand',
      },
      {
        text: 'Pause to check the screens — wait, which gate is this again?',
      },
    ],
  },
  {
    index: 2,
    pageType: 'question-page',
    subType: 'single-choice',
    title: {
      text: 'You’re buckled in and it’s time for takeoff. As the plane reaches cruising altitude and the seatbelt sign flicks off, you...',
      level: 'h3',
      styles: {
        color: '#844025',
        fontSize: {
          desktop: '28px',
          mobile: '20px',
        },
      },
    },
    description: null,
    illustration: {
      desktop:
        'https://res.cloudinary.com/castlery/image/upload/v1779939337/hardcode%20pages/question-illustration-2-desktop.jpg',
      tablet:
        'https://res.cloudinary.com/castlery/image/upload/v1779939337/hardcode%20pages/question-illustration-2-desktop.jpg',
      mobile:
        'https://res.cloudinary.com/castlery/image/upload/v1779939337/hardcode%20pages/question-illustration-2-desktop.jpg',
    },
    previousAction: {
      elementType: 'button',
      text: 'BACK',
      styles: {
        backgroundColor: 'transparent',
        color: '#3C101E',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goPrevious',
        payload: {
          index: 1,
        },
      },
    },
    nextAction: {
      elementType: 'button',
      text: 'NEXT',
      styles: {
        backgroundColor: '#D25C1B',
        color: '#F6F3E7',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goNext',
        payload: {
          index: 3,
        },
      },
    },
    choices: [
      {
        text: 'Recline, headphones on, ready to switch off',
      },
      {
        text: 'Scroll through inspiration saved for this trip',
      },
      {
        text: 'Sort through photos, bookings, and places to see',
      },
      {
        text: 'Strike up a conversation with the person next to you',
      },
    ],
  },
  {
    index: 3,
    pageType: 'question-page',
    subType: 'rating-choice',
    questionIdList: ['X5_1', 'X5_3', 'X5_4', 'X5_5'],
    questionType: 'statement_pair',
    title: {
      text: 'As the clouds drift past your window, your thoughts wander home.',
      level: 'h3',
      styles: {
        color: '#844025',
        fontSize: {
          desktop: '28px',
          mobile: '20px',
        },
      },
    },
    description: {
      text: 'Your current home is...',
      level: 'body1',
      styles: {
        color: '#3C101E',
        fontSize: {
          desktop: '18px',
          mobile: '16px',
        },
      },
    },
    illustration: {
      desktop:
        'https://res.cloudinary.com/castlery/image/upload/v1779939365/hardcode%20pages/question-illustration-3-desktop.png',
      tablet:
        'https://res.cloudinary.com/castlery/image/upload/v1779939365/hardcode%20pages/question-illustration-3-desktop.png',
      mobile:
        'https://res.cloudinary.com/castlery/image/upload/v1779939365/hardcode%20pages/question-illustration-3-desktop.png',
    },
    previousAction: {
      elementType: 'button',
      text: 'BACK',
      styles: {
        backgroundColor: 'transparent',
        color: '#3C101E',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goPrevious',
        payload: {
          index: 2,
        },
      },
    },
    nextAction: {
      elementType: 'button',
      text: 'NEXT',
      styles: {
        backgroundColor: '#D25C1B',
        color: '#F6F3E7',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goNext',
        payload: {
          index: 4,
        },
      },
    },
    choices: [
      {
        lowest: 'A space to entertain and host people you know',
        highest: 'A space where you can retreat to',
      },
      {
        lowest: 'A space that reflects your personal style',
        highest: 'A space that is inspired by an existing trend',
      },
      {
        lowest: EN_LANGUAGE
          ? 'A space that prioritises visual aesthetics'
          : 'A space that prioritizes visual aesthetics',
        highest: EN_LANGUAGE ? 'A space that prioritises practicality' : 'A space that prioritizes practicality',
      },
      {
        lowest: 'A space you will live in for the next 5 years',
        highest: 'A space you may move out of within the next 5 years',
      },
    ],
  },
  {
    index: 4,
    pageType: 'question-page',
    subType: 'rating-choice',
    questionType: 'statement_pair',
    questionIdList: ['X16_2', 'X16_3'],
    title: {
      text: 'You land and step into town. First stop? A little retail therapy. You’re most likely to...',
      level: 'h3',
      styles: {
        color: '#844025',
        fontSize: {
          desktop: '28px',
          mobile: '20px',
        },
      },
    },
    description: null,
    illustration: {
      desktop:
        'https://res.cloudinary.com/castlery/image/upload/v1779939391/hardcode%20pages/question-illustration-4-desktop.png',
      tablet:
        'https://res.cloudinary.com/castlery/image/upload/v1779939391/hardcode%20pages/question-illustration-4-desktop.png',
      mobile:
        'https://res.cloudinary.com/castlery/image/upload/v1779939391/hardcode%20pages/question-illustration-4-desktop.png',
    },
    previousAction: {
      elementType: 'button',
      text: 'BACK',
      styles: {
        backgroundColor: 'transparent',
        color: '#3C101E',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goPrevious',
        payload: {
          index: 3,
        },
      },
    },
    nextAction: {
      elementType: 'button',
      text: 'NEXT',
      styles: {
        backgroundColor: '#D25C1B',
        color: '#F6F3E7',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goNext',
        payload: {
          index: 5,
        },
      },
    },
    choices: [
      {
        lowest: 'Pay for experience',
        highest: 'Pay for product',
      },
      {
        lowest: EN_LANGUAGE ? 'Prioritise saving for the future' : 'Prioritize saving for the future',
        highest: EN_LANGUAGE ? 'Prioritise living in the moment' : 'Prioritize living in the moment',
      },
    ],
  },
  {
    index: 5,
    pageType: 'question-page',
    subType: 'single-choice',
    title: {
      text: 'You wander into a shop you hadn’t planned to visit. What pulls you in?',
      level: 'h3',
      styles: {
        color: '#844025',
        fontSize: {
          desktop: '28px',
          mobile: '20px',
        },
      },
    },
    description: null,
    illustration: {
      desktop:
        'https://res.cloudinary.com/castlery/image/upload/v1779939521/hardcode%20pages/question-illustration-5-desktop.png',
      tablet:
        'https://res.cloudinary.com/castlery/image/upload/v1779939521/hardcode%20pages/question-illustration-5-desktop.png',
      mobile:
        'https://res.cloudinary.com/castlery/image/upload/v1779939521/hardcode%20pages/question-illustration-5-desktop.png',
    },
    previousAction: {
      elementType: 'button',
      text: 'BACK',
      styles: {
        backgroundColor: 'transparent',
        color: '#3C101E',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goPrevious',
        payload: {
          index: 4,
        },
      },
    },
    nextAction: {
      elementType: 'button',
      text: 'NEXT',
      styles: {
        backgroundColor: '#D25C1B',
        color: '#F6F3E7',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goNext',
        payload: {
          index: 6,
        },
      },
    },
    choices: [
      {
        text: 'You spot an item that feels instantly useful — you can see it fitting into your life',
      },
      {
        text: 'The story behind it pulls you right in',
      },
      {
        text: 'It feels fresh and different from anything you’ve seen before',
      },
      {
        text: 'It feels reassuringly familiar — very “you”',
      },
    ],
  },
  {
    index: 6,
    pageType: 'question-page',
    subType: 'rating-choice',
    questionType: 'statement_pair',
    questionIdList: ['X16_5'],
    title: {
      text: 'The shopkeeper shows you something new and intriguing. Your instinct is to...',
      level: 'h3',
      styles: {
        color: '#844025',
        fontSize: {
          desktop: '28px',
          mobile: '20px',
        },
      },
    },
    description: null,
    illustration: {
      desktop:
        'https://res.cloudinary.com/castlery/image/upload/v1779939553/hardcode%20pages/question-illustration-6-desktop.jpg',
      tablet:
        'https://res.cloudinary.com/castlery/image/upload/v1779939553/hardcode%20pages/question-illustration-6-desktop.jpg',
      mobile:
        'https://res.cloudinary.com/castlery/image/upload/v1779939553/hardcode%20pages/question-illustration-6-desktop.jpg',
    },
    previousAction: {
      elementType: 'button',
      text: 'BACK',
      styles: {
        backgroundColor: 'transparent',
        color: '#3C101E',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goPrevious',
        payload: {
          index: 5,
        },
      },
    },
    nextAction: {
      elementType: 'button',
      text: 'NEXT',
      styles: {
        backgroundColor: '#D25C1B',
        color: '#F6F3E7',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goNext',
        payload: {
          index: 7,
        },
      },
    },
    choices: [
      {
        lowest: 'Be the first to try out new technology / products',
        highest: 'Wait for reviews / subsequent updates',
      },
    ],
  },
  {
    index: 7,
    pageType: 'question-page',
    subType: 'single-choice',
    title: {
      text: 'You roll your luggage up to your accommodation. Just beside it, you notice a small space. It’s...',
      level: 'h3',
      styles: {
        color: '#844025',
        fontSize: {
          desktop: '28px',
          mobile: '20px',
        },
      },
    },
    description: null,
    illustration: {
      desktop:
        'https://res.cloudinary.com/castlery/image/upload/v1779939583/hardcode%20pages/question-illustration-7-desktop.png',
      tablet:
        'https://res.cloudinary.com/castlery/image/upload/v1779939583/hardcode%20pages/question-illustration-7-desktop.png',
      mobile:
        'https://res.cloudinary.com/castlery/image/upload/v1779939583/hardcode%20pages/question-illustration-7-desktop.png',
    },
    previousAction: {
      elementType: 'button',
      text: 'BACK',
      styles: {
        backgroundColor: 'transparent',
        color: '#3C101E',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goPrevious',
        payload: {
          index: 6,
        },
      },
    },
    nextAction: {
      elementType: 'button',
      text: 'NEXT',
      styles: {
        backgroundColor: '#D25C1B',
        color: '#F6F3E7',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goNext',
        payload: {
          index: 8,
        },
      },
    },
    choices: [
      {
        text: 'A weathered wooden deck overlooking a quiet lake',
      },
      {
        text: 'A charming café run by a local',
      },
      {
        text: 'A rooftop garden with a city skyline view',
      },
      {
        text: 'A welcoming bookstore, fireplace softly glowing',
      },
    ],
  },
  {
    index: 8,
    pageType: 'question-page',
    subType: 'rating-choice',
    questionType: 'agree_disagree',
    questionIdList: ['X15r1'],
    title: {
      text: 'You chose this place without overthinking — it simply felt right. You think about your own home, which you have furnished.',
      level: 'h3',
      styles: {
        color: '#844025',
        fontSize: {
          desktop: '28px',
          mobile: '20px',
        },
      },
    },
    description: null,
    tips: {
      text: '“I like to buy premium products and services”',
      position: 'center',
    },
    illustration: {
      desktop:
        'https://res.cloudinary.com/castlery/image/upload/v1779939607/hardcode%20pages/question-illustration-8-desktop.png',
      tablet:
        'https://res.cloudinary.com/castlery/image/upload/v1779939607/hardcode%20pages/question-illustration-8-desktop.png',
      mobile:
        'https://res.cloudinary.com/castlery/image/upload/v1779939607/hardcode%20pages/question-illustration-8-desktop.png',
    },
    previousAction: {
      elementType: 'button',
      text: 'BACK',
      styles: {
        backgroundColor: 'transparent',
        color: '#3C101E',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goPrevious',
        payload: {
          index: 7,
        },
      },
    },
    nextAction: {
      elementType: 'button',
      text: 'NEXT',
      styles: {
        backgroundColor: '#D25C1B',
        color: '#F6F3E7',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goNext',
        payload: {
          index: 9,
        },
      },
    },
    choices: [
      {
        lowest: 'Strongly disagree',
        low: 'Disagree',
        mid: 'Neither agree nor disagree',
        high: 'Agree',
        highest: 'Strongly agree',
      },
    ],
  },
  {
    index: 9,
    pageType: 'question-page',
    subType: 'rating-choice',
    questionType: 'agree_disagree',
    questionIdList: ['X15r6'],
    title: {
      text: 'Inside your vacation home, you run your hand across smooth walnut surfaces, finely crafted. The host says',
      level: 'h3',
      styles: {
        color: '#844025',
        fontSize: {
          desktop: '28px',
          mobile: '20px',
        },
      },
    },
    description: {
      text: 'You find yourself thinking about your own home, and you…',
      level: 'body1',
      styles: {
        color: '#3C101E',
        fontSize: {
          desktop: '18px',
          mobile: '16px',
        },
      },
    },
    tips: {
      text: '“Buying high-quality furniture is important to me”',
      position: 'center',
    },
    illustration: {
      desktop:
        'https://res.cloudinary.com/castlery/image/upload/v1779939635/hardcode%20pages/question-illustration-9-desktop.png',
      tablet:
        'https://res.cloudinary.com/castlery/image/upload/v1779939635/hardcode%20pages/question-illustration-9-desktop.png',
      mobile:
        'https://res.cloudinary.com/castlery/image/upload/v1779939635/hardcode%20pages/question-illustration-9-desktop.png',
    },
    previousAction: {
      elementType: 'button',
      text: 'BACK',
      styles: {
        backgroundColor: 'transparent',
        color: '#3C101E',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goPrevious',
        payload: {
          index: 8,
        },
      },
    },
    nextAction: {
      elementType: 'button',
      text: 'NEXT',
      styles: {
        backgroundColor: '#D25C1B',
        color: '#F6F3E7',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goNext',
        payload: {
          index: 10,
        },
      },
    },
    choices: [
      {
        lowest: 'Strongly disagree',
        low: 'Disagree',
        mid: 'Neither agree nor disagree',
        high: 'Agree',
        highest: 'Strongly agree',
      },
    ],
  },
  {
    index: 10,
    pageType: 'question-page',
    subType: 'multiple-choice',
    questionType: 'sustainability_multi',
    questionIdList: ['C8'],
    title: {
      text: 'Which of these sustainability features would you pay more for?',
      level: 'h3',
      styles: {
        color: '#844025',
        fontSize: {
          desktop: '28px',
          mobile: '20px',
        },
      },
    },
    description: null,
    illustration: {
      desktop:
        'https://res.cloudinary.com/castlery/image/upload/v1779939713/hardcode%20pages/question-illustration-11-desktop.jpg',
      tablet:
        'https://res.cloudinary.com/castlery/image/upload/v1779939713/hardcode%20pages/question-illustration-11-desktop.jpg',
      mobile:
        'https://res.cloudinary.com/castlery/image/upload/v1779939713/hardcode%20pages/question-illustration-11-desktop.jpg',
    },
    previousAction: {
      elementType: 'button',
      text: 'BACK',
      styles: {
        backgroundColor: 'transparent',
        color: '#3C101E',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goPrevious',
        payload: {
          index: 9,
        },
      },
    },
    nextAction: {
      elementType: 'button',
      text: 'NEXT',
      styles: {
        backgroundColor: '#D25C1B',
        color: '#F6F3E7',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goNext',
        payload: {
          index: 11,
        },
      },
    },
    choices: [
      {
        id: 'C8_1',
        text: 'Products designed to last longer',
      },
      {
        id: 'C8_2',
        text: 'Products made with responsibly sourced materials',
      },
      {
        id: 'C8_3',
        text: 'Products free of harmful chemicals',
      },
      {
        id: 'C8_4',
        text: 'Ethical manufacturing practices/fair trade products',
      },
      {
        id: 'C8_5',
        text: 'Sustainable product packaging',
      },
      {
        id: 'C8_6',
        text: 'Make a donation/plant a tree on your behalf with every purchase',
      },
      {
        id: 'C8_7',
        text: 'Circular initiatives (e.g. reduce, reuse, recycle)',
      },
      {
        id: 'C8_8',
        text: EN_LANGUAGE
          ? 'Product end-of-life disposal (e.g. trade in programme, responsible disposal)'
          : 'Product end-of-life disposal (e.g. trade in program, responsible disposal)',
      },
      {
        id: 'C8_9',
        text: EN_LANGUAGE
          ? 'Carbon-offset programme, eco-delivery options'
          : 'Carbon-offset program, eco-delivery options',
      },
      {
        id: 'C8_10',
        text: 'You will not pay extra for any of those',
        extraAction: 'set_independent',
      },
    ],
  },
  {
    index: 11,
    pageType: 'question-page',
    subType: 'single-choice',
    title: {
      text: 'As you pack up to leave, you take one last look around. Years from now, you hope your space will still feel...',
      level: 'h3',
      styles: {
        color: '#844025',
        fontSize: {
          desktop: '28px',
          mobile: '20px',
        },
      },
    },
    description: null,
    illustration: {
      desktop:
        'https://res.cloudinary.com/castlery/image/upload/v1779939686/hardcode%20pages/question-illustration-10-desktop.png',
      tablet:
        'https://res.cloudinary.com/castlery/image/upload/v1779939686/hardcode%20pages/question-illustration-10-desktop.png',
      mobile:
        'https://res.cloudinary.com/castlery/image/upload/v1779939686/hardcode%20pages/question-illustration-10-desktop.png',
    },
    previousAction: {
      elementType: 'button',
      text: 'BACK',
      styles: {
        backgroundColor: 'transparent',
        color: '#3C101E',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'goPrevious',
        payload: {
          index: 10,
        },
      },
    },
    nextAction: {
      elementType: 'button',
      text: 'SUBMIT',
      styles: {
        backgroundColor: '#D25C1B',
        color: '#F6F3E7',
        fontSize: {
          desktop: '14px',
          mobile: '12px',
        },
      },
      action: {
        type: 'submit',
        payload: {
          index: 12,
        },
      },
    },
    choices: [
      {
        text: 'Timeless and well cared for',
      },
      {
        text: 'Gently lived in, not worn down',
      },
      {
        text: 'Thoughtfully designed, not overdone',
      },
      {
        text: 'Ready to be passed on',
      },
    ],
  },
];
