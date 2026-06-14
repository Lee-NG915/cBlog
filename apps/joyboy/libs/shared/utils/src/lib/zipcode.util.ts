export const zipcodeFormattingUtils = {
  SG: (value: string) => value,
  AU: (value: string) => value,
  US: (value: string) => value,
  CA: (value: string) => {
    if (!value) return value;
    const upperCaseValue = value.toUpperCase();
    const str = upperCaseValue.replace(/\s/g, '');
    const match = str.match(/^(\w{3})(\w{3})$/);
    if (match) {
      const str = `${match[1]} ${match[2]}`;
      return str;
    }
    return upperCaseValue;
  },
  UK: (value: string) => {
    if (!value) return '';
    const postcode = value.replace(/\s+/g, '').toUpperCase();
    if (postcode.length < 5 || postcode.length > 7) return postcode;
    // 拆分成前缀和后缀（后三位始终为后缀）
    const outward = postcode.slice(0, postcode.length - 3);
    const inward = postcode.slice(-3);
    return `${outward} ${inward}`;
  },
};
