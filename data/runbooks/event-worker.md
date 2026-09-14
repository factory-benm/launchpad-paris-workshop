# Event Worker

This fictional worker has a runbook but no assigned owner. A passing test
snapshot does not resolve that ownership gap.

## Retry checklist

1. Distinguish transient errors from invalid event payloads.
2. Preserve an idempotency key across retries.
3. Bound the number of attempts.
4. Route exhausted messages to a queue with a clear review process.

## Ownership handoff

An owning team should accept responsibility before changing `owner` from `null`
in `data/catalog.json`. Do not infer ownership from the implementation language.

## Workshop exercise

An Attention view should report this service as unowned even though its sample
CI state is `passed`.
