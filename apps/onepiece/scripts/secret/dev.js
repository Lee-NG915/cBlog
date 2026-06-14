const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

// The path is relative to the directory where the node command is executed.
const TEMPLATES_DIR = './etc/templates';
const TEMPLATE_PATH = path.join(TEMPLATES_DIR, 'env.ejs');
const OUTPUT_PATH = './.env';

// .env.us.json
const data = require(path.join(process.cwd(), '.env.us.json'));

function generateByConfig (targetConfig, data) {
  try {
    const template = fs.readFileSync(targetConfig.TEMPLATE_PATH, 'utf8');
    const config = ejs.render(template, data);
    fs.writeFileSync(targetConfig.OUTPUT_PATH, config);
    console.log(`Success: Generated file: ${targetConfig.OUTPUT_PATH}`);

  } catch (err) {
    console.error(`Failed to generate file: ${targetConfig.OUTPUT_PATH}. Error: ${err}`);
    process.exit(1);
  }
}

generateByConfig({ TEMPLATES_DIR, TEMPLATE_PATH, OUTPUT_PATH }, data);