export const folders = {
  US: __APPLICATION_ENV__.includes('test') ? 'castlery-stickers-us-test' : 'room-builder',
  AU: __APPLICATION_ENV__.includes('test') ? 'castlery-stickers-au-test' : 'room-builder-aus',
  SG: __APPLICATION_ENV__.includes('test') ? 'castlery-stickers-sg-test' : 'room-builder-sg',
  CA: __APPLICATION_ENV__.includes('test') ? 'castlery-stickers-feed-ca-test' : 'room-builder-ca',
  UK: __APPLICATION_ENV__.includes('test') ? 'castlery-stickers-feed-uk-test' : 'room-builder-uk',
};

export const retailer = 'castlery';
