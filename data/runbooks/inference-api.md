# Inference API

AI Platform owns input validation and explicit model-version selection.

## Request checks

1. Confirm the input matches the versioned schema.
2. Reject an unknown model version rather than silently selecting another.
3. Return the actual selected version with the result.
4. Keep retries idempotent where callers submit the same request identifier.

## Before changing the contract

Exercise valid inputs, missing fields, unsupported versions, and malformed
payloads. Avoid storing user prompts in operational logs by default.

## Example data

The portal's passing CI badge refers only to the committed sample snapshot.
It does not prove that an inference endpoint is available.
