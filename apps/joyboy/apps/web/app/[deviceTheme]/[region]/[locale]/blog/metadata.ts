import { EcEnv } from '@castlery/config';
import { createMetadata } from '@castlery/seo';

const keywords = {
  sg: 'furniture Singapore, online furniture Singapore, furniture shop Singapore, furniture stores Singapore, furniture in Singapore, modern furniture Singapore, furniture SG, furniture, Castlery, Singapore',
  us: 'furniture United States, online furniture United States, furniture shop United States, furniture stores United States, furniture in United States, modern furniture United States, furniture US, furniture, Castlery, United States',
  au: 'furniture Australia, online furniture Australia, furniture Sydney, furniture Melbourne, furniture shop Australia, furniture stores Australia, furniture in Australia, modern furniture Australia, furniture AU, furniture, Castlery',
  ca: 'furniture Canada, online furniture Canada, furniture shop Canada, furniture stores Canada, furniture in Canada, modern furniture Canada, furniture CA, furniture, Castlery, Canada',
  uk: 'furniture United Kingdom, online furniture United Kingdom, furniture shop United Kingdom, furniture stores United Kingdom, furniture in United Kingdom, modern furniture United Kingdom, furniture UK, furniture, Castlery, United Kingdom',
};
export async function generateMetadata() {
  return await createMetadata({
    robots: {
      index: true,
    },
    title: `Blog`,
    description:
      'Read our blog for furniture styling tips and tricks, guides for proper cleaning and maintenance, and important factors to consider when shopping for your home.',
    keywords: keywords[EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase() as keyof typeof keywords],
  });
}
