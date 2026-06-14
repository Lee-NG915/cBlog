const path = require('path');

// The path is relative to the directory where the node command is executed.
const TEMPLATES_DIR = './etc/templates';
const TEMPLATE_PATH = path.join(TEMPLATES_DIR, 'env.ejs');
const OUTPUT_PATH = './.env';

// const data = require(path.join(process.cwd(), 'env.json'));

const config = {
  TEMPLATES_DIR,
  TEMPLATE_PATH,
  OUTPUT_PATH,
}

module.exports = config;