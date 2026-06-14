/* eslint-disable camelcase */
/**
 *
 * @param {String} str eg: 9:328;12:284;15:353
 * @returns {Array}
 */
export function optionTypesStrToObj(str) {
  if (typeof str !== 'string') return str;
  return str.split(';').map((item) => {
    const [option_type_id, option_value_id] = item.split(':');
    return {
      option_type_id: +option_type_id,
      option_value_id: +option_value_id,
    };
  });
}

/**
 *
 * @param {Object} selected
 * @returns {String}
 */
export function selectedObjToStr(selected) {
  return Object.entries(selected)
    .sort((a, b) => a[0] - b[0])
    .map(([key, { id }]) => `${key}:${id}`)
    .join(';');
}
