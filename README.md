# Simon Gatsby

GitHub Action to build and deploy your Gatsby site to GitHub Pages

## Usage

This GitHub Action will run `gatsby build` at the root of your repository and
deploy it to GitHub Pages for you! Here's a basic workflow example:

```yml
name: Gatsby Publish

on:
  push:
    branches:
      - dev

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - uses: simonagren/simon-gatsby-gh-pages@v1.1
        with:
          access-token: ${{ secrets.ACCESS_TOKEN }}
```

### Settings

- **access-token**: A [GitHub Personal Access Token][github-access-token] with
  the `repo` scope. This is **required** to push the site to your repo after
  Gatsby finish building it. You should store this as a [secret][github-repo-secret]
  in your repository. Provided as an [input][github-action-input].

- **deploy-branch**: The branch expected by GitHub to have the static files
  needed for your site. For org and user pages it should always be `master`.
  This is where the output of `gatsby build` will be pushed to. Provided as an
  [input][github-action-input].
  Defaults to `master`.

- **deploy-repo**: The repository expected by GitHub to have the static files
  needed for your site.
  Provided as an [input][github-action-input].
  Defaults to the same repository that runs this action.

- **gatsby-args**: Additional arguments that get passed to `gatsby build`. See the
  [Gatsby documentation][gatsby-build-docs] for a list of allowed options.
  Provided as an [input][github-action-input].
  Defaults to nothing.

- **skip-publish**: Builds your Gatsby site but skips publishing by setting it to `true`,
  effectively performing a test of the build process using the live configuration.
  Provided as an [input][github-action-input].
  Defaults to **false**

- **working-dir**: The directory where your Gatsby source files are at. `gatsby build`
  will run from this directory.
  Provided as an [input][github-action-input].
  Defaults to the project's root.

- **public-dir**: The public directory where the files are publishes. 
  Provided as an [input]  [github-action-input].
  Defaults to the Public folder in the project's root.
  
- **git-config-name**: Provide a custom name that is used to author the git commit, which
  is pushed to the deploy branch.
  Provided as an [input][github-action-input].
  Defaults to the GitHub username of the action actor.

- **git-config-email**: Provide a custom email that is used to author the git commit, which
  is pushed to the deploy branch.
  Provided as an [input][github-action-input].
  Defaults to `{actor}@users.noreply.github.com`, where `{actor}` is the GitHub username 
  of the action actor.
