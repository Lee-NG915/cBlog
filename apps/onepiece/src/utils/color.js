export function colorToImage(color) {
  return `https://d1qikdlbmwrjn6.cloudfront.net/knight-color-tone/${color}-tone.jpg`;
}

export function LightenDarkenColor(col, amt) {
  let usePound = false;
  let color = col;
  if (color[0] === '#') {
    color = color.slice(1);
    usePound = true;
  }

  const num = parseInt(color, 16);

  let r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  let b = ((num >> 8) & 0x00ff) + amt;

  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  let g = (num & 0x0000ff) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
}

export const ColorPalette = {
  primary: '#a45b37',
  complimentary: '#778379',
  'light-accent': '#dbcfb5',
  'dark-accent': '#c1af86',
  'light-neutral': '#fffdf9',
  'dark-neutral': '#323433',
  'black-font': '#000',
  white: '#fff',
  transparent: 'transparent',
};
