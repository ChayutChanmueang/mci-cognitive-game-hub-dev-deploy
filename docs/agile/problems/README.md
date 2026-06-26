# Problem Records (Root-Cause Log)

Deep root-cause write-ups for recurring or instructive defects — **why** a bug happened and **how to avoid repeating the same approach**. These complement the short [bug reports](../reports/bugs/) (which track *what* broke and its status); a Problem Record explains the underlying mechanism and the rule to follow next time.

## Numbering: `PB-XX-XX`
- **First `XX`** = problem number (a problem *theme/area*, e.g. `01` = Routing & async data-load races).
- **Second `XX`** = sub-problem (a specific instance within that theme).

So `PB-01-02` would be the second concrete issue under problem theme #01.

## Index
| ID | Title | Theme | Status | Related Bug |
| --- | --- | --- | --- | --- |
| [PB-01-01](./PB-01-01.md) | Stale async route handler renders over the current screen ("bounce back to Game Hub") | 01 — Routing & async data-load races | ✅ Fixed | [BUG-005](../reports/bugs/BUG-005.md) |
| [PB-01-02](./PB-01-02.md) | Boot loading overlay stayed up too long (waited for full data load, not first paint) | 01 — Routing & async data-load races | ✅ Fixed | [BUG-005](../reports/bugs/BUG-005.md) |

---
Back to Index: [Index](../../index.md)
