[![CI](https://github.com/allegro-actions/artifactory-publish/actions/workflows/ci.yml/badge.svg)](https://github.com/allegro-actions/artifactory-publish/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/allegro-actions/artifactory-publish/branch/main/graph/badge.svg?token=YNK3XCBRY4)](https://codecov.io/gh/allegro-actions/artifactory-publish)
[![usage](https://gh-stats.app/badge?action=allegro-actions/artifactory-publish)](https://gh-stats.app/badge?action=allegro-actions/artifactory-publish)

# allegro-actions/artifactory-publish

Action created for easy artifactory publications.

## artifactory-publish/maven

This action packages (zip) and uploads your application to artifactory. By default, it handles fat-jars. This action can
also be used to package a directory.

### Basic usage:

```
steps:
  - uses: allegro-actions/artifactory-publish/maven@v1
    with:
      host: company.artifactory.allegro
      username: ${{ secrets.ARTIFACTORY_USERNAME }}
      password: ${{ secrets.ARTIFACTORY_PASSWORD }}
      name: opbox-core
      group: pl.allegro.opbox
      version: 1.0.0-SNAPSHOT
```

or

```
steps:
  - uses: allegro-actions/artifactory-publish/maven@v1
    with:
      host: company.artifactory.allegro
      username: ${{ secrets.ARTIFACTORY_USERNAME }}
      password: ${{ secrets.ARTIFACTORY_PASSWORD }}
      name: opbox-core
      group: pl.allegro.opbox
      buildDir: ./build
      version: 1.0.0-SNAPSHOT
```

### Outputs

No outputs.

## artifactory-publish/docker

This action publishes docker image to artifactory docker storage.

```
steps:
  - uses: allegro-actions/artifactory-publish/docker@v1
    with:
      host: company.artifactory.allegro
      username: ${{ secrets.ARTIFACTORY_USERNAME }}
      password: ${{ secrets.ARTIFACTORY_PASSWORD }}
      name: opbox-core
      path: workshops/images
      version: 1.0.0-SNAPSHOT
```

Optionally, you can also specify `context`, `dockerfile` and `buildArgs`:

```
steps:
  - uses: allegro-actions/artifactory-publish/docker@v1
    with:
      host: company.artifactory.allegro
      username: ${{ secrets.ARTIFACTORY_USERNAME }}
      password: ${{ secrets.ARTIFACTORY_PASSWORD }}
      name: opbox-core
      path: workshops/images
      version: 1.0.0-SNAPSHOT
      context: src
      dockerfile: docker/Dockerfile
      buildArgs: |
        ARG1=foo
        ARG2=bar
```

## artifactory-publish/npm

This action publishes npm package to artifactory npm registry.

When running on `main` or `master` branch this action will publish your package with `latest` npm tag.
If you're running on a different branch your package will be available with npm tag containing current branch name.

For example - if you run this action on `feature/TICKET-1234-good-stuff` branch, you will be able to install it using: `npm install my-package@feature-TICKET-1234-good-stuff`.

```
steps:
  - uses: allegro-actions/artifactory-publish/npm@v1
    with:
      host: company.artifactory.allegro
      email: ${{ secrets.ARTIFACTORY_EMAIL }}
      password: ${{ secrets.ARTIFACTORY_PASSWORD }}
```

## Use cases

This action works great with [allegro-actions/next-version](https://github.com/allegro-actions/next-version).

```yaml
steps:
    ...
- name: get next version
  id: 'bump'
  uses: allegro-actions/next-version@v1
- name: Push new tag on master
  if: github.ref == 'refs/heads/master'
  uses: allegro-actions/create-tag@v1
  with:
    tag: ${{ steps.bump.outputs.next_tag }}
    current-tag: ${{ steps.bump.outputs.current_tag }}

- uses: allegro-actions/artifactory-publish/maven@v1
  with:
    host: company.artifactory.allegro
    username: ${{ secrets.ARTIFACTORY_USERNAME }}
    password: ${{ secrets.ARTIFACTORY_PASSWORD }}
    name: opbox-core
    group: pl.allegro.opbox
    version: ${{ steps.bump.outputs.next_version }}
    ...
```
