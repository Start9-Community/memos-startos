<p align="center">
  <img src="icon.png" alt="Memos Logo" width="21%" />
</p>

# Memos on StartOS

> **Upstream docs:** <https://usememos.com/docs>
>
> Everything not listed in this document should behave the same as upstream
> Memos. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable.

Memos is an open-source, self-hosted note-taking service built for quick
capture. It stores notes as Markdown, runs as a single lightweight Go binary
with an embedded SQLite database, and exposes REST and gRPC APIs. Upstream:
<https://github.com/usememos/memos> (MIT).

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One unmodified upstream image, run as a single StartOS daemon:

| Daemon | Image | Architectures |
| --- | --- | --- |
| `memos` | `neosmemo/memos:0.30.0` | `x86_64`, `aarch64` |

The image has a real `ENTRYPOINT`:

```
['/usr/local/memos/entrypoint.sh', '/usr/local/memos/memos']
```

Consequences baked into this package:

- The entrypoint script `entrypoint.sh` starts as root, `chown -R
  10001:10001 /var/opt/memos`, then `exec su-exec 10001:10001 memos` — so the
  app process ends up non-root (UID/GID `10001` = the `nonroot` user). The
  StartOS-owned volume at `/var/opt/memos` is auto-chowned at every boot and
  the app writes succeed as nonroot.
- `useEntrypoint()` (no override) preserves that ENTRYPOINT+CMD. Because the
  image has a real entrypoint (not a CMD-only image), the
  "useEntrypoint-on-a-CMD-only-image" risk does NOT apply here.
- `su-exec` is an exec tool that replaces the process (like `gosu`), NOT a
  PID-1 init supervisor (s6/tini/dumb-init/supervisord), so `runAsInit` is
  intentionally left at its default.
- `MEMOS_UID` / `MEMOS_GID` are left at their default `10001` — the
  entrypoint chowns the mounted volume as root before dropping privileges.
  **Do NOT override them to 0** (that is the rootless-Docker case the
  entrypoint's `MEMOS_ENTRYPOINT_SWITCHED` guard protects against, and would
  make memos run as root permanently).

## Volume and Data Layout

One volume:

| Volume | Mount point | Contents |
| --- | --- | --- |
| `main` | `/var/opt/memos` | SQLite DB (`memos_prod.db`) + uploaded assets |

`store.json` lives at the root of the `main` volume. It holds the optional
`MEMOS_INSTANCE_URL` pin (see Quick Reference), seeded to `''` at install by
`init/seedFiles.ts` and NOT regenerated on restore.

## Installation and First-Run Flow

1. **No secrets are generated.** Memos uses SQLite with no password; the only
   persisted package state is `instanceUrl: ''` (auto-derive).
2. **No admin-credential action exists.** Memos has no CLI/gRPC subcommand to
   provision an admin. Sign-up is **open** by default and the first account
   created via the web UI becomes the **HOST** (admin). Close public sign-up
   afterward inside Memos's own admin Settings.
3. **`MEMOS_INSTANCE_URL` is derived** automatically from the live `ui`
   interface address (preferring publicly-reachable hosts). If no address is
    available, Memos runs privately. An **`optional`** task
    (`init/watchInstanceUrl.ts`) points RSS/webhook users at the **Set Instance
    URL** action.
4. Memos 0.30.0 applies its own SQLite migrations on startup; the package does
    not add a custom database migration.

## Configuration Management

| StartOS-Managed | Upstream / not yet exposed |
| --- | --- |
| `MEMOS_PORT` (fixed to `5230`) | External PostgreSQL/MySQL backend (`MEMOS_DRIVER=postgres\|mysql` + `MEMOS_DSN`) |
| `MEMOS_DATA` (fixed to `/var/opt/memos`) | SMTP/email config |
| `MEMOS_DRIVER` (fixed to `sqlite`) | AI/LLM provider configuration |
| `MEMOS_INSTANCE_URL` (auto-derived or pinned via the action) | Multi-user / SSO specifics |
| `MEMOS_LOG_LEVEL` (fixed to `info`) | |

## Network Access and Interfaces

| Interface | Internal port | Protocol | Purpose |
| --- | --- | --- | --- |
| `ui` | `5230` | `http` | The web UI (also serves the REST/gRPC API). Single exposed interface. |

No sidecars, no peer/SMTP/DB ports. Reachable via LAN IP, `.local`, `.onion`,
and custom StartOS domains like any UI interface.

## Actions (StartOS UI)

- **Set Instance URL** (`set-instance-url`)
  - *Purpose:* pin (or unpin via **Auto**) the origin used for
    `MEMOS_INSTANCE_URL`.
  - *Visibility:* always enabled; also surfaced as an `optional` task.
  - *Inputs:* a `dynamicSelect` of the `ui` interface's current non-local
    hostnames (plus an **Auto** option).
  - *Outputs:* the chosen host. The service restarts to apply it.
  - *When to use:* use a pinned stable external origin for RSS feeds, webhooks,
    or public anonymous access. **Auto** may derive a changing StartOS address;
    if no address is available, Memos remains private.

## Backups and Restore

`sdk.Backups.ofVolumes('main')` captures a whole-volume rsync of the `main`
volume:

| Backed up | How |
| --- | --- |
| SQLite DB + uploaded assets (`main` volume) | whole-volume rsync (includes `store.json`) |

The package declares a whole-volume backup of `main`, including the SQLite
database, uploaded assets, and `store.json`. Restoring is intended to bring
back notes, accounts, and uploaded assets; the service should then start
cleanly.

## Health Checks

| Daemon | Probe | Messages |
| --- | --- | --- |
| `memos` | `checkWebUrl http://127.0.0.1:5230/` (displayed), 30 s grace | "The web interface is ready" / "The web interface is not ready" |

`checkWebUrl` (not just port-listening) catches "port bound but app still
booting". 30 s grace is generous for a Go binary first boot.

## Dependencies

None. Memos uses an embedded SQLite database — no external DB or sidecars.

## Limitations and Differences

1. **No admin-credential action.** The first web sign-up becomes the HOST
   (admin). There is no CLI/API to provision an admin user upstream. Close
   public sign-up afterward in Memos's own Settings.
2. **`MEMOS_INSTANCE_URL` auto-derivation.** StartOS fronts the service with
   a reverse proxy reachable at several addresses; the package derives
   `MEMOS_INSTANCE_URL` from the `ui` interface's current public address
   (preferring clearnet/Tor, falling back to LAN). If no address is available,
    Memos remains private. For RSS/webhooks, pin the Instance URL to your
    registered external domain.
3. **SQLite only.** This package uses the embedded SQLite backend. External
   PostgreSQL/MySQL is out of scope for v1.
4. **Backup size** — uploaded assets under `/var/opt/memos` can grow with
   use. v1 backs up the whole volume (`ofVolumes`); switch that volume to
   `addSync` (incremental rsync) with an `exclude` for transient caches if it
   balloons.

## Memos 0.30.0 Upgrade Notes

- Instances without `MEMOS_INSTANCE_URL` are private; anonymous API access is
  restricted and RSS feeds are unavailable. Use a pinned stable URL when public
  access or RSS is required.
- Saved time filters using `now()` must use the 0.30.0 timestamp syntax.
- Shared-memo API clients must use the new shared-memo route and resource name.
- MCP clients must use `/mcp` and the new service-prefixed tool names.
- Existing instance tag settings are copied to users by the upstream SQLite
  migration on startup.

## What Is Unchanged from Upstream

- The web UI, REST/gRPC APIs, Markdown notes, tags, resources (attachments),
  and RSS follow the upstream docs, subject to the 0.30.0 changes above.
- The image's bundled entrypoint script (chown + su-exec) and non-root
  runtime model are unchanged.
- SQLite is the default DB backend (upstream default).

## Contributing

See [`AGENTS.md`](./AGENTS.md) for the agent workflow, the SDK pin rationale,
and how to inspect a running install. The remaining verification checklist
lives in [`TODO.md`](./TODO.md).

---

## Quick Reference for AI Consumers

```yaml
package_id: memos
architectures: [x86_64, aarch64]
image: neosmemo/memos:0.30.0
volumes:
  main: /var/opt/memos
ports:
  ui: 5230
dependencies: []
startos_managed_env_vars:
  - MEMOS_PORT            # 5230
  - MEMOS_DATA            # /var/opt/memos
  - MEMOS_DRIVER          # sqlite
  - MEMOS_INSTANCE_URL    # auto-derived from ui host, or pinned via Set Instance URL
  - MEMOS_LOG_LEVEL       # info
actions:
  - set-instance-url
store_json:
  instanceUrl: pinned MEMOS_INSTANCE_URL origin (empty = auto-derive; no address = private)
sdk: @start9labs/start-sdk@2.0.9
os_version: 0.4.0.1
```
