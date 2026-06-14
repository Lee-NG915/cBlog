#!/bin/bash

set -eu

read -p "you must stash your changes first, stash already? [y|n]" stash

if [[ $stash = "y" ]];then
  branch=`git rev-parse --abbrev-ref HEAD`
  echo "current branch: $branch"
  set -x
  git checkout develop > /dev/null
  git pull  > /dev/null
  git checkout -b release/$1  > /dev/null
  git changelog -n -t $1
  git commit -am "release $1"  > /dev/null
  git checkout master > /dev/null
  git pull > /dev/null
  git merge release/$1
  git tag -a $1 -m $1 > /dev/null
  git push origin HEAD --tags > /dev/null
  set +x

  echo "release $1 done, you need to deploy manually"

  set -x
  git checkout develop > /dev/null
  git pull > /dev/null
  git merge master > /dev/null
  git push > /dev/null
  git branch -d release/$1 > /dev/null
  git checkout $branch > /dev/null
  set +x

  echo ""
  echo "you can get DEPLOY_VERSION by following this link:"
  echo "https://cslr-jenkins.castlery.com/job/onepiece/view/tags/job/$1/1/console"
  echo ""
  echo "and you can quickly deploy by following this link: "
  echo "https://cslr-jenkins.castlery.com/job/onepiece-deployment/build?delay=0sec"
  echo ""

  echo "checkout to $branch, you can resume your work"
else
  echo "ok, please stash your changes, rerun this script if you are ready"
fi