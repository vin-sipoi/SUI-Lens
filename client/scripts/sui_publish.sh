#!/bin/bash
# Script to publish Move package to Sui network with default testnet and ed25519 key

echo "Publishing Move package to Sui Testnet with ed25519 key..."

sui client publish move_packages/suilens_poap --gas-budget 10000 <<EOF
y

0
EOF

echo "Publish command executed. Please follow any further prompts in the terminal."
