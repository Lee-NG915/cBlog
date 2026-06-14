#!/bin/bash

# MODULE="$1"
# if [ $MODULE = 'desktop' ]
# then
#   PORT='9000'
#   PLATFORM='desktop'
#   DISABLE_SSR=false
# else
#   PORT='8000'
#   PLATFORM='mobile'
#   DISABLE_SSR=false
# fi

PORT='9000'
DISABLE_SSR=false

NODE_PATH='./src'
NODE_ENV='production'

cross-env HOST=$HOST NODE_PATH=$NODE_PATH NODE_ENV=$NODE_ENV PORT=$PORT DISABLE_SSR=$DISABLE_SSR DD_AGENT_HOST=$DD_AGENT_HOST node ./bin/server.js