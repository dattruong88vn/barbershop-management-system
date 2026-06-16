# ADR-0003: Feedback Notification Flow

## Status

Accepted

## Context

Successful actions often navigate immediately after mutation. Inline toasts can be lost during route changes, and each module implementing its own notification behavior creates inconsistent UX.

## Decision

Successful runtime app actions use the global Feedback notification flow. When an action navigates after success, dispatch feedback before `router.push`.

## Consequences

- Modules should not render the global `Toast` component directly for runtime notifications.
- `Toast` remains available as a design-system reference component.
- Success/error/warning feedback stays consistent across routes.
