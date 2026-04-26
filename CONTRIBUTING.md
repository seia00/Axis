# Contributing guidelines

Our goal is to keep development fast *and* stable.

## PR rules
- Do not commit directly to `main`.
- Every change goes through a pull request.
- 1 PR = 1 purpose (feature OR bug fix).
- Keep PRs small and descriptive.

## Branch naming
- `feature/<slug>` for new features
- `fix/<slug>` for bug fixes

## Commit messages
- Prefix commits with one of:
  - `feat:`
  - `fix:`
  - `refactor:`

## Checks (minimal)
- Before you open a PR, run:
  - `npm run lint`
  - `npm run build`

## PR template (copy/paste)
```
## What
What did you do? (1 line)

## Why
Why is this needed? (bug/user value)

## How
How did you implement it? (short)

## Check
- [ ] lint
- [ ] build
- [ ] tested locally
```
