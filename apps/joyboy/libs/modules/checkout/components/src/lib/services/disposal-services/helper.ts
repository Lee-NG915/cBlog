import { EcEnv } from '@castlery/config';

export const TEXT = {
  description:
    'Disposal service applies only to like-for-like items in the same product category (e.g. Disposal of your old sofa during the delivery of your new sofa).',
  note: {
    title:
      'Note: Disposal service applies only to like-for-like items in the same product category (e.g. Disposal of your old sofa during the delivery of your new sofa). Please ensure that each item to be disposed:',
    descriptions:
      EcEnv.NEXT_PUBLIC_COUNTRY === 'SG'
        ? [
            'Can be dismantled with ease and fit in the lift',
            'Must be free from terminates, bed bugs or other living organisms',
            'Is not heavier than 80kg',
          ]
        : [
            'Can be dismantled with ease and fit in the elevator if required. Note: This does not include disassembly of items intended for disposal.',
            'Must be free from terminates, bed bugs or other living organisms',
            'Is not heavier than 175 pounds',
          ],
    explanation:
      'Castlery reserves the right to reject any unfit disposal item upon checking during collection and shall refund full sum of disposal fee within 14 business days.',
    help: 'If you are unsure of the type of disposal service you need to purchase beforehand, please contact our customer hotline at 3138 1999.',
  },
};
