# Continuous Integration Setup

Set up CI with GitHub Actions to run lint and test steps on every push. Use `node:20` as the container image and install dependencies via `npm ci`.

Create `.github/workflows/test.yml` with jobs for `lint` and `test`. Each job checks out code, installs Node, caches dependencies and runs `npm run lint` or `npm test`.

Include status badges in the main `README.md` once the workflow is active.
