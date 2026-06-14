import { RichText } from '@castlery/shared-components';
import { SERVICE_LINK } from './service-link';

export const DELIVERY_DATA = {
  title: 'Eco delivery',
  description: 'Lower-emission shipping, in partnership with Maersk.',
  guideLinkRichText: <RichText content={`<a href=${SERVICE_LINK.delivery} target="_blank">Terms & Conditions</a> apply`} />,
};

export const WARRANTY_DATA = {
  title: 'Up to 10-yr. warranty',
  description: 'On select sofas, beds, and more; up to one year on everything else.',
  guideLinkRichText: <RichText content={`<a href=${SERVICE_LINK.warranty} target="_blank">Terms & Conditions</a> apply`} />,
};

export const RETURN_DATA = {
  title: '30-day returns',
  description: 'Hassle-free, when you initiate a request within 30 days of delivery.',
  guideLinkRichText: <RichText content={`See our full <a href=${SERVICE_LINK.salesAndRefunds} target="_blank">Return Policy</a>`} />,
};

export const FUNDING_DATA = {
  title: '14-day price protection',
  description: 'Value of difference will be accounted for if the price changes.',
  guideLinkRichText: <RichText content={`<a href=${SERVICE_LINK.salesAndRefunds} target="_blank">Terms & Conditions</a> apply`} />,
};

export const CONFIG= {
    DELIVERY_DATA,
    WARRANTY_DATA,
    RETURN_DATA,
    FUNDING_DATA,
}

export default CONFIG;