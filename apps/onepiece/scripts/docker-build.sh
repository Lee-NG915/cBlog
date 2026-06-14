#!/bin/bash
# VAULT_TOKEN and VAULT_ADDR should have been defined as environment variables

set -euo pipefail
IFS=$'\n\t'

if [ -z "$1" ]
  then
    echo "No argument supplied"
fi

APP_NAME=$1
APP_ENV=$2
APP_VERSION=$3
APP_COMMIT=$4
IMAGE_TAG=$5

# build nginx
SUFFIX="-nginx"
docker build -t "$APP_NAME:${APP_ENV}_${IMAGE_TAG}${SUFFIX}" -f ./nginx/web/Dockerfile --force-rm \
    --build-arg APP_NAME="$APP_NAME" \
    --build-arg APP_VERSION="$APP_VERSION" \
    --build-arg APP_ENV="$APP_ENV" \
    --build-arg APP_BUILD="$IMAGE_TAG" \
    --build-arg APP_COMMIT="$APP_COMMIT" ./nginx/web/

# build app
docker build -t $APP_NAME:${APP_ENV}_${IMAGE_TAG} -f Dockerfile --force-rm \
    --build-arg APP_NAME="$APP_NAME" \
    --build-arg APP_VERSION="$APP_VERSION" \
    --build-arg APP_ENV="$APP_ENV" \
    --build-arg APP_BUILD="$IMAGE_TAG" \
    --build-arg APP_COMMIT="$APP_COMMIT" .


