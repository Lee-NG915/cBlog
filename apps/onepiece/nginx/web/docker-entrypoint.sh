#!/bin/bash

set -eo pipefail
IFS=$'\n\t'

# default behaviour is to launch nginx
if [[ -z ${1} ]]; then
  echo "Starting nginx..."
  exec /usr/local/openresty/nginx/sbin/nginx -c /usr/local/openresty/nginx/conf/nginx.conf -g "daemon off;" ${EXTRA_ARGS}
else
  exec "$@"
fi
