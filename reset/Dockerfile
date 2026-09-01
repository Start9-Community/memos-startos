# The memos image carries only busybox and the server binary, so the password
# reset needs its own sqlite3.
FROM alpine:3.22

RUN apk add --no-cache sqlite

ENTRYPOINT ["/bin/sh"]
