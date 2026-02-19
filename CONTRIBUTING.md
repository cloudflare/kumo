# Contributing

Kumo is an open-source project and we welcome contributions from you. Thank you!

Below you can find some guidance on how to be most effective when contributing to the project.

## tl;dr for contributing to Kumo

Useful commands for developing Kumo (all commands below should be run in the project root):

- `pnpm i; pnpm build` will build everything in kumo.
- `pnpm dev` will watch and build changes while you develop.

Before committing/submitting a PR:

- Add a [changeset](#changesets) with `pnpm changeset`.
- Don’t squash your commits after a review.

## Before getting started

We really appreciate your interest in making a contribution, and we want to make sure that the process is as smooth and transparent as possible! To this end, we note that the Kumo team is actively doing development in this repository, and while we consistently strive to communicate status and current thinking around all open issues, there may be times when context surrounding certain items is not up to date. Therefore, **for non-trivial changes, please always engage on the issue or create a discussion or feature request issue first before writing your code.** This will give us opportunity to flag any considerations you should be aware of before you spend time developing. Of course, for trivial changes, please feel free to go directly to filing a PR, with the understanding that the PR itself will serve as the place to discuss details of the change.

Thanks so much for helping us improve [Kumo](https://github.com/cloudflare/kumo), and we look forward to your contribution!

## Getting started

### Set up your environment

Kumo is built and run on the Node.js JavaScript runtime.

- Install the latest LTS version of [Node.js](https://nodejs.dev/) - we recommend using a Node version manager like [nvm](https://github.com/nvm-sh/nvm).
- Install a code editor - we recommend using [VS Code](https://code.visualstudio.com/).
  - When opening the project in VS Code for the first time, it will prompt you to install the [recommended VS Code extensions](https://code.visualstudio.com/docs/editor/extension-marketplace#:~:text=install%20the%20recommended%20extensions) for the project.
- Install the [git](https://git-scm.com/) version control tool.

### Fork and clone this repository

#### For External Contributors

Any contributions you make will be via [Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) on [GitHub](https://github.com/) developed in a local git repository and pushed to your own fork of the repository.

- Ensure you have [created an account](https://docs.github.com/en/get-started/onboarding/getting-started-with-your-github-account) on GitHub.
- [Create your own fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) of [this repository](https://github.com/cloudflare/kumo).
- Clone your fork to your local machine

  ```sh
  git clone https://github.com/<your-github-username>/kumo
  cd kumo
  ```

  You can see that your fork is setup as the `origin` remote repository.
  Any changes you wish to make should be in a local branch that is then pushed to this origin remote.

  ```sh
  git remote -v
  origin	https://github.com/<your-github-username>/kumo (fetch)
  origin	https://github.com/<your-github-username>/kumo (push)
  ```

- Add `cloudflare/kumo` as the `upstream` remote repository.

  ```sh
  git remote add upstream https://github.com/cloudflare/kumo
  git remote -v
  origin	https://github.com/<your-github-username>/kumo (fetch)
  origin	https://github.com/<your-github-username>/kumo (push)
  upstream	https://github.com/cloudflare/kumo (fetch)
  upstream	https://github.com/cloudflare/kumo (push)
  ```

- You should regularly pull from the `main` branch of the `upstream` repository to keep up to date with the latest changes to the project.

  ```sh
  git switch main
  git pull upstream main
  From https://github.com/cloudflare/kumo
  * branch            main       -> FETCH_HEAD
  Already up to date.
  ```

#### For Cloudflare Employees

If you are a Cloudflare employee, you do not need to fork the repository - instead, you can clone the main repository directly. This allows you to push branches directly to the upstream repository.

If you find that you don't have write access, please reach out to your manager or the Kumo team internally.

Clone the main repository:

```sh
git clone https://github.com/cloudflare/kumo.git
cd kumo
```

Create new branches directly in the cloned repository and push them to the main repository:

```sh
git checkout -b <new-branch-name>
git push origin <new-branch-name>
```

### Install dependencies

This repository is setup as a [mono-repo](https://pnpm.io/workspaces) of workspaces. The workspaces are stored in the [`packages`](https://github.com/cloudflare/kumo/tree/main/packages) directory.

While each workspace has its own dependencies, you install the dependencies using `pnpm` at the root of the project.

> If you haven't used `pnpm` before, you can install it with `npm install -g pnpm`

- Install all the dependencies

  ```sh
  cd kumo
  pnpm install
  ```

## Checking the code

The code in the repository is checked for type checking, formatting, linting and testing errors when you push a commit.

When doing normal development, you may want to run these checks individually.

### Type Checking

The code is checked for type errors by [TypeScript](https://www.typescriptlang.org/).

- Type check all the code in the repository

  ```sh
  pnpm run typecheck
  ```

- VS Code will also run type-checking while editing source code, providing immediate feedback.

#### Changing TypeScript Version in VS Code's Command Palette

For TypeScript to work properly in the Monorepo the version used in VSCode must be the project's current TypeScript version, follow these steps:

1. Open the project in VSCode.

2. Press `Ctrl + Shift + P` (or `Cmd + Shift + P` on macOS) to open the command palette.

3. In the command palette, type "Select TypeScript Version" and select the command with the same name that appears in the list.

4. A submenu will appear with a list of available TypeScript versions. Choose the desired version you want to use for this project. If you have multiple versions installed, they will be listed here.
   - Selecting "Use Workspace Version" will use the version of TypeScript installed in the project's `node_modules` directory.

5. After selecting the TypeScript version, VSCode will reload the workspace using the chosen version.

Now you have successfully switched the TypeScript version used within the project via the command palette in VSCode.
Remember that this change is specific to the current project and will not affect other projects or the default TypeScript version used by VSCode.

### Linting

The code is checked for linting errors by [ESLint](https://eslint.org/).

- Run the linting checks

  ```sh
  pnpm run lint
  ```

- The repository has a recommended VS Code plugin to run ESLint checks while editing source code, providing immediate feedback.

### Formatting

The code is checked for formatting errors by [Prettier](https://prettier.io/).

- Use the following command to run prettier on the codebase

  ```sh
  pnpm run format
  ```

### Testing

Tests in a workspace are executed, by [Vitest](https://vitest.dev/), which is configured to automatically compile and bundle the TypeScript before running the tests.

- If you have recently rebased on `main` then make sure you have installed any new dependencies

  ```sh
  pnpm i
  ```

- Run the tests

  ```sh
  pnpm run test
  ```

## Steps For Making Changes

Every change you make should be stored in a [git commit](https://github.com/git-guides/git-commit).
Changes should be committed to a new local branch, which then gets pushed to your fork of the repository on GitHub.

- Ensure your `main` branch is up to date

  ```sh
  git switch main
  git pull upstream main
  ```

- Create a new branch, based off the `main` branch

  ```sh
  git checkout -b <new-branch-name> main
  ```

- Stage files to include in a commit
  - Use [VS Code](https://code.visualstudio.com/docs/editor/versioncontrol#_git-support)
  - Or add and commit files via the command line

  ```sh
  git add <paths-to-changes-files>
  git commit
  ```

- Push changes to your fork

  ```sh
  git push -u origin <new-branch-name>
  ```

- Once you are happy with your changes, create a Pull Request on GitHub
- The format for Pull Request titles is `[package name] description`, where the package name should indicate which package of the `kumo` monorepo your PR pertains to (e.g. `kumo`), and the description should be a succinct summary of the change you're making.
- GitHub will insert a template for the body of your Pull Request—it's important to carefully fill out all the fields, giving as much detail as possible to reviewers.

### Git Hygiene

Making sure your branch follows our recommendations for git will help ensure your PR is reviewed & released as quickly as possible:

- When opening a PR (before the first review), try and make sure your git commit history is clean, and clearly describes the changes you want to make.
- Once your PR has been reviewed, when addressing feedback try not to modify already reviewed commits with force pushes. This slows down the review process and makes it hard to keep track of what changes have been made. Instead, add additional commits to your PR to address any feedback (`git commit --fixup` is a helpful tool here).
- When merging your PR into `main`, `kumo` enforces squash merges. As such, please try and make sure that the commit message associated with the merge clearly describes the entire change your PR makes.

## PR Review

PR review is a critical and required step in the process for landing changes. This is an opportunity to catch potential issues, improve the quality of the work, celebrate good design, and learn from each other. As a reviewer, it's important to be thoughtful about the proposed changes and communicate any feedback.

## PR Previews

Every PR will have an associated pre-release build for all releasable packages within the repository, powered by [pkg.pr.new](https://github.com/stackblitz-labs/pkg.pr.new). You can find links to prereleases for each package in a comment automatically posted by GitHub Actions on each opened PR ([for example](https://github.com/cloudflare/kumo/pull/87#issuecomment-3908471698)).

## PR Tests

Every PR should include tests for the functionality that's being added. Most changes will be to [Kumo](packages/kumo/src/) (using Vitest), and should include unit tests within the testing harness of those packages. For documentation on how these testing frameworks work, see:

- Vitest: <https://vitest.dev/guide>

## Changesets

Every non-trivial change to the project - those that should appear in the changelog - must be captured in a "changeset".

See the [.changeset/README.md](.changeset/README.md) for detailed guidelines on:

- Creating changesets
- Choosing version types (patch/minor/major)
- Writing good changeset descriptions
- Formatting rules

Quick start:

```sh
pnpm changeset
git add .changeset/*.md
```

### Styleguide

When contributing to Kumo, please refer to the [`STYLEGUIDE.md file`](STYLEGUIDE.md) file where possible to help maintain consistent patterns throughout Kumo.

## Releases

We generally cut Kumo releases on every weekday. If you need a release cut outside of the regular cadence, please reach out to the [kumo-maintainers](https://github.com/orgs/cloudflare/teams/kumo-maintainers) team.
