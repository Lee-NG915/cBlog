// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const EnvConfig = require('./config-env');
const NginxConfig = require('./config-nginx');
// const data = require(path.join(process.cwd(), 'env.json'));

// input in CI/CD
const secretName = process.env.SECRET_NAME;

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

const client = new SecretsManagerClient({
  region: "ap-southeast-1",
});

async function run() {
  let secrets;
  try {
    const data = await client.send(new GetSecretValueCommand({ SecretId: secretName }));
    secrets = data.SecretString;
  } catch (err) {
    console.error(`Failed to fetch secret: '${secretName}'. Error: ${err}`);
    process.exit(1);
  }

  const secretsData = JSON.parse(secrets);

  // const envFileContent = Object.entries(JSON.parse(secrets))
  //   .map(([key, value]) => `${key}=${value}`)
  //   .join('\n');
  // fs.writeFileSync('.env', envFileContent);
  console.log(secretsData);
  generateByConfig(EnvConfig, secretsData);
  generateByConfig(NginxConfig, secretsData);

}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
