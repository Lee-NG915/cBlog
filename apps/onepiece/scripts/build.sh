#!/bin/bash

set -eo pipefail

NODE_ENV='production'

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE_DIR="$( cd "${DIR}/.." && pwd)"

build_webpack_module() {
  echo "Running webpack build"
  local PORT='9000'
  local build_directory="$BASE_DIR/static/$module"
  if [ -d "$build_directory" ] ; then
    find $build_directory -mindepth 1 -delete
  fi
  cross-env NODE_ENV=$NODE_ENV PORT=$PORT node scripts/start.js
  return 0
}

build_webpack_module