# Visit Photo Rules

## Haircut Photos

- Show a warning when `is_haircut = true` and the visit has no photos.
- Only `barber` role can upload haircut photos.
- Other roles can view photos only.

## Storage

- Haircut photo changes may involve Cloudflare R2 and related API/server utilities.
- Preserve tenant and visit ownership checks before allowing upload, delete, or listing behavior.
