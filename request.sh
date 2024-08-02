#!/bin/bash

# Define your URLs
URL="http://15.235.16.26:3001/query"

# Read addresses from file and format as JSON
ADDRESSES=$(cat addresses.txt | jq -R -s 'split("\n") | map(select(length > 0))')
echo "Formatted addresses JSON: $ADDRESSES"

curl -X POST $URL \
    -H "Content-Type: application/json" \
    -d "{\"contractAddresses\": $ADDRESSES}"

TX_HASHES=$(cat txhashes.txt | jq -R -s 'split("\n") | map(select(length > 0))')
echo "Formatted tx hashes JSON: $TX_HASHES"

curl -X POST $URL \
    -H "Content-Type: application/json" \
    -d "{\"txHashes\": $TX_HASHES}"
