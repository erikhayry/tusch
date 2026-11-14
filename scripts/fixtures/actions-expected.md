# Agent actions

3 run digests.

## Runs per skill

| Skill | Runs | Avg turns | Avg cost |
| --- | ---: | ---: | ---: |
| develop | 2 | 7.0 | $0.31 |
| review | 1 | 6.0 | $0.30 |

## Repeated Bash command prefixes

| Prefix | Calls | Runs |
| --- | ---: | ---: |
| pnpm run | 5 | 2 |
| gh issue | 3 | 2 |
| gh pr | 2 | 1 |
| pnpm exec | 2 | 1 |

## Denied commands

| Command | Denials | Runs |
| --- | ---: | ---: |
| gh issue | 2 | 2 |
| pnpm exec | 1 | 1 |

## Files read more than once in a run

| File | Runs | Reads |
| --- | ---: | ---: |
| src/lib/x.ts | 2 | 5 |
| src/routes/y.ts | 1 | 2 |

## Runs

- develop 84 (success): https://github.com/erikhayry/tusch/actions/runs/1001
- develop 85 (success): https://github.com/erikhayry/tusch/actions/runs/1002
- review 86 (failure): https://github.com/erikhayry/tusch/actions/runs/1003
