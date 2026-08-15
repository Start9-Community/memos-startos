# Memos

## Documentation

- [Memos documentation](https://usememos.com/docs) — how to use Memos and what each feature does.
- [Docker deployment guide](https://usememos.com/docs/deploy/docker) — how the image is configured upstream.
- [Upstream README](https://github.com/usememos/memos#readme) — feature overview and screenshots.

## What you get on StartOS

Memos on StartOS runs the official `neosmemo/memos` image as a single daemon
with an embedded SQLite database, fronted by a single web address.

- The **web interface** is the only exposed port (internal `5230`). Open it
  from your Dashboard to sign in, create notes, and upload resources.
- **Data** (the SQLite DB `memos_prod.db` and uploaded assets) persists on the
  `main` volume under `/var/opt/memos`.
- **No sidecars** — SQLite is embedded, so there is no external database to
  manage.
- The app runs as a **non-root** user (UID/GID `10001`); the image's
  entrypoint auto-chowns the data volume at every boot.

## Getting set up

> **`<service-address>`** below is the URL shown on your service's page in the
> StartOS dashboard (the "Web Interface" link).

1. Open the service from your **Dashboard**.
2. Because Memos has no CLI/API to provision an admin user, **sign-up is open
   by default**. Open the web interface and **create your first account** — it
   becomes the HOST (admin).
3. Once you have an account, open **Memos Settings** (in the web UI) and
   **disable public sign-up** if you don't want others to register.

That's all that's required for normal use. Memos 0.30.0 is private when no
instance URL is available. If you use **RSS feeds, webhooks, or public
anonymous access**, there is one extra step — see below.

## RSS / Webhooks — pin the Instance URL

Memos uses `MEMOS_INSTANCE_URL` to build absolute URLs and determine whether
an instance is public. Because a StartOS service is reachable at several
addresses (LAN, Tor, clearnet), the package **derives** `MEMOS_INSTANCE_URL`
automatically from the web interface's current public address when available.
If no address is available, Memos runs in private mode until an address is
available or you pin one. **Auto** can derive a changing StartOS address, so
pin a stable external domain for RSS, webhooks, or public anonymous access.

RSS/webhooks and public anonymous access require an instance URL that resolves
to a stable external domain. For those, you should **pin** the Instance URL
to your external domain:

1. Open **Actions → Set Instance URL**.
2. Pick your externally-registered host from the list (or **Auto** to clear a
   pin and go back to automatic derivation).
3. The service restarts automatically and `MEMOS_INSTANCE_URL` follows your
   choice.

## Actions

- **Set Instance URL** — pins (or unpins, via **Auto**) the hostname Memos
  uses for `MEMOS_INSTANCE_URL`. An instance URL enables public anonymous access
  and is required for RSS feeds or webhooks.

## Notes

- The first account created becomes the HOST (admin). Close public sign-up in
  Memos Settings afterward if you don't want further registrations.
- Backing up the service captures the full `main` volume (SQLite DB + uploaded
  assets). Restoring brings back your notes, accounts, and resources.
- Memos 0.30.0 changed saved time-filter syntax, shared-memo API routes, and
  MCP endpoint/tool names. Update clients using those features according to
  the upstream release notes.
