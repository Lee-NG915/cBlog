const list = [
  [2, 21],
  [30, 22, 1],
  [9, 1],
];

/**
 * Merge the subarrays of a two-dimensional array to return an ordered one-dimensional array
 * Suppose A B C denotes a subarray in a two-dimensional array,
 * and `A1` denotes the 1st element of the array A
 * The order is: `A1` `B1` `C1` `A2` `B2` `C2`
 * In the case that `B2` is the same as the previous element, jump to `B3` until a different element is found
 * For example, suppose `B2` == `A1` , `B3` == `C1`, then the return order should be `A1` `B1` `C1` `A2` `B4` `C2`
 *
 * ![img](https://s2.loli.net/2023/03/09/rnpoxP4Kuh1w9ls.png)
 * @param {Array<Array<any>>} list - The list of sublists
 * @param {Function} keyItem - The function used to retrieve the key item used for sorting.
 * @returns {Array<any>} - The list of non-duplicate elements
 */

function mergeSort(list, keyItem) {
  const set = new Set();

  const result = []; // Get the maximum length of any sublist in the array
  const maxLength = Math.max(...list.map((sublist) => sublist.length));

  // Loop over each index up to the maximum length
  for (let i = 0; i < maxLength; i++) {
    // Loop over each sublist in the array
    for (let j = 0; j < list.length; j++) {
      let k = i;
      const sublist = list[j];

      // Check if the sublist has an element at the current index
      if (k < sublist.length) {
        while (k < sublist.length && set.has(keyItem(sublist[k]))) {
          k += 1;
        }
        if (!(k < sublist.length)) continue;
        if (set.has(keyItem(sublist[k]))) {
          continue;
        }
        result.push(sublist[k]);
        set.add(keyItem(sublist[k]));
      }
    }
  } // Output the result
  return result;
}

const xxx = mergeSort(list, (item) => item);
// [ 2, 30, 9, 21, 22, 1 ]
console.log(`==============>xxx`);
console.log(xxx);

const ugcList = [
  [
    {
      ugc_id: 2,
    },
    {
      ugc_id: 21,
    },
  ],
  [
    {
      ugc_id: 30,
    },
    {
      ugc_id: 22,
    },
    {
      ugc_id: 1,
    },
  ],
  [
    {
      ugc_id: 9,
    },

    {
      ugc_id: 1,
    },
  ],
];

const yyy = mergeSort(ugcList, (item) => item.ugc_id);
// .map(({ ugc_id }) => ugc_id);
console.log(`==============>yyy`);
console.log(yyy);
// const ugcList = [
//   [
//     {
//       ugc_id: 8,
//       author: 'table',
//       variant_ids: [574],
//       asset_url:
//         'https://res.cloudinary.com/castlery/image/private/v1679026420/crusader-test/ugc/aldlddshnfiudsfh%20fbdshfbhisdja/5-1679026419.jpg',
//       caption: 'table',
//       source: 'instagram',
//       file_type: 'image',
//     },
//     {
//       ugc_id: 7,
//       author: 'table',
//       variant_ids: [574],
//       asset_url: 'https://res.cloudinary.com/castlery/image/private/v1679025566/crusader-test/ugc/123/4-1679025565.jpg',
//       caption: 'table',
//       source: 'instagram',
//       file_type: 'image',
//     },
//     {
//       ugc_id: 10,
//       author: 'table',
//       variant_ids: [17341],
//       asset_url:
//         'https://res.cloudinary.com/castlery/image/private/v1679034923/crusader-test/ugc/table/Brighton-Oval-Dining-Table-Lifestyle-Crop-1653877121-1679034921.jpg',
//       caption: '123',
//       source: 'instagram',
//       file_type: 'image',
//     },
//     {
//       ugc_id: 9,
//       author: 'table category',
//       variant_ids: [3053, 486],
//       asset_url:
//         'https://res.cloudinary.com/castlery/image/private/v1679026606/crusader-test/ugc/aldlddshnfiudsfh%20fbdshfbhisdja/k8s%E8%AF%BE%E7%A8%8B%E5%9C%B0%E5%9B%BE-1679026604.webp',
//       caption: 'sdfdsf',
//       source: 'instagram',
//       file_type: 'image',
//     },
//     {
//       ugc_id: 11,
//       author: 'global',
//       variant_ids: [],
//       asset_url:
//         'https://res.cloudinary.com/castlery/image/private/v1679035223/crusader-test/ugc/global/Brighton-Oval-Dining-Table-_Det_6-1679035222.jpg',
//       caption: 'fd',
//       source: 'instagram',
//       file_type: 'image',
//     },
//   ],
//   [
//     {
//       ugc_id: 3,
//       author: 'ee',
//       variant_ids: [10850, 17338, 425, 19700],
//       asset_url:
//         'https://res.cloudinary.com/castlery/video/private/v1679021267/crusader-test/ugc/ee/video-20220706-115917-34c3cbf7-1679021265.mp4',
//       caption: "<script>\r\nalert('sdfsdfdsaf')\r\n</script>",
//       source: 'pinterest',
//       file_type: 'video',
//     },
//     {
//       ugc_id: 6,
//       author: 'chair1',
//       variant_ids: [19700, 10850],
//       asset_url:
//         'https://res.cloudinary.com/castlery/image/private/v1679024029/crusader-test/ugc/aldlddshnfiudsfh%20fbdshfbhisdja/3-1679024028.webp',
//       caption:
//         'A table is a type of data visualization tool that presents information in a structured format, typically consisting of rows and columns. Tables are commonly used to organize and display data in a way that allows for easy comparison and analysis. They can be used to present numerical data, text data, or a combination of both. Tables are often used in business, research, and academic settings to communicate important information to a variety of audiences. \r\n\r\nThey can be created using a variety of software programs and can be customized to fit specific formatting and design requirements. Overall, tables are an effective and versatile tool for presenting data in a clear and organized manner.',
//       source: 'instagram',
//       file_type: 'image',
//     },
//     {
//       ugc_id: 5,
//       author: 'chair1',
//       variant_ids: [19700, 10850],
//       asset_url:
//         'https://res.cloudinary.com/castlery/image/private/v1679023950/crusader-test/ugc/1/Luka-Cabinate-Dim-US-1655216783-1679023949.webp',
//       caption: '1',
//       source: 'instagram',
//       file_type: 'image',
//     },
//     {
//       ugc_id: 4,
//       author: 'chair1+chair2',
//       variant_ids: [17338, 19700, 10850],
//       asset_url: 'https://res.cloudinary.com/castlery/image/private/v1679021509/crusader-test/ugc/ee/3-1679021508.webp',
//       caption: '<h1>hi</h1>\r\n<script>\r\n<alert>ssdfdsfdsfdsfds</alert>\r\n</script>',
//       source: 'instagram',
//       file_type: 'image',
//     },
//     {
//       ugc_id: 2,
//       author: 'chair2',
//       variant_ids: [17338],
//       asset_url:
//         'https://res.cloudinary.com/castlery/image/private/v1679021221/crusader-test/ugc/e/IMG_4287-1679021219.heic',
//       caption: 'e',
//       source: 'instagram',
//       file_type: 'image',
//     },
//     {
//       ugc_id: 11,
//       author: 'global',
//       variant_ids: [],
//       asset_url:
//         'https://res.cloudinary.com/castlery/image/private/v1679035223/crusader-test/ugc/global/Brighton-Oval-Dining-Table-_Det_6-1679035222.jpg',
//       caption: 'fd',
//       source: 'instagram',
//       file_type: 'image',
//     },
//   ],
//   [
//     {
//       ugc_id: 3,
//       author: 'ee',
//       variant_ids: [10850, 17338, 425, 19700],
//       asset_url:
//         'https://res.cloudinary.com/castlery/video/private/v1679021267/crusader-test/ugc/ee/video-20220706-115917-34c3cbf7-1679021265.mp4',
//       caption: "<script>\r\nalert('sdfsdfdsaf')\r\n</script>",
//       source: 'pinterest',
//       file_type: 'video',
//     },
//     {
//       ugc_id: 2,
//       author: 'chair2',
//       variant_ids: [17338],
//       asset_url:
//         'https://res.cloudinary.com/castlery/image/private/v1679021221/crusader-test/ugc/e/IMG_4287-1679021219.heic',
//       caption: 'e',
//       source: 'instagram',
//       file_type: 'image',
//     },
//     {
//       ugc_id: 4,
//       author: 'chair1+chair2',
//       variant_ids: [17338, 19700, 10850],
//       asset_url: 'https://res.cloudinary.com/castlery/image/private/v1679021509/crusader-test/ugc/ee/3-1679021508.webp',
//       caption: '<h1>hi</h1>\r\n<script>\r\n<alert>ssdfdsfdsfdsfds</alert>\r\n</script>',
//       source: 'instagram',
//       file_type: 'image',
//     },
//     {
//       ugc_id: 5,
//       author: 'chair1',
//       variant_ids: [19700, 10850],
//       asset_url:
//         'https://res.cloudinary.com/castlery/image/private/v1679023950/crusader-test/ugc/1/Luka-Cabinate-Dim-US-1655216783-1679023949.webp',
//       caption: '1',
//       source: 'instagram',
//       file_type: 'image',
//     },
//     {
//       ugc_id: 6,
//       author: 'chair1',
//       variant_ids: [19700, 10850],
//       asset_url:
//         'https://res.cloudinary.com/castlery/image/private/v1679024029/crusader-test/ugc/aldlddshnfiudsfh%20fbdshfbhisdja/3-1679024028.webp',
//       caption:
//         'A table is a type of data visualization tool that presents information in a structured format, typically consisting of rows and columns. Tables are commonly used to organize and display data in a way that allows for easy comparison and analysis. They can be used to present numerical data, text data, or a combination of both. Tables are often used in business, research, and academic settings to communicate important information to a variety of audiences. \r\n\r\nThey can be created using a variety of software programs and can be customized to fit specific formatting and design requirements. Overall, tables are an effective and versatile tool for presenting data in a clear and organized manner.',
//       source: 'instagram',
//       file_type: 'image',
//     },
//     {
//       ugc_id: 11,
//       author: 'global',
//       variant_ids: [],
//       asset_url:
//         'https://res.cloudinary.com/castlery/image/private/v1679035223/crusader-test/ugc/global/Brighton-Oval-Dining-Table-_Det_6-1679035222.jpg',
//       caption: 'fd',
//       source: 'instagram',
//       file_type: 'image',
//     },
//   ],
// ];

// const yyy = mergeSort(ugcList, (item) => item.ugc_id).map((value) => value.ugc_id);
// // .map(({ ugc_id }) => ugc_id);
// console.log(`==============>yyy`);
// console.log(yyy);
