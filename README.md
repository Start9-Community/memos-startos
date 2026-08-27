<p align="center">
  <img src="icon.png" alt="Memos Logo" width="21%">
</p>

# Memos on StartOS

> Everything not listed in this document should behave the same as upstream
> Memos. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

Memos is a self-hosted note-taking service that stores notes as Markdown in an
embedded SQLite database and exposes them over REST and gRPC. This package runs
the upstream image unmodified and derives the one setting that a StartOS
service cannot know for itself: the origin Memos advertises to the outside
world.

- **Upstream repo:** <https://github.com/usememos/memos>
- **Wrapper repo:** <https://github.com/Start9-Community/memos-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The upstream image, run unmodified, plus a small one this repository builds.

| Property      | Value                                            |
| ------------- | ------------------------------------------------ |
| Images        | `neosmemo/memos`, plus `reset` built from `reset/` |
| Architectures | x86_64, aarch64                                   |
| Command       | the image's own entrypoint                        |

| Subcontainer | Purpose                                                       |
| ------------ | ------------------------------------------------------------- |
| `memos`      | The only daemon — the one to `attach` to                      |
| `reset`      | Alpine with `sqlite3`, run on demand by **Reset Admin Password** |

The `reset` image exists because the upstream one carries busybox and a static
Go binary and nothing else — no `sqlite3`, no interpreter — so there is no way
to reach the database from inside it.

The entrypoint starts as root, chowns the data volume to UID/GID `10001`, then
drops to that user for the life of the process. The package leaves `MEMOS_UID`
and `MEMOS_GID` unset so that sequence runs as upstream intends; the volume is
re-chowned on every boot, so a restored or hand-copied volume repairs itself.

## Volume and Data Layout

One volume holding everything Memos persists.

| Volume | Mount Point      | Purpose                                                |
| ------ | ---------------- | ------------------------------------------------------ |
| `main` | `/var/opt/memos` | SQLite database, uploaded attachments, and `store.json` |

Memos runs on its embedded SQLite backend. There is no external database, no
sidecar, and nothing outside this volume to preserve.

## File Models

One model, and it holds StartOS-side state rather than Memos configuration.

| Model        | File                          | Format |
| ------------ | ----------------------------- | ------ |
| `store.json` | `store.json` on `main`'s root | JSON   |

It holds a single key, `instanceUrl` — the origin pinned through the **Set
Instance URL** action. It is seeded to `""` on install only, and a restore
carries the user's pin forward untouched. An empty value means "derive at
runtime"; a non-empty value is used verbatim and is never re-asserted by the
package, so a pin survives address changes until the user clears it.

Everything else Memos needs is delivered as an environment variable, re-read on
every launch: `MEMOS_PORT`, `MEMOS_DATA`, `MEMOS_DRIVER`, `MEMOS_LOG_LEVEL`,
and `MEMOS_INSTANCE_URL`. Memos owns its own settings database for everything
the user configures in the web UI; the package does not write to it.

## Dependencies

None.

## Network Access and Interfaces

One interface, serving both the web UI and the API.

| Interface | Id   | Type | Port | Description                                    |
| --------- | ---- | ---- | ---- | ---------------------------------------------- |
| Web Interface | `ui` | ui | 5230 | The Memos UI, and its REST and gRPC endpoints |

`MEMOS_INSTANCE_URL` is derived from this interface's enabled addresses,
preferring a publicly reachable one and falling back to any non-local address.
The value is resolved when the daemon starts, so a service that has just gained
or lost an address may need a restart before Memos advertises the new one. An
origin pinned through the action is applied immediately.

## Installation and First-Run Flow

Nothing is generated and nothing is pre-configured. Memos has no way to
provision an administrator from the command line, so registration is open on a
fresh install and **the first account created through the web UI becomes the
administrator**. Closing sign-up afterwards is done inside Memos' own settings,
not through StartOS.

Memos applies its own SQLite schema migrations on startup; the package adds
none.

## Actions

Two actions, neither needed on an ordinary day.

**Set Instance URL** (`set-instance-url`)

- **When to run it** — when RSS feeds, webhooks, or public anonymous access
  must resolve to a stable external domain. Memos builds absolute URLs from
  `MEMOS_INSTANCE_URL`, and the derived value follows whichever address the
  user currently has enabled, which can change.
- **What it changes** — the `instanceUrl` key in `store.json`. Nothing inside
  Memos' own database is touched.
- **Cost** — the daemon restarts to pick up the new environment; a few seconds
  of downtime.
- **Repeat safety** — idempotent. Re-running with the same choice is a no-op;
  choosing **Auto** clears the pin and returns to derivation.
- **Outputs** — the origin now in effect.

The input is a dropdown of the `ui` interface's currently reachable non-local
addresses, built when the form opens. An install with no non-local address
enabled offers only **Auto** — see [Limitations](#limitations-and-differences).

**Reset Admin Password** (`reset-password`)

- **When to run it** — the administrator has lost their password. Memos has no
  password-recovery flow of its own and no CLI, so without this the account is
  unreachable and the notes behind it are unreadable.
- **What it changes** — the `password_hash` of the lowest-numbered account
  holding the owner role, written straight into the SQLite database. Nothing
  else in the database is touched, and no other account is affected.
- **Cost** — seconds. The service must be **stopped**, because the database is
  a file on the volume and nothing may hold it open while it is rewritten.
- **Repeat safety** — safe to repeat; each run mints a new password and
  invalidates the previous one.
- **What happens next** — start the service and sign in with the credentials
  returned. Existing sessions are not revoked, matching what upstream does on
  an ordinary password change.
- **Outputs** — the account's username, and the new password, masked and
  copyable. It is shown once per run.

## Tasks

One task, and it never blocks the service.

| Task            | Severity   | Raised by                     |
| --------------- | ---------- | ----------------------------- |
| Set Instance URL | `optional` | Every init, on every start    |

It is a standing reminder that RSS and webhook users should pin an origin. It
is raised unconditionally rather than on a condition, so it is present from the
first start; running the action satisfies it, and satisfying it is permanent —
the replay key is stable, so later starts do not raise it again.

## Health Checks

One check, on the only daemon.

| Check   | Displayed       | Method                        | Grace |
| ------- | --------------- | ----------------------------- | ----- |
| `memos` | "Web Interface" | HTTP GET on the internal port | 30 s  |

An HTTP probe rather than a port check, so "listening but not serving" reads as
not-ready. A failure past the grace period means the Go binary exited or could
not open its database — the service logs name the reason, and a permissions
problem on the data volume is the usual one.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`.
StartOS stops the service before the copy runs, so the SQLite database is
quiescent and needs no dump step.

That single volume is everything: notes, accounts, attachments, Memos' own
settings, and the package's `store.json`. A restored instance is usable
immediately with no resync and no credential to re-enter.

## Limitations and Differences

1. **SQLite only.** Memos also supports PostgreSQL and MySQL backends; this
   package does not expose them.
2. **No administrator is provisioned.** Upstream offers no CLI or API to create
   one, so the first web sign-up takes the role and closing registration is
   done inside Memos. Recovering a lost password is the **Reset Admin
   Password** action's job — Memos itself has no recovery flow.
3. **A private instance advertises no origin.** With no non-local address
   enabled, `MEMOS_INSTANCE_URL` is empty and Memos treats itself as private:
   RSS feeds and public anonymous access are unavailable until an address
   exists or one is pinned.
4. **Attachments are backed up in full.** The volume is copied rather than
   synced incrementally, so backup size tracks total attachment size.

---

## Quick Reference for AI Consumers

```yaml
package_id: memos
image: neosmemo/memos # plus a locally built `reset` image
architectures:
  - x86_64
  - aarch64
subcontainers:
  - memos # the daemon
  - reset # sqlite3, run on demand by reset-password
volumes:
  main: /var/opt/memos
file_models:
  - store.json
startos_managed_env_vars:
  - MEMOS_PORT
  - MEMOS_DATA
  - MEMOS_DRIVER
  - MEMOS_INSTANCE_URL
  - MEMOS_LOG_LEVEL
dependencies: []
interfaces:
  ui: { type: ui, port: 5230 }
actions:
  - set-instance-url
  - reset-password
tasks:
  - { action: set-instance-url, severity: optional }
health_checks:
  - memos # displayed "Web Interface"
```
