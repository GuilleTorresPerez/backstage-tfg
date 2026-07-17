## Dev environment — host + Fedora Toolbox

```bash
toolbox run -c backstage-dev <command>
```

Commands that do **not** need the toolbox (run directly on the host):
- `git`, `gh`
- `docker` / `docker compose` (the container engine lives on the host, not in the toolbox)
- File edits, `grep`, `find`, etc.

Rule of thumb: if it touches `node_modules`, `yarn`, `node`, or the project's TypeScript/build pipeline → wrap in `toolbox run -c backstage-dev`. Otherwise run it directly.

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`GuilleTorresPerez/backstage-tfg`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

