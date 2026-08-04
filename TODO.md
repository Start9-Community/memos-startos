# TODO

Deferred items + the verification checklist for this v1. The implementation
plan lives in `plan.md`; the SDK is pinned to `1.5.3` (see `AGENTS.md` and the
workspace `AGENTS.local.md`).

## Pending verification (must run on a real StartOS 0.4.0-beta.9 box)

A clean `tsc` + `s9pk pack` does NOT prove the service runs. From `plan.md` §8-9:

- [ ] `make x86 install` builds + installs `memos.s9pk`.
- [ ] **Install completes**. Watch for the SDK-2.x "install stuck" symptom
      (`container ID = N/A`, never created) — if seen, the SDK is wrong,
      re-pin `1.5.3`. (Verified pinned: `node_modules/@start9labs/start-sdk`
      `package.json` `"version"` = `1.5.3`.)
- [ ] `memos` daemon goes green (logs: entrypoint chowns volume, su-exec
      drops to 10001, memos binds 5230).
- [ ] Open the web UI → **create the first account** → log in → confirm
      admin (create a memo, upload an attachment → verify the DB row + asset
      file land on the `main` volume at `/var/opt/memos`, owner `10001`).
- [ ] In Memos Settings → **disable public sign-up** → confirm further
      sign-ups are rejected. Re-enable to confirm the toggle works.
- [ ] **Backup** → fresh install → **restore** → confirm notes + accounts +
      assets survive and the service restarts cleanly.
- [ ] Restart the service → daemon comes back up.
- [ ] (If feasible) confirm reactive `MEMOS_INSTANCE_URL` follows a
      gateway/hostname enable/disable.

## Open risks from `plan.md` §12

- [ ] **Volume ownership / non-root runtime.** The image's `entrypoint.sh`
      runs as root, chowns `/var/opt/memos` to `10001:10001`, then exec su-exec
      `10001:10001 memos`. Runtime-verify: create a memo + upload an
      attachment, then `start-cli package attach memos -n memos -- ls -la
      /var/opt/memos` (owner should be `10001`). Do NOT set `MEMOS_UID=0` /
      `MEMOS_GID=0`.
- [ ] **`useEntrypoint()` firing.** The image has a real `Entrypoint`
      (`['/usr/local/memos/entrypoint.sh','/usr/local/memos/memos']`), not a
      CMD-only image — confirm first boot starts and binds 5230 (logs). No
      fallback argv needed.
- [ ] **Reactive `MEMOS_INSTANCE_URL`.** Confirm `setupMain` re-runs when a
      gateway/hostname is enabled or disabled so the env follows. If
      reactivity misbehaves, the **Set Instance URL** action is the manual
      fallback source of truth.
- [ ] **Backup correctness for SQLite.** Restore must yield a bootable DB
      (service starts, notes present). Whole-volume rsync while stopped is
      expected-safe; verify with a real backup→fresh-install→restore round-trip.
- [ ] **First user = admin.** Confirm the first web sign-up becomes HOST/admin
      and that closing public sign-up in Memos Settings actually rejects
      further sign-ups.
- [ ] **Reverse-proxy auth traps.** Verify a real login works through the
      dashboard address (not just loopback). Check Memos's logs for any
      host-header/CSRF rejection, and check for a "trust localhost" auth bypass
      that would let proxy-local requests skip login. Disable such guards if
      found.
- [ ] **CLI/API admin provisioning check.** Confirm Memos genuinely has no
      CLI/gRPC subcommand to provision an admin (repo: `usememos/memos`
      `cmd/memos/`). If one exists, prefer it over leaving sign-up open.

## Future work

- [ ] **External PostgreSQL/MySQL backend** (`MEMOS_DRIVER=postgres|mysql` +
      `MEMOS_DSN`). Add as an optional sidecar if ever needed.
- [ ] **SMTP config action** so Memos can send notifications.
- [ ] **AI/LLM provider configuration** surfaced via actions.
- [ ] Reconsider `hardwareRequirements.ram` (currently `256`) after measuring
      real RSS.
