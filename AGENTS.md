# Repository Guidelines

## Project Structure & Module Organization

This repository is currently a clean project root. Add application code under a clear top-level directory such as `src/`, tests under `tests/` or next to source files, and reusable static assets under `assets/` or `public/`. Keep configuration files at the root so contributors can discover tooling quickly.

Example layout:

```text
src/        Application source code
tests/      Automated tests
assets/     Images, icons, fixtures, and other static files
docs/       Project notes and contributor-facing documentation
```

## Build, Test, and Development Commands

No package manager, build system, or test runner is committed yet. When adding one, document the canonical commands here and keep them runnable from the repository root.

Common examples:

- `npm install`: install JavaScript dependencies when a `package.json` is added.
- `npm run dev`: start the local development server.
- `npm test`: run the automated test suite.
- `npm run build`: produce a production build.

## Coding Style & Naming Conventions

Use consistent formatting within each language and commit the formatter configuration with the code. Prefer descriptive file and symbol names. Use `kebab-case` for general file and directory names, `PascalCase` for UI components or classes, and `camelCase` for functions and variables unless the language ecosystem expects otherwise.

Avoid broad rewrites when making small changes. Keep modules focused and place shared utilities in an obvious shared location such as `src/lib/` or `src/utils/`.

## Testing Guidelines

Add tests with any new behavior. Keep test files close to the code they cover or in `tests/` using predictable names such as `*.test.*` or `*.spec.*`. Tests should cover expected behavior, edge cases, and regressions for fixed bugs.

Once a test framework is introduced, update this section with the exact command and any coverage expectations.

## Commit & Pull Request Guidelines

Git history is not available in this directory, so no repository-specific commit convention can be inferred. Use short, imperative commit messages such as `Add onboarding checklist` or `Fix date validation`.

Pull requests should include a concise summary, testing performed, linked issues when applicable, and screenshots or recordings for user-facing UI changes. Keep PRs scoped to one logical change whenever possible.

## Security & Configuration Tips

Do not commit secrets, local credentials, or generated environment files. Store local configuration in ignored files such as `.env.local`, and provide documented examples like `.env.example` when configuration is required.
