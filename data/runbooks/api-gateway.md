# API Gateway

The sample platform's entry point for product API traffic. Platform owns
routing rules, quota policies, and request-ID propagation.

## First checks

1. Identify the affected route and request ID.
2. Compare the route's upstream selection with the intended service.
3. Distinguish a quota rejection from an upstream timeout.
4. Confirm that a retry won't duplicate a write.

## Validation before a change

- A known route resolves to the correct upstream.
- An unknown route produces a clear not-found response.
- Requests above quota receive a useful retry signal.
- Request IDs survive downstream forwarding.

## Workshop boundary

This is a fictional service record, not a running gateway. Inspect its example
CI record in `data/ci-snapshots.json`. No credentials or operational commands
are needed to use this portal.
