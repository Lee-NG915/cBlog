const { ScalableBloomFilter } = require('bloom-filters');
const { writeFileSync } = require('fs');
const path = require('path');
const redirects = require('../public/redirects/new-redirects.json');

const filter = new ScalableBloomFilter(Object.keys(redirects).length, 0.0001);

for (const key in redirects) {
  filter.add(key);
}

const dirPath = path.join(__dirname, '../public/redirects');

const filterJson = filter.saveAsJSON();
writeFileSync(path.join(dirPath, 'bloom-filter.json'), JSON.stringify(filterJson));
