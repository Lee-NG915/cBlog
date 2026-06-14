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

cross-env NODE_PATH=$NODE_PATH NODE_ENV=$NODE_ENV WDS_PORT=$PORT_CLIENT PORT=$PORT_SERVER DEV_HOST=$DEV_HOST node scripts/start-dev.js
