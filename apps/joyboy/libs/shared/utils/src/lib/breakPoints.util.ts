export const BREAKPOINTS: {
  [key: string]: number;
} = {
  // xs: 0,
  // sm: 544,
  // md: 768,
  // lg: 992,
  // xl: 1200,
  // xsl: 1340,
  // xxl: 1500,
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

export const CONTAINER_WIDTH: {
  [key: string]: number;
} = {
  sm: 576,
  md: 720,
  lg: 962,
  xl: 1170,
  xsl: 1310,
  xxl: 1470,
};

export const BREAKPOINTS_FINAL = new Map([
  [280, 'mini'],
  [420, 'small'],
  [560, 'mini_x2'],
  [750, 'medium'],
  [840, 'small_x2'],
  [1000, 'large'],
  [1500, 'medium_x2'],
  [1995, 'large_x2'],
]);

export const RESPONSIVE_BREAKPOINTS: {
  [key: string]: string;
} = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  mobile: 'mobile',
  tablet: 'tablet',
  desktop: 'desktop',
};
