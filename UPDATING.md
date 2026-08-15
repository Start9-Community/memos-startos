# Updating Memos

This package wraps the upstream `neosmemo/memos` Docker image. The current
image pin is `images.memos.source.dockerTag` in
`startos/manifest/index.ts`. StartOS package versions use
`<upstream-version>:<wrapper-version>` in `startos/versions/current.ts`.

## Determine The Upstream Version

1. Read the latest stable release from
   <https://github.com/usememos/memos/releases>.
2. Confirm the matching Docker tag exists in `neosmemo/memos`. GitHub release
   tags use a `v` prefix, while Docker tags do not; for example, GitHub
    `v0.30.0` maps to Docker `neosmemo/memos:0.30.0`.
3. Inspect the Docker manifest and confirm `linux/amd64` and `linux/arm64`
   images exist before retaining both StartOS architectures.
4. Read upstream release notes and migration guidance. Check for changes to
   the entrypoint, UID/GID, `/var/opt/memos`, port `5230`, environment
   variables, database behavior, and health endpoint.

Do not infer a Docker tag or architecture from the GitHub release alone.

## Apply The Update

1. Update `images.memos.source.dockerTag` in
   `startos/manifest/index.ts`.
2. Update `version` and localized `releaseNotes` in
   `startos/versions/current.ts`. Keep `current.ts` unless the update needs a
   migration; a released version alone does not require a new version file.
3. Update version-specific image references in `README.md` and any affected
   user guidance in `instructions.md`.
4. Run `npm install` only when dependencies changed; otherwise preserve the
   lockfile.
5. Run `npm run check`, `npm run build`, and pack the target architecture.
6. Install on the configured StartOS test host and complete the runtime,
   persistence, restart, backup, and restore checks in `TODO.md`.

Do not call an update complete based only on TypeScript or pack success.
