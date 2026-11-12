#!/usr/bin/env bash
# Create or update the labels in .github/labels.yml. Never deletes labels.
set -euo pipefail
cd "$(dirname "$0")/.."

ruby -ryaml -e 'YAML.load_file(".github/labels.yml").each { |l| puts [l["name"], l["color"], l["description"]].join("\t") }' |
	while IFS=$'\t' read -r name color description; do
		gh label create "$name" --color "$color" --description "$description" --force
	done
