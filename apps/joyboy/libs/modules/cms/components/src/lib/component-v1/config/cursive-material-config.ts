const selectHeaderLevel = (headerLevel: string) => {
  switch (headerLevel) {
    case 'h1_cursive':
      return 'h1';
    case 'h2_cursive':
      return 'h2';
    case 'h1':
      return 'h1';
    case 'h2':
      return 'h2';
    default:
      return 'h1';
  }
};

const selectSubHeaderLevel = (subHeaderLevel: string) => {
  switch (subHeaderLevel) {
    case 'h2':
      return 'subh2';
    case 'h3':
      return 'subh3';
    case 'subh1':
      return 'subh1';
    case 'subh2':
      return 'subh2';
    case 'subh3':
      return 'subh3';
    default:
      return 'subh2';
  }
};

const selectFontFamily = (headerLevel: string) => {
  switch (headerLevel) {
    case 'h1_cursive':
      return 'var(--font-adelaila),var(--fortress-fontFamily-display)';
    case 'h2_cursive':
      return 'var(--font-adelaila),var(--fortress-fontFamily-display)';
    default:
      return 'var(--fortress-fontFamily-display)';
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const selectFontSize = (headerLevel: string, device: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  switch (headerLevel) {
    case 'h1':
      return 'var(--Typography-fontSize, var(--fortress-fontSize-xl4, 1.75rem))';
    case 'h2':
      return 'var(--Typography-fontSize, var(--fortress-fontSize-xl3, 1.5rem))';
    case 'h1_cursive':
      if (device === 'desktop') {
        return '3.875rem';
      }
      return '2.75rem';
    case 'h2_cursive':
      if (device === 'desktop') {
        return '3.5rem';
      }
      return '2.5rem';
    default:
      return 'var(--Typography-fontSize, var(--fortress-fontSize-xl4, 1.75rem))';
  }
};

export { selectHeaderLevel, selectFontFamily, selectFontSize, selectSubHeaderLevel };
