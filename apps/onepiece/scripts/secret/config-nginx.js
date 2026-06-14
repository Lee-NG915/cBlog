const path = require('path');

// The path is relative to the directory where the node command is executed.
const TEMPLATES_DIR = './nginx/web/etc/templates';
const TEMPLATE_PATH = path.join(TEMPLATES_DIR, 'default.conf.ejs');
const OUTPUT_PATH = './nginx/web/conf.d/default.conf';


const config = {
  TEMPLATES_DIR,
  TEMPLATE_PATH,
  OUTPUT_PATH,
}

module.exports = config;