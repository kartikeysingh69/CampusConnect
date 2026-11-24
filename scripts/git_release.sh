#!/usr/bin/env bash
# ==============================================================================
# scripts/git_release.sh — Git Release & Semantic Versioning Automation
# Verifies working directory, creates annotated Git tag, and pushes to origin
# Usage: ./scripts/git_release.sh v2.4.0 "Release message"
# ==============================================================================

set -euo pipefail

VERSION="${1:-}"
MESSAGE="${2:-Release $VERSION}"

if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version-tag> [release-message]"
  echo "Example: $0 v2.4.0 'Production stable release with full Phase 1-13 features'"
  exit 1
fi

# Ensure working directory is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Error: Working directory has uncommitted changes. Please commit or stash first." >&2
  exit 1
fi

echo "Creating annotated Git release tag: $VERSION"
git tag -a "$VERSION" -m "$MESSAGE"

echo "Pushing tag $VERSION to origin..."
git push origin "$VERSION"

echo "✅ Successfully tagged and published release: $VERSION"
