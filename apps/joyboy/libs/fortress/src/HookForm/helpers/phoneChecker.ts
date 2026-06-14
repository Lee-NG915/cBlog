// import { messageMap } from '../config';

// export const phoneChecker = {
//   phoneSG: (value: any) => {
//     if (!value) {
//       return messageMap.get('phone');
//     }
//     ///^(?:\+65|65)?[689]\d{7}$/
//     if (value?.length <= 8) {
//       const reg = /^[689]\d{7}$/g;
//       return reg.test(value) || messageMap.get('phone');
//     } else {
//       const reg = /^(\+65|65)[689]\d{7}/g;
//       return reg.test(value) || messageMap.get('phone');
//     }
//   },
// };
