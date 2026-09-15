#!/bin/sh
set -eu

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

if ! command -v codex >/dev/null 2>&1; then
  echo "Codex CLI is required. Install or open Codex, then try again." >&2
  exit 1
fi

echo "Publishing Fist of the North Star: Wasteland Brawler..."

exec codex exec \
  --ephemeral \
  --approve-for-me \
  --sandbox workspace-write \
  -C "$project_dir" \
  'Publish the current game to its existing OpenAI Sites project. Use the sites-hosting skill and reuse the project_id in .openai/hosting.json; never create a replacement Site. Preserve the Site current audience. Treat the current working tree as the release source, preserving user changes. Run the repository regression checks, rebuild the static dist with python3 build_site.py, commit the intended source changes if needed, push the exact revision with a short-lived Sites credential, package dist, save a version, deploy it, wait for terminal status, and print the verified production URL. If publishing fails, report the concrete blocker and do not claim success.'
