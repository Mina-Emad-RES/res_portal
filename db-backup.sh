#!/usr/bin/env bash
#
# db-backup.sh
# -----------------------------------------------------------------------------
# Dumps the project's PostgreSQL database (running inside the Docker container)
# and uploads the compressed backup to Google Drive via the OAuth refresh-token
# flow. Designed to be run from the project root (where docker-compose.yml and
# .env live), either manually or from cron.
#
# Requirements on the VPS: docker, curl, jq, gzip  (all standard).
# -----------------------------------------------------------------------------

set -euo pipefail

# ─────────────────────────── Resolve dir & load .env ─────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ENV_FILE="$SCRIPT_DIR/.env"
[[ -f "$ENV_FILE" ]] || { echo "ERROR: .env not found at $ENV_FILE" >&2; exit 1; }

# Load every KEY=VALUE in .env into the environment.
# Values containing spaces/special chars must be quoted in the .env file.
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

# ───────────────────────────────── Config ───────────────────────────────────
# Override any of these in .env if your setup differs.
CONTAINER_NAME="${POSTGRES_CONTAINER:-res_portal_postgres}"
BACKUP_DIR="${BACKUP_DIR:-$SCRIPT_DIR/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"   # local copies older than this are deleted

# ──────────────────────────────── Helpers ───────────────────────────────────
log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
die()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" >&2; exit 1; }

require_cmd() { command -v "$1" >/dev/null 2>&1 || die "'$1' is not installed."; }

require_var() {
  local name="$1"
  [[ -n "${!name:-}" ]] || die "Required variable '$name' is missing from .env"
}

# ─────────────────────────────── Pre-flight ─────────────────────────────────
require_cmd docker
require_cmd curl
require_cmd jq
require_cmd gzip

for v in POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD \
         GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET GOOGLE_REFRESH_TOKEN GOOGLE_DRIVE_FOLDER_ID; do
  require_var "$v"
done

docker ps --format '{{.Names}}' | grep -qx "$CONTAINER_NAME" \
  || die "Postgres container '$CONTAINER_NAME' is not running."

mkdir -p "$BACKUP_DIR"

TS="$(date +%Y-%m-%d_%H-%M-%S)"
FILENAME="${POSTGRES_DB}_${TS}.sql.gz"
BACKUP_PATH="$BACKUP_DIR/$FILENAME"

# Clean up a partial backup file if the script dies mid-way.
cleanup() { [[ -n "${BACKUP_OK:-}" ]] || rm -f "$BACKUP_PATH"; }
trap cleanup EXIT

# ──────────────────────────────── 1. Dump ───────────────────────────────────
log "Dumping database '$POSTGRES_DB' from container '$CONTAINER_NAME'..."

# Run pg_dump *inside* the container (no need for pg_dump on the host, and no
# version mismatch). Note: no '-t' on docker exec — a TTY would corrupt output.
docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" "$CONTAINER_NAME" \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges \
  | gzip -9 > "$BACKUP_PATH"

# Verify both pg_dump and gzip succeeded.
status=("${PIPESTATUS[@]}")
[[ "${status[0]}" -eq 0 ]] || die "pg_dump failed (exit ${status[0]})."
[[ "${status[1]}" -eq 0 ]] || die "gzip failed (exit ${status[1]})."
[[ -s "$BACKUP_PATH" ]]     || die "Backup file is empty."

SIZE="$(du -h "$BACKUP_PATH" | cut -f1)"
log "Backup created: $BACKUP_PATH ($SIZE)"

# ─────────────────────────── 2. Google access token ─────────────────────────
log "Requesting Google access token..."
ACCESS_TOKEN="$(curl -s --fail \
  https://oauth2.googleapis.com/token \
  -d client_id="$GOOGLE_CLIENT_ID" \
  -d client_secret="$GOOGLE_CLIENT_SECRET" \
  -d refresh_token="$GOOGLE_REFRESH_TOKEN" \
  -d grant_type=refresh_token | jq -r '.access_token // empty')"

[[ -n "$ACCESS_TOKEN" ]] || die "Could not obtain access token (check Google credentials)."

# ───────────────────── 3. Resumable upload to Drive ─────────────────────────
# Resumable upload is used so large dumps stream reliably without being held
# in memory. Step A: open a session (gets an upload URL). Step B: PUT the file.
log "Initiating Google Drive upload session..."

METADATA="$(jq -n \
  --arg name "$FILENAME" \
  --arg folder "$GOOGLE_DRIVE_FOLDER_ID" \
  '{name: $name, parents: [$folder]}')"

UPLOAD_URL="$(curl -s -X POST \
  -D - -o /dev/null \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json; charset=UTF-8" \
  -H "X-Upload-Content-Type: application/gzip" \
  --data "$METADATA" \
  "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true" \
  | tr -d '\r' | awk -F': ' 'tolower($1)=="location"{print $2}')"

[[ -n "$UPLOAD_URL" ]] || die "Failed to start upload session (check folder ID / Drive API enabled)."

log "Uploading $FILENAME to Google Drive..."
UPLOAD_RESPONSE="$(curl -s --fail -X PUT \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/gzip" \
  -T "$BACKUP_PATH" \
  "$UPLOAD_URL")" || die "Upload failed."

FILE_ID="$(echo "$UPLOAD_RESPONSE" | jq -r '.id // empty')"
[[ -n "$FILE_ID" ]] || die "Upload returned no file id. Response: $UPLOAD_RESPONSE"

log "Upload complete. Google Drive file id: $FILE_ID"
BACKUP_OK=1   # tells the trap not to delete the local file

# ───────────────────────── 4. Local retention ───────────────────────────────
if [[ "$RETENTION_DAYS" -ge 0 ]]; then
  log "Removing local backups older than $RETENTION_DAYS day(s)..."
  find "$BACKUP_DIR" -maxdepth 1 -type f -name '*.sql.gz' -mtime +"$RETENTION_DAYS" -print -delete \
    | sed 's/^/  deleted: /' || true
fi

log "Done."
