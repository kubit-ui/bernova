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

4. **Create a Feature Branch**: Always create a new branch for your changes. Use proper branch naming conventions for automatic version detection.

   ```sh
   git checkout -b <branch-type>/<branch-name>
   ```

5. **Make Changes**:

   - Make your changes to the bernova codebase
   - Follow the coding standards outlined in our style guide
   - Add or update tests for your changes
   - Update documentation if necessary
   - Test your changes thoroughly using `npm test`

6. **Commit Changes**: Use conventional commit messages for automatic versioning.

   ```sh
   git commit -m "feat(css): add new responsive grid system"
   ```

7. **Keep Your Fork Updated**: Before pushing, sync with the upstream repository.

   ```sh
   git fetch upstream
   git rebase upstream/main
   ```

8. **Push to Your Fork**: Push your changes to your forked repository (never to the original).

   ```sh
   git push origin <branch-name>
   ```

9. **Open a Pull Request**:
   - Go to the original [bernova repository](https://github.com/kubit-ui/bernova)
   - Click "New pull request"
   - Select "compare across forks"
   - Choose your fork and branch as the source
   - Fill out the PR template with details about your changes
   - Submit the pull request for review

### Branch Naming & Automatic Publishing

This repository uses an **automatic publishing system** that determines the version bump based on your branch name and PR content. When your PR is merged, the package will be automatically published to NPM.

#### Branch Naming Patterns

Use these branch prefixes for bernova to ensure automatic publishing works correctly:

| Branch Pattern          | Version Bump | Example                      | Description                   |
| ----------------------- | ------------ | ---------------------------- | ----------------------------- |
| `feat/` or `feature/`   | **MINOR**    | `feat/grid-system`           | New CSS utilities or features |
| `fix/` or `bugfix/`     | **PATCH**    | `fix/button-styling`         | Bug fixes in styles           |
| `break/` or `breaking/` | **MAJOR**    | `break/remove-old-vars-api`  | Breaking API changes          |
| `hotfix/`               | **PATCH**    | `hotfix/critical-layout-bug` | Urgent styling fixes          |
| `chore/`                | **PATCH**    | `chore/update-deps`          | Maintenance tasks             |

#### Advanced Version Detection

The system also analyzes your **PR title** and **description** for more precise version detection:

##### MAJOR (Breaking Changes)

- `BREAKING CHANGE:` in PR description
- `!` in PR title (e.g., `feat!: redesign button API`)
- `[breaking]` tag in PR title
- Conventional commits with `!` (e.g., `feat(api)!: change interface`)

##### MINOR (New Features)

- PR titles starting with `feat:` or `feature:`
- `[feature]` tag in PR title
- Conventional commits like `feat(css): add flexbox utilities`

##### PATCH (Bug Fixes & Others)

- PR titles starting with `fix:` or `bugfix:`
- All other changes (default behavior)
- Conventional commits like `fix(button): hover state styling issue`

#### Examples for bernova

**Adding a new CSS utility:**

```sh
git checkout -b feat/spacing-utilities
# Make your changes in your fork
git commit -m "feat(css): add margin and padding utility classes"
# Create PR with title: "feat(css): add spacing utility classes"
# Result: MINOR version bump (e.g., 1.0.0 → 1.1.0)
```

**Fixing a styling bug:**

```sh
git checkout -b fix/button-hover-state
# Make your changes in your fork
git commit -m "fix(button): resolve hover state color inconsistency"
# Create PR with title: "fix(button): resolve hover state styling issue"
# Result: PATCH version bump (e.g., 1.0.0 → 1.0.1)
```

**Breaking API changes:**

```sh
git checkout -b break/css-vars-restructure
# Make your changes in your fork
git commit -m "feat!: restructure CSS custom properties for better naming convention"
# Create PR with title: "feat!: restructure CSS custom properties"
# PR description: "BREAKING CHANGE: CSS variables have been renamed for better consistency..."
# Result: MAJOR version bump (e.g., 1.0.0 → 2.0.0)
```

### Important Notes for Contributors

- **Never push directly** to the main bernova repository
- Always work on **your own fork** and create pull requests
- Keep your fork **synchronized** with the upstream repository
- **Test your styles** thoroughly before submitting
- Include **screenshots or demos** of new CSS utilities in your PR
- Update **documentation** for new CSS classes and utilities
- Follow the existing **code style** and patterns used in the project

### Development Setup

Before contributing, make sure you have the development environment set up:

```sh
# Install dependencies (requires PNPM 9.0.0 or higher)
pnpm install

# Build the CSS framework
pnpm run build

# Run tests
pnpm test

# Watch for changes during development
pnpm run dev
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

1. **Build the framework**: Run `pnpm run build` to ensure no build errors
2. **Test functionality**: Verify your CSS works as expected
3. **Check responsiveness**: Test on different screen sizes
4. **Validate markup**: Ensure HTML examples are valid
5. **Run automated tests**: Use `pnpm test` to run the test suite
