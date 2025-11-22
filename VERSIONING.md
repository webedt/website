# Version Management

This project uses **commit-based versioning** with git tags.

## How It Works

Version format: `MAJOR.MINOR.PATCH`

- **MAJOR.MINOR** - Set by creating git tags (e.g., `v1.2.0`, `v2.0.0`)
- **PATCH** - Auto-calculated from commits since the last tag

### Example

```bash
# Start with no tags
# 273 commits exist
# Version: 0.0.273

# Tag first minor version
git tag v1.0.0
git push origin v1.0.0
# Version: 1.0.0 (0 commits since tag)

# Make 5 commits
# Version: 1.0.5 (5 commits since v1.0.0)

# Tag next minor version
git tag v1.1.0
git push origin v1.1.0
# Version: 1.1.0 (0 commits since tag)

# Make 3 commits
# Version: 1.1.3 (3 commits since v1.1.0)
```

## Tagging Versions

### When to Tag

Only tag **major** and **minor** version bumps:
- ✅ Tag: `v1.0.0`, `v1.1.0`, `v1.2.0`, `v2.0.0`
- ❌ Don't tag patches: `v1.0.1`, `v1.0.2`, etc.

Patches are automatically calculated from commit count.

### How to Tag

```bash
# Tag a minor version bump
git tag v1.1.0
git push origin v1.1.0

# Tag a major version bump
git tag v2.0.0
git push origin v2.0.0
```

### Tag Format

Tags **must** follow the format: `vMAJOR.MINOR.0`

Examples:
- ✅ `v1.0.0`, `v1.1.0`, `v2.0.0`
- ❌ `v1.0`, `1.0.0`, `release-1.0.0`

## Version Commands

```bash
# Show current version
pnpm version:show

# Show detailed version info (JSON)
pnpm version:info

# Update package.json and version.ts
pnpm version:generate
```

## Maintenance Branches

This system works great for maintaining multiple versions:

```bash
# Create maintenance branch from v1.2.0
git checkout -b support/1.2.x v1.2.0

# Make 3 bug fixes
git commit -m "fix: bug 1"
git commit -m "fix: bug 2"
git commit -m "fix: bug 3"

# Version is now 1.2.3 (on this branch)

# Meanwhile on main...
git checkout main
# Main might be at v1.3.7 or v2.0.5
```

Each branch independently counts commits from its most recent ancestor tag.

## Automated Version Management

**Version numbers are automatically managed by GitHub Actions.**

### How It Works

When you create or update a pull request targeting the `main` branch:

1. The `update-version-on-pr.yml` workflow automatically runs
2. It executes `pnpm version:generate` to calculate the current version
3. If `package.json` or `apps/client/src/version.ts` need updating, it commits them to your PR branch
4. The PR shows the updated version files ready for review

### Benefits

- ✅ No manual version management required during development
- ✅ Versions are always accurate before merging to main
- ✅ Reduces merge conflicts and forgotten version updates
- ✅ Clear audit trail in PR history

### During Development

You don't need to run `pnpm version:generate` during development. Just commit your changes normally:

```bash
# Work on your feature
git add src/my-feature.ts
git commit -m "Add new feature"

# Create PR to main - GitHub Actions handles versioning
gh pr create --base main
```

The automation ensures version files are updated before your PR is merged.

## Build Integration

The version is available at build time:

1. **Development**: Version calculated from git history
2. **PR automation**: GitHub Actions updates version files automatically
3. **Build time**: Add to your build script if needed for additional workflows

### Add to Build (Optional)

```json
{
  "scripts": {
    "build": "pnpm version:generate && pnpm run -r build"
  }
}
```

## Version Display

The version is available in:
- `package.json` - NPM package version
- `apps/client/src/version.ts` - Exported constant for UI display
- UI footer - Shows as "v1.2.5"

## FAQ

### Why not tag patch versions?

Patches are just incremental commits. Auto-calculating from commit count:
- Removes manual work
- Always increments (no conflicts)
- Shows actual development activity
- Works automatically across branches

### What if I want to skip a version?

Just tag the version you want:
```bash
# Currently at 1.2.5
git tag v1.3.0  # Next version will be 1.3.1, 1.3.2, etc.
git tag v2.0.0  # Jump to 2.0 series
```

### How do I see what version I'm on?

```bash
pnpm version:show
# or
pnpm version:info  # more details
```

### What if there are no tags?

Defaults to `0.0.X` where X is total commit count.

### Can I use this with semantic versioning?

Yes! This follows semantic versioning:
- Tag `v2.0.0` for breaking changes (MAJOR)
- Tag `v1.1.0` for new features (MINOR)
- Commits auto-increment patches (PATCH)

## Examples

### Scenario 1: Normal Development

```bash
git tag v1.0.0
# v1.0.0

git commit -m "fix: bug"
# v1.0.1

git commit -m "fix: another bug"
# v1.0.2

git commit -m "feat: new feature"
git tag v1.1.0
# v1.1.0

git commit -m "docs: update readme"
# v1.1.1
```

### Scenario 2: Maintenance Branch

```bash
# Main branch
git tag v2.0.0
# v2.0.0

# Create support branch for v1.x
git checkout -b support/1.x v1.5.0
# v1.5.0

git commit -m "fix: security patch"
# v1.5.1 (on support/1.x)

# Back to main
git checkout main
git commit -m "feat: new feature"
# v2.0.1 (on main)
```

## Implementation

Version calculation is handled by `scripts/generate-version.js`:
- Uses `git describe --tags` to find the latest tag
- Counts commits since that tag
- Updates `package.json` and `apps/client/src/version.ts`

The script is safe to run anytime and can be committed to keep versions in sync.
