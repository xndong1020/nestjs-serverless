#!/bin/bash

export NODE_ENV=dev

set -a
. .env.dev
sls deploy -v
set +a
