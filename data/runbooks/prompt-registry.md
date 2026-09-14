# Prompt Registry

Versioned templates define their required input variables and output contracts.
Applications pin a template version instead of consuming a mutable latest value.

## Change process

1. Create a new template version.
2. Document added or removed variables.
3. Validate missing variables and literal braces.
4. Run representative evaluation cases before changing a caller's pin.

## Review questions

- Is untrusted input clearly separated from instructions?
- Can a caller reproduce the previous template?
- Does the output contract remain compatible?

## Workshop boundary

This record describes a fictional library. The developer portal does not make
model calls or evaluate prompts.
