#!/bin/bash

set -aeo pipefail
IFS=$'\n\t'

# only for jenkins
# export APOLLO_CONFIG_SERVICE_ADDRESS=http://apollo-config-service.internal.cslr.io

# echo "Waiting for apollo-template to refresh config files"
# apollo-template -config "/app/etc/apollo-template.hcl"

# echo "Running webpack build"
# source .env
# yarn run build > /dev/null

# ls -al static
# ls -al static/desktop
# ls -al static/desktop/client

echo "Clean up devDependencies"
yarn install --production --ignore-scripts --prefer-offline --force

echo "Clean up js source map"
find ./static/ -name "*.js.map" -maxdepth 2 -exec rm {} \;