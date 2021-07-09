[![CI](https://github.com/allegro-actions/artifactory-publish/actions/workflows/ci.yml/badge.svg)](https://github.com/allegro-actions/artifactory-publish/actions/workflows/ci.yml)

# allegro-actions/artifactory-publish

This action packages (zip) and uploads your application to artifactory.

## Basic usage:

```
steps:
  - uses: allegro-actions/artifactory-publish@v1
    with:
      host: company.artifactory.allegro
      username: artifactory-username
      password: artifactory-password
      name: opbox-core
      group: pl.allegro.opbox
      buildDir: ./build
      version: 1.0.0-SNAPSHOT
```

## Outputs

`url` - uploaded artifact url

## Use cases

This action works great with [https://github.com/allegro-actions/next-version](allegro-actions/next-version).

```yaml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0

  - name: get next version
    id: 'bump'
    uses: allegro-actions/next-version@v1

  - name: git tag
    if: github.ref == 'refs/heads/master'
    run: |
      git tag ${{ steps.bump.outputs.version }}
      git push origin HEAD --tags

  - uses: allegro-actions/artifactory-publish@v1
    with:
      host: company.artifactory.allegro
      username: ${{ secrets.ARTIFACTORY_USERNAME }}
      password: ${{ secrets.ARTIFACTORY_PASSWORD }}
      name: opbox-core
      group: pl.allegro.opbox
      buildDir: ./build
      version: ${{ steps.bump.outputs.version }}
  ```

Access uploaded artifact

```yaml
  - name: 'upload file1'
    id: upload1
    uses: allegro-actions/artifactory-publish@v1
    with:
      host: company.artifactory.allegro
      username: ${{ secrets.ARTIFACTORY_USERNAME }}
      password: ${{ secrets.ARTIFACTORY_PASSWORD }}
      name: opbox-core
      group: pl.allegro.opbox
      buildDir: ./build-core
      version: 1.0.0

  - name: 'upload file2'
    id: upload2
    uses: allegro-actions/artifactory-publish@v1
    with:
      host: company.artifactory.allegro
      username: ${{ secrets.ARTIFACTORY_USERNAME }}
      password: ${{ secrets.ARTIFACTORY_PASSWORD }}
      name: opbox-web
      group: pl.allegro.opbox
      buildDir: ./build-web
      version: 2.0.0

  - run: 'echo $FILE1 $FILE2'
    env:
      FILE1: ${{ steps.upload1.outputs.url }}
      FILE2: ${{ steps.upload2.outputs.url }}
  ```