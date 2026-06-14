export const folders = {
  US: 'room-builder',
  AU: 'room-builder-aus',
  SG: 'room-builder-sg',
  CA: 'room-builder-ca',
};

export const modularFolders = {
  US: `modular-configurator${__APPLICATION_ENV__.includes('test') ? '-test' : ''}`,
  AU: `modular-configurator-au${__APPLICATION_ENV__.includes('test') ? '-test' : ''}`,
  SG: `modular-configurator-sg${__APPLICATION_ENV__.includes('test') ? '-test' : ''}`,
  CA: `modular-configurator-ca${__APPLICATION_ENV__.includes('test') ? '-test' : ''}`,
  UK: `modular-configurator-uk${__APPLICATION_ENV__.includes('test') ? '-test' : ''}`,
};

export const retailer = 'castlery';
