// import { Stack, Typography, AccordionDetails } from '@castlery/fortress';
// import { RefinementList, RangeInput } from 'react-instantsearch';
// import { NestedCategoriesRefinement } from './nested-categories-refinement';

// // Mapping of attribute names to display labels
// const attributeLabelMap: Record<string, string> = {
//   material: 'Material',
//   color: 'Color',
//   price: 'Price',
//   lead_time: 'Lead Time',
//   styles: 'Style',
//   product_type: 'Product Type',
//   bed_frame_size: 'Bed Frame Size',
//   tags: 'Featured',
//   categories: 'Category',
// };

// export function Facet({ attribute }: { attribute: string }) {
//   switch (attribute) {
//     // Attributes using RangeInput
//     case 'category':
//       return (
//         <Stack spacing={1}>
//           <NestedCategoriesRefinement />
//         </Stack>
//       );
//     case 'price':
//     case 'lead_time':
//       return (
//         <Stack spacing={1}>
//           <Typography level="subh3">{attributeLabelMap[attribute]}</Typography>
//           <RangeInput attribute={attribute === 'lead_time' ? 'variants.lead_time' : attribute} />
//         </Stack>
//       );

//     // Attributes using RefinementList
//     case 'material':
//     case 'color':
//     case 'styles':
//     case 'product_type':
//     case 'bed_frame_size':
//     case 'tags':
//       return (
//         <Stack spacing={1}>
//           <Typography level="subh3">{attributeLabelMap[attribute]}</Typography>
//           <RefinementList attribute={attribute} operator="or" limit={10} showMore={true} />
//         </Stack>
//       );

//     default:
//       return null;
//   }
// }
