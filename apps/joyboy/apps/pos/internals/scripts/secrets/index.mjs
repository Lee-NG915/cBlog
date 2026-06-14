import { generateEnvBySecrets } from './utils/generator.mjs';
import path from 'node:path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const templatePath = path.resolve(__dirname, '../../../etc/templates/env.ejs');
const outputPath = path.resolve(__dirname, '../../../.env.production');

const APP_ENV = process.env.APP_ENV;
// const secretName = process.env.SECRET_NAME;
const secretName = `ecomm-team/joyboy/${APP_ENV}`;
console.log('process.env.NODE_ENV', process.env.NODE_ENV);
console.log('process.env.CI_ENV', process.env.CI_ENV);
// production
if (process.env.NODE_ENV === 'production' && process.env.CI_ENV === 'true') {
  if (!secretName) {
    console.error('Please provide a AWS environment variable SECRET_NAME, e.g. ecomm-team/onepiece-pos/us-test');
    process.exit(1);
  }
  generateEnvBySecrets(templatePath, outputPath, secretName);
} else {
  console.log('not in production mode or not in CI, skip generating env file.');
}
