// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import fs from 'node:fs';
// import path from 'node:path';
import ejs from 'ejs';

// const __dirname = path.dirname(new URL(import.meta.url).pathname);

// const templatePath = path.resolve(__dirname, '../../../etc/templates/env.ejs');
// const outputPath = path.resolve(__dirname, '../../../.env.test');
// // const secret_name = 'ecomm-team/onepiece-pos/us-test';
// const secretName = process.env.SECRET_NAME;

/**
 *
 * @param {string} templatePath e.g ../../../etc/templates/env.ejs
 * @param {string} outputPath e.g ../../../.env.test
 * @param {string} secretName e.g ecomm-team/onepiece-pos/us-test
 */

export async function generateEnvBySecrets(templatePath, outputPath, secretName) {
  const template = fs.readFileSync(templatePath, 'utf8');
  let response;

  const client = new SecretsManagerClient({
    region: 'ap-southeast-1',
  });
  // eslint-disable-next-line no-useless-catch
  try {
    response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        // VersionStage: 'AWSCURRENT', // VersionStage defaults to AWSCURRENT if unspecified
      })
    );
    const secrets = response?.SecretString;
    const secretData = JSON.parse(secrets || '{}');
    const result = ejs.render(template, secretData);
    fs.writeFileSync(outputPath, result);
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    // console.error(error);
    throw error;
  }
}

// const data = {
//   asset_host: 'https://asset.onepiece.com',
//   api_host: 'https://api.onepiece.com',
// };

// const result = ejs.compile(template, {
//   root: '.',
//   filename: templatePath,
//   // outputFunctionName: 'echo',
// })(data);
