# Eval Runner

AI Platform owns repeatable evaluation jobs and their result artifacts.

## Reading a run

1. Check the dataset and template versions.
2. Check whether every case has completed.
3. Keep unfinished cases out of success-rate denominators.
4. Separate execution errors from failed evaluation criteria.

## A useful result artifact

Record the dataset version, model configuration, case identifiers, outputs,
and evaluation criteria. Avoid copying secrets or private prompts into reports.

## In-progress snapshot

The committed example has state `running`. That means it was in progress at the
snapshot time. This portal does not start a real job, poll for completion, or
advance the state as time passes.
