const BREAKPOINTS = {
  xs: 0,
  sm: 544,
  md: 768,
  lg: 992,
  xl: 1200,
  xsl: 1340,
  xxl: 1500,
};

const CONTAINER_WIDTH = {
  sm: 576,
  md: 720,
  lg: 962,
  xl: 1170,
  xsl: 1310,
  xxl: 1470,
};

export function getBreakpoint(name, boundary) {
  if (BREAKPOINTS[name] === undefined) {
    console.error('please provide a valid breakpoint');
    return;
  }

  if (boundary === 'min') {
    return BREAKPOINTS[name];
  }

  const keys = Object.keys(BREAKPOINTS);
  return BREAKPOINTS[keys[keys.indexOf(name) + 1]] - 1;
}

export function getWidth(name) {
  if (CONTAINER_WIDTH[name] === undefined) {
    console.error('please provide a valid breakpoint');
    return 0;
  }
  return CONTAINER_WIDTH[name];
}

export function getBreakpointKeys() {
  return Object.keys(BREAKPOINTS);
}
