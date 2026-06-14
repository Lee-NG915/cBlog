export const DELIVERY_SERVICES_CONFIG = {
  carry_up:
    'Carry upstairs service is mandatory for delivery to any location above ground floor without direct lift access.',
  disposal: 'Disposal service applies only to like-for-like items in the same product category. ',
};

export const ECO_DELIVERY_CONFIG = {
  contents: [
    {
      type: 'main',
      title: 'ECO Delivery — Partnership with Maersk',
      description:
        'We are committed to adopting low-GHG fuel options. To date, we have successfully reduced ocean freight emissions by 5,000 metric tons. Over the next decade, we aim to further reduce carbon emissions by at least 1,000 metric tons per year, in collaboration with Maersk.​',
    },
    {
      type: 'sub',
      title: 'What This Means for You',
      description:
        'Your Castlery order will support the transition to green fuels and reduce GHG emissions at no extra cost to you.',
    },
    {
      type: 'sub',
      title: 'How It Works',
      description:
        'For our shipments, Maersk replaces fossil fuels on its ships with green fuels* like green methanol or second-generation biodiesel based on waste feedstocks. The amount of carbon savings is calculated based on the energy used to move the containers, as reported by Maersk and verified by 3rd parties from Smart Freight Centre.',
    },
  ],
  imageUrl: 'https://res.cloudinary.com/castlery/image/upload/v1701139572/Onepiece/eco_delivery_2.png',
  link: {
    text: 'Read more about Maersk ECO Delivery',
    href: 'https://www.maersk.com/transportation-services/eco-delivery',
  },
  tip: 'Maersk defines ’green fuels’ as fuels with low (65-80%) to very low (80-95%) GHG emissions over their life cycle compared to fossil fuels',
};
