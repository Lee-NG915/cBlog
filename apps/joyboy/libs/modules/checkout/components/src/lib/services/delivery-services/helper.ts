import type { AvailableServiceProduct, SelectedServiceProduct } from '@castlery/types';

export interface ResetSelectedService extends SelectedServiceProduct {
  size?: string;
}
export interface getServiceDescFunc {
  (service: AvailableServiceProduct, selectedServices: ResetSelectedService[]): string;
}

export const getServiceDesc: getServiceDescFunc = (service, selectedServices) => {
  let desc = '';
  if (!service || selectedServices.length <= 0) return desc;
  const selectedCarryUps = selectedServices.filter((item) => item.type === 'carry_up');
  const hasSelectedCarryUp = selectedCarryUps.length > 0;
  if (service.type === 'carry_up' && hasSelectedCarryUp) {
    const { custom_attributes, price } = selectedCarryUps[0];
    const { number_of_items = 0, number_of_stories = 0 } = custom_attributes as {
      number_of_stories?: number;
      number_of_items?: number;
    };
    let storyDesc = '';
    let itemsDesc = '';
    let priceDesc = '';
    if (number_of_stories) {
      storyDesc = `${number_of_stories} x ${number_of_stories > 1 ? 'Storeys' : 'Storey'}`;
    }
    if (number_of_items) {
      itemsDesc = `, ${number_of_items} x ${number_of_items > 1 ? 'Items' : 'Item'}`;
    }
    priceDesc =
      price && number_of_items && number_of_stories ? `: $${number_of_items * number_of_stories * price}` : '';
    desc = `${storyDesc}${itemsDesc}${priceDesc}`;
  }
  const hsaSelectedDisposal = selectedServices?.some((item) => item.type === 'disposal');
  if (service.type === 'disposal' && hsaSelectedDisposal) {
    const selectedServiceTotal = selectedServices
      ?.filter((item) => item.type === 'disposal')
      ?.reduce(
        (acc, cur) => {
          acc.total += parseInt(cur.price * cur.quantity);
          acc.items.push(`${cur.quantity} x ${cur.name}`);
          return acc;
        },
        { total: 0, items: [] }
      );
    if (selectedServiceTotal.total) {
      desc = `${selectedServiceTotal.items.join(', ')}: $${selectedServiceTotal.total}`;
    } else {
      desc = `${selectedServiceTotal.items.join(', ')}`;
    }
  }

  return desc;
};
