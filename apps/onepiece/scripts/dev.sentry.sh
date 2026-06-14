#!/bin/bash

# MODULE="$1"
# if [ $MODULE = 'desktop' ]
# then
#   PORT_SERVER='7777'
#   PORT_CLIENT='7778'
#   PLATFORM='desktop'
# else
#   PORT_SERVER='8888'
#   PORT_CLIENT='8889'
#   PLATFORM='mobile'
# fi

PORT_SERVER='7777'
PORT_CLIENT='7778'

NODE_PATH='./src'
NODE_ENV='development'
DEV_HOST='localhost'
# CI
# 从 package.json 中获取版本信息
APP_VERSION=0.0.0
APP_ENV=sg-dev
APP_NAME=onepiece
SENTRY_DEBUG=true

cross-env NODE_PATH=$NODE_PATH \
          NODE_ENV=$NODE_ENV \
          WDS_PORT=$PORT_CLIENT \
          PORT=$PORT_SERVER \
          DEV_HOST=$DEV_HOST \
          APP_VERSION=$APP_VERSION \
          APP_ENV=$APP_ENV \
          SENTRY_DEBUG=$APP_VERSION \
          node scripts/start-dev.js