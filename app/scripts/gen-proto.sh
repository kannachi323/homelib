#!/bin/bash

set -e

HOMELIB=../..

protoc \
    --plugin=protoc-gen-ts_proto=${HOMELIB}/app/node_modules/.bin/protoc-gen-ts_proto \
    --ts_proto_out=${HOMELIB}/app/src/proto-gen \
    --ts_proto_opt=esModuleInterop=true,forceLong=long,useDate=string \
    --proto_path=${HOMELIB}/proto \
    ${HOMELIB}/proto/blob.proto

