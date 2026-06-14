#!/bin/bash

set -euo pipefail
IFS=$'\n\t'

# only for jenkins
# export APOLLO_CONFIG_SERVICE_ADDRESS=http://apollo-config-service.internal.cslr.io

# echo "Waiting for apollo-template to refresh config files"
# apollo-template -config "/opt/nginx/etc/apollo-template.hcl"

ls
ls /opt/nginx/conf.d
cat /opt/nginx/conf.d/default.conf