#!/bin/bash

set -e

export PATH="$PATH:$(go env GOPATH)/bin"

HOMELIB=../..

protoc \
    --proto_path=${HOMELIB}/proto \
    --go_out=${HOMELIB}/server/protob \
    --go_opt=paths=source_relative \
    ${HOMELIB}/proto/blob.proto