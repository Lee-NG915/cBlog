import { getConfigs } from 'utils/config';

const SELL_POINTS_CONFIGS = [
  {
    common: {
      link: 'feat',
      icon: 'usp-1',
      title: 'Collaboration with Award-Winning Designers',
    },
  },
  {
    common: {
      link: 'manufacturing-quality',
      icon: 'usp-2',
      title: 'Well-Made & Quality<br />Products',
    },
  },
  {
    common: {
      link: 'reviews',
      icon: 'usp-3',
      title: 'Trusted by 60,000+<br/>Customers',
    },
  },
  {
    AU: {
      icon: 'usp-4',
      title: 'Easy 14-Day<br />Return',
    },
    common: {
      link: 'sales-and-refunds',
      icon: 'usp-4-sg',
      title: 'Easy 30-Day<br />Returns',
    },
  },
];

export const SELL_POINTS = getConfigs(SELL_POINTS_CONFIGS);
