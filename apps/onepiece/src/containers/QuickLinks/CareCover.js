import React from 'react';
import { getUrl } from 'pages';
import Template from './Components/Template';
import image from './images/accident-protection-plan.jpg';

export default (props) => {
  const banner = {
    image,
    title: 'Accident Protection Plan',
    subtitle: `Complimentary Care Cover Protection with any purchase of sofa from now till
      25 December. <a href="${__BASE_ROUTE__}/free-sofa-care-cover">Shop now!</a>`,
    // subtitle: 'We know life is full of accidents, that\'s why we offer you a Protection Plan to ' +
    //   'give you peace of mind from those unexpected mishaps!'
  };

  const content = [
    {
      title: 'What is the 5 Year Accident Protection Plan?',
      content: [
        `We know life is full of accidents, that's why we've teamed up with Care Cover to offer you a 5 Year
        Accident Protection Plan. This Protection Plan covers you against accidental damages and stains, so
        you can enjoy your new upholstered furniture in secure comfort.`,
        `When you purchase the Protection Plan you also receive a <a href="${__BASE_ROUTE__}${getUrl(
          'accident-protection-plan'
        )}"
        target="_blank" rel="noopener">Care Cover Care Kit</a> to help keep your upholstery looking its finest.`,
      ],
    },
    {
      title: 'How can I get the Protection Plan?',
      content: [
        `For online purchases, browse the assortment <a href="${__BASE_ROUTE__}${getUrl(
          'accident-protection-plan'
        )}" target="_blank"
        rel="noopener">here</a> and choose the Protection Plan best fit for your product (whether it be leather
        or fabric and 1 seater or 2-4 seater). If you are buying a sofa larger than 4 seats, simply buy two
        Protection Plans to cover you.`,
        `If you are buying in our Sydney Showroom just talk to our friendly staff about the Protection Plan options.`,
        `Once you have purchased the product simply go to <a href="https://carecoveraustralia.com.au"
        target="_blank" rel="noopener">carecoveraustralia.com.au</a> to register your Plan.`,
      ],
    },
    {
      title: 'What is covered with my Protection Plan?',
      content: [
        'Accidental Stains (Including but not limited to):',
        {
          type: 'list',
          content: [
            'drinks and food',
            'ballpoint pens',
            'markers and crayons',
            'nail polish and lipstick',
            'blood',
            'acids, bleach and corrosive marks',
            'cosmetics',
            'waxes, glues and paint',
            'chewing gum',
            'human bodily fluids',
            'pet bodily fluids',
          ],
        },
        'Accidental Damage (Including but not limited to):',
        {
          type: 'list',
          content: ['scratches', 'rips', 'scuffs', 'burns', 'pet damage (one incident only)'],
        },
      ],
    },
    {
      title: "What isn't covered with my Protection Plan?",
      content: [
        'Damage (Including but not limited to):',
        {
          type: 'list',
          content: [
            'acts of god',
            'dye transfer from other materials or clothing',
            'manufacturing faults',
            'rodents or insects',
            'general wear and tear',
            'damage accumulating over time. Only the most recent accident will be covered.',
            `issues such as peeling and cracking, tearing, pilling and fraying that arise due to the quality
            of the materials or failure to properly maintain the product.`,
            'damage caused during shipping and delivery',
            'a claim made against the manufacturer or an insurance company.',
            'pet damage (after first claim)',
          ],
        },
        `If your product is damaged when it arrives to you, please contact our <a href="${__BASE_ROUTE__}${getUrl(
          'contact-us'
        )}"
        target="_blank" rel="noopener">Customer Service</a>.`,
        `For full Cover Care terms & conditions <a href="https://carecoveraustralia.com.au/terms-and-conditions/"
        target="_blank" ref="noopener">click here</a>.`,
      ],
    },
    {
      title: 'Who are Care Cover?',
      content: [
        `Care Cover is an Australian owned and operated company in operation for over 20 years. Care Cover forms
        part of a group of companies and brands owned by Mobile Services International Pty Ltd.`,
        `Find out more about Care Cover <a href="http://www.carecoveraustralia.com.au/" target="_blank" rel="noopener">here</a>.`,
        `Any extra questions? Contact us <a href="${__BASE_ROUTE__}${getUrl(
          'contact-us'
        )}" target="_blank">here</a> or live chat with us below during our
        contact hours Mon-Wed, Fri: 9:30 am - 1:00 am, Thu: 9:30 am - 1:00 am, Sat, Sun: 10:00 am - 5:00 pm.`,
      ],
    },
  ];

  return <Template location={props.location} banner={banner} content={content} />;
};
