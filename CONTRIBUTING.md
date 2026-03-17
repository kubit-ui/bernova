## Contributing

We welcome contributions to **bernova**! This project is open source and we encourage community participation through **forks and pull requests**. All contributions must be made through the fork workflow - we do not accept direct pushes to the main repository.

### Why Fork-Based Contributing?

This project follows the **fork-based contribution model** to:

- Maintain code quality and security
- Ensure all changes are reviewed before merging
- Keep the main repository clean and stable
- Allow contributors to work independently on features

### Development Workflow

1. **Fork the Repository**: Click the "Fork" button in the upper right corner of the [bernova repository](https://github.com/kubit-ui/bernova) on GitHub. This will create a copy of the repository in your GitHub account.

2. **Clone Your Fork**: Clone your forked repository to your local machine (not the original repository).

   ```sh
   git clone https://github.com/YOUR_USERNAME/bernova.git
   cd bernova
   ```

3. **Add Original Repository as Upstream**: Add the original repository as a remote to keep your fork synchronized.

   ```sh
   git remote add upstream https://github.com/kubit-ui/bernova.git
   git fetch upstream
   ```

4. **Install Dependencies**: This project uses **Yarn Berry** as package manager.

   ```sh
   # Enable Corepack (ships with Node.js)
   corepack enable

   # Install dependencies
   yarn install
   ```

5. **Create a Feature Branch**: Always create a new branch for your changes. Use proper branch naming conventions for automatic version detection.

   ```sh
   git checkout -b <branch-type>/<branch-name>
   ```

6. **Make Changes**:
   - Make your changes to the bernova codebase
   - Follow the coding standards outlined in our style guide
   - Add or update tests for your changes
   - Update documentation if necessary
   - Test your changes thoroughly using `yarn test`

7. **Commit Changes**: Use conventional commit messages for automatic versioning.

   ```sh
   git commit -m "feat(css): add new responsive grid system"
   ```

8. **Keep Your Fork Updated**: Before pushing, sync with the upstream repository.

   ```sh
   git fetch upstream
   git rebase upstream/main
   ```

9. **Push to Your Fork**: Push your changes to your forked repository (never to the original).

   ```sh
   git push origin <branch-name>
   ```

10. **Open a Pull Request**:

- Go to the original [bernova repository](https://github.com/kubit-ui/bernova)
- Click "New pull request"
- Select "compare across forks"
- Choose your fork and branch as the source
- Fill out the PR template with details about your changes
- Submit the pull request for review

### Branch Naming & Automatic Publishing with Changesets

This repository uses **[Changesets](https://github.com/changesets/changesets)** for automated version management and publishing. When your PR is merged, the package will be automatically versioned, changelog updated, and published to NPM.

#### How It Works

1. **You create a PR** with proper branch naming and conventional commit messages
2. **Automated validation** checks your branch name, PR title, and code quality
3. **On merge**, a changeset is auto-generated based on your branch type
4. **Version is bumped** automatically (major/minor/patch)
5. **CHANGELOG is updated** with your changes
6. **Package is built and published** to NPM
7. **GitHub Release is created** with release notes
8. **PR comment** confirms the published version

#### Branch Naming Patterns (Required)

Use these branch prefixes - they determine the version bump type:

| Branch Pattern          | Version Bump | Example                      | When to Use                           |
| ----------------------- | ------------ | ---------------------------- | ------------------------------------- |
| `feat/` or `feature/`   | **MINOR**    | `feat/grid-system`           | New features, CSS utilities, or APIs  |
| `fix/` or `bugfix/`     | **PATCH**    | `fix/button-styling`         | Bug fixes in styles or functionality  |
| `break/` or `breaking/` | **MAJOR**    | `break/remove-old-vars-api`  | Breaking changes to public API        |
| `hotfix/`               | **PATCH**    | `hotfix/critical-layout-bug` | Urgent production fixes               |
| `chore/`                | **PATCH**    | `chore/update-deps`          | Maintenance, deps, or refactoring     |
| `docs/`                 | **PATCH**    | `docs/update-readme`         | Documentation only changes            |
| `style/`                | **PATCH**    | `style/format-code`          | Code style/formatting changes         |
| `refactor/`             | **PATCH**    | `refactor/simplify-logic`    | Code refactoring without new features |
| `test/`                 | **PATCH**    | `test/add-unit-tests`        | Adding or updating tests              |

#### PR Title Format (Required)

Your PR title **must** follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <description>
```

**Examples:**

- ✅ `feat: add responsive grid system`
- ✅ `fix: resolve button hover state issue`
- ✅ `docs: update installation guide`
- ✅ `refactor: simplify CSS generation logic`
- ❌ `Added new feature` (missing type)
- ❌ `fix button` (missing colon)

**With scope (optional but recommended):**

```
<type>(<scope>): <description>
```

**Examples:**

- ✅ `feat(css): add spacing utility classes`
- ✅ `fix(build): resolve minification error`
- ✅ `docs(readme): add usage examples`

**Breaking changes:**

```
<type>!: <description>
```

or

```
<type>(<scope>)!: <description>
```

**Examples:**

- ✅ `feat!: redesign CSS variable naming convention`
- ✅ `refactor(api)!: change provider interface`

#### Commit Message Guidelines

While your commits don't directly affect versioning (the branch name does), **good commit messages are essential** for:

- Code review clarity
- Git history readability
- Future maintenance
- Team collaboration

**Follow Conventional Commits:**

```bash
# Feature commits
git commit -m "feat(css): add margin utility classes"
git commit -m "feat(provider): add theme switching support"

# Bug fix commits
git commit -m "fix(build): resolve TypeScript compilation error"
git commit -m "fix(styles): correct button padding in mobile view"

# Documentation commits
git commit -m "docs(readme): add installation instructions"
git commit -m "docs(api): document CSS variable usage"

# Refactoring commits
git commit -m "refactor(core): simplify style generation logic"
git commit -m "refactor(utils): extract common helper functions"

# Test commits
git commit -m "test(unit): add tests for CSS parser"
git commit -m "test(integration): add build process tests"

# Chore commits
git commit -m "chore(deps): update postcss to v8.5.0"
git commit -m "chore(ci): improve GitHub Actions workflow"
```

**Commit message structure:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Example with body:**

```
feat(css): add responsive grid system

Implements a 12-column grid system with breakpoints for
mobile, tablet, and desktop layouts. Includes utility
classes for column spans and offsets.

Closes #123
```

#### Version Detection Logic

The automated system determines version bumps in this order:

1. **Branch name** (primary detection)
   - `feat/` or `feature/` → MINOR
   - `break/` or `breaking/` → MAJOR
   - Everything else → PATCH

2. **PR title** (secondary detection)
   - `feat:` → MINOR
   - `break:` or `breaking:` → MAJOR
   - `!` suffix → MAJOR (e.g., `feat!:`)
   - Everything else → PATCH

#### Complete Workflow Examples

**Example 1: Adding a new CSS utility (MINOR version)**

```sh
# 1. Create feature branch
git checkout -b feat/spacing-utilities

# 2. Make your changes
# ... edit files ...

# 3. Commit with conventional format
git commit -m "feat(css): add margin and padding utility classes"
git commit -m "docs(css): document new spacing utilities"

# 4. Push to your fork
git push origin feat/spacing-utilities

# 5. Create PR with title: "feat(css): add spacing utility classes"
# Result after merge: MINOR bump (1.3.2 → 1.4.0)
```

**Example 2: Fixing a bug (PATCH version)**

```sh
# 1. Create fix branch
git checkout -b fix/button-hover-state

# 2. Fix the issue
# ... edit files ...

# 3. Commit the fix
git commit -m "fix(button): resolve hover state color inconsistency"
git commit -m "test(button): add test for hover state"

# 4. Push to your fork
git push origin fix/button-hover-state

# 5. Create PR with title: "fix(button): resolve hover state styling issue"
# Result after merge: PATCH bump (1.3.2 → 1.3.3)
```

**Example 3: Breaking changes (MAJOR version)**

```sh
# 1. Create breaking change branch
git checkout -b break/css-vars-restructure

# 2. Make breaking changes
# ... edit files ...

# 3. Commit with breaking change indicator
git commit -m "feat!: restructure CSS custom properties"
git commit -m "docs: add migration guide for v2.0.0"

# 4. Push to your fork
git push origin break/css-vars-restructure

# 5. Create PR with title: "feat!: restructure CSS custom properties"
# PR description should include:
# "BREAKING CHANGE: CSS variables have been renamed for better consistency.
# See migration guide for details."
# Result after merge: MAJOR bump (1.3.2 → 2.0.0)
```

#### PR Validation Checks

When you open a PR, automated checks will validate:

✅ **Branch Naming** - Must follow `type/description` pattern
✅ **PR Title** - Must follow conventional commits format
✅ **Title Length** - Should be ≤ 72 characters (warning if longer)
✅ **TypeScript** - Type checking must pass
✅ **Tests** - All tests must pass
✅ **Code Quality** - No `console.log` in production code
✅ **TODOs** - Must reference GitHub issues (e.g., `// TODO: #123`)
✅ **Documentation** - New features should update docs

**The PR validation bot will comment with:**

- ✅ Pass/Fail status for each check
- 📦 Expected version bump type
- ⚠️ Warnings (non-blocking issues)
- ❌ Blocking issues that must be fixed

**Example validation report:**

```
🔍 PR Validation Report

Status: ✅ PASSED
Branch: feat/grid-system
Expected Version Bump: minor

✅ Validation Results
| Check           | Status  | Description                    |
|-----------------|---------|--------------------------------|
| Branch Naming   | ✅ Pass | Must follow type/description   |
| PR Title        | ✅ Pass | Must follow conventional commits|
| TypeScript      | ✅ Pass | Type checking validation       |
| Tests           | ✅ Pass | All tests must pass            |
| Code Quality    | ✅ Pass | No console.log, TODOs need issues|

🎯 Next Steps
This PR is ready for review - all validation checks passed!

📝 Automatic Release
When your PR is merged:
- Version will be bumped (minor)
- CHANGELOG will be updated automatically
- Package will be published to NPM
- You'll get a comment with the published version

No manual changeset needed - it's all automatic! 🚀
```

### Important Notes for Contributors

- **Never push directly** to the main bernova repository
- Always work on **your own fork** and create pull requests
- Keep your fork **synchronized** with the upstream repository
- **Test your styles** thoroughly before submitting
- Include **screenshots or demos** of new CSS utilities in your PR
- Update **documentation** for new CSS classes and utilities
- Follow the existing **code style** and patterns used in the project

### Requirements

Before contributing, ensure you have:

- **Node.js**: v20.x or higher
- **Yarn**: v4.x or higher (via Corepack)
- **Git**: Latest version

Check your versions:

```sh
node --version  # Should show v20.x.x or higher
yarn --version  # Should show 4.x.x
```

### Private Registry (optional)

This repo uses the public npm registry by default. If your organization requires a **private registry** (JFrog Artifactory, Nexus, GitHub Packages, etc.), you can override it globally via environment variables — no need to modify any files.

1. Add to your `~/.zshrc` (or `~/.bashrc`):

```sh
export YARN_NPM_REGISTRY_SERVER="https://your-org.example.com/your-npm-registry/"
export YARN_NPM_ALWAYS_AUTH=true
export YARN_ENABLE_STRICT_SSL=false
```

2. Reload your shell:

```sh
source ~/.zshrc
```

3. Verify:

```sh
yarn config get npmRegistryServer
# Should show your private registry URL
```

This applies globally to all Yarn Berry projects. See `.env.example` for reference.

### Development Setup

```sh
# Enable Corepack (ships with Node.js)
corepack enable

# Install dependencies
yarn install

# Build the CSS framework
yarn build

# Run tests
yarn test

# Lint code
yarn lint

# Format code
yarn format

# Type check
yarn typecheck

# Watch for changes during development
yarn dev
```

### CSS Guidelines

When contributing CSS code to bernova:

- Use consistent naming conventions for CSS classes
- Follow the BEM methodology when applicable
- Ensure cross-browser compatibility
- Write efficient and maintainable CSS
- Document new CSS custom properties and utilities
- Test responsive behavior across different screen sizes

### Testing Your Changes

Before submitting your PR:

1. **Build the framework**: Run `yarn build` to ensure no build errors
2. **Test functionality**: Verify your CSS works as expected
3. **Check responsiveness**: Test on different screen sizes
4. **Validate markup**: Ensure HTML examples are valid
5. **Run automated tests**: Use `yarn test` to run the test suite
6. **Lint your code**: Run `yarn lint` to check for issues
7. **Format your code**: Run `yarn format` to apply consistent formatting
