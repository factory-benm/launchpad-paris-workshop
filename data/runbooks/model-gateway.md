# Model Gateway

AI Platform owns the request contract between applications and model providers.
Provider adapters normalize responses before returning them to callers.

## The sample failure

The committed CI snapshot describes an adapter returning an unexpected response
shape. It is a teaching example, not an active provider outage.

## Investigation sequence

1. Identify which adapter changed.
2. Compare its output with the documented response schema.
3. Add the rejected response to the contract-test fixtures.
4. Verify both the success and provider-error paths.

## Acceptance criteria

- The response includes the selected model identifier.
- Missing usage metadata stays explicitly unknown, not zero.
- Provider errors retain enough context to diagnose without exposing secrets.
- A schema change requires a deliberate caller migration.

## Ownership

Escalate contract changes to AI Platform. Keep provider credentials out of
fixtures, runbooks, screenshots, and logs.
