# ADR-0004: Staff Mobile Workflow

## Status

Accepted

## Context

Receptionist, barber, and skinner workflows happen primarily on phones or tablets in the shop. Desktop workflow for these roles adds design and testing cost without being part of the MVP operating model.

## Decision

Staff roles use mobile/tablet workflows below the desktop breakpoint. At `1024px+`, staff roles see the global mobile-only fallback instead of desktop workflow UI.

## Consequences

- `receptionist`, `barber`, and `skinner` screens should not render staff workflow desktop UI.
- Owner, manager, and superadmin retain desktop-oriented layouts.
- UI specs and navigation docs must document staff desktop fallback behavior.
