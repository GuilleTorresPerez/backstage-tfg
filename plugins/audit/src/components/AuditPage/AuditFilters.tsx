import { useEffect, useState } from 'react';
import {
  Box,
  Chip,
  Grid,
  MenuItem,
  TextField,
  makeStyles,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { AuditSeverity } from '../../api';

export type DateRangePreset = '1h' | '24h' | '7d' | 'custom';
export type StatusFilter = 'any' | 'succeeded' | 'failed';

export interface FilterState {
  dateRange: DateRangePreset;
  customFrom?: string;
  customTo?: string;
  actor?: string;
  eventId?: string;
  severity: AuditSeverity[];
  status: StatusFilter;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  dateRange: '24h',
  severity: [],
  status: 'any',
};

const KNOWN_EVENT_IDS = ['entity-mutate', 'location-mutate', 'task'];

const SEVERITIES: AuditSeverity[] = ['low', 'medium', 'high', 'critical'];

const useStyles = makeStyles(theme => ({
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    alignItems: 'center',
  },
  label: {
    minWidth: 90,
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
}));

export function AuditFilters(props: {
  value: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const { value, onChange } = props;
  const classes = useStyles();
  const catalogApi = useApi(catalogApiRef);
  const [actorOptions, setActorOptions] = useState<string[]>([]);
  const [actorInput, setActorInput] = useState(value.actor ?? '');

  useEffect(() => {
    let cancelled = false;
    catalogApi
      .getEntities({
        filter: { kind: 'User' },
        fields: ['kind', 'metadata.name', 'metadata.namespace'],
        limit: 200,
      })
      .then(resp => {
        if (cancelled) return;
        setActorOptions(resp.items.map(e => stringifyEntityRef(e)));
      })
      .catch(() => {
        if (!cancelled) setActorOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [catalogApi]);

  const setRange = (dateRange: DateRangePreset) =>
    onChange({ ...value, dateRange });
  const toggleSeverity = (s: AuditSeverity) => {
    const has = value.severity.includes(s);
    onChange({
      ...value,
      severity: has
        ? value.severity.filter(x => x !== s)
        : [...value.severity, s],
    });
  };
  const setStatus = (status: StatusFilter) => onChange({ ...value, status });

  return (
    <Box mb={2}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box className={classes.chipRow}>
            <span className={classes.label}>Date range</span>
            {(
              [
                ['1h', 'Last hour'],
                ['24h', 'Last 24h'],
                ['7d', 'Last 7d'],
                ['custom', 'Custom'],
              ] as Array<[DateRangePreset, string]>
            ).map(([key, label]) => (
              <Chip
                key={key}
                label={label}
                color={value.dateRange === key ? 'primary' : 'default'}
                onClick={() => setRange(key)}
                clickable
              />
            ))}
            {value.dateRange === 'custom' && (
              <>
                <TextField
                  label="From (ISO)"
                  size="small"
                  value={value.customFrom ?? ''}
                  onChange={e =>
                    onChange({ ...value, customFrom: e.target.value })
                  }
                  placeholder="2026-05-13T00:00:00Z"
                />
                <TextField
                  label="To (ISO)"
                  size="small"
                  value={value.customTo ?? ''}
                  onChange={e =>
                    onChange({ ...value, customTo: e.target.value })
                  }
                  placeholder="2026-05-14T00:00:00Z"
                />
              </>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            freeSolo
            options={actorOptions}
            value={value.actor ?? null}
            inputValue={actorInput}
            onInputChange={(_, v) => setActorInput(v)}
            onChange={(_, v) =>
              onChange({ ...value, actor: v ? String(v) : undefined })
            }
            renderInput={params => (
              <TextField
                {...params}
                label="Actor (entity ref)"
                size="small"
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            size="small"
            fullWidth
            label="Event ID"
            value={value.eventId ?? ''}
            onChange={e =>
              onChange({
                ...value,
                eventId: e.target.value === '' ? undefined : e.target.value,
              })
            }
          >
            <MenuItem value="">All events</MenuItem>
            {KNOWN_EVENT_IDS.map(id => (
              <MenuItem key={id} value={id}>
                {id}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box className={classes.chipRow}>
            <span className={classes.label}>Severity</span>
            {SEVERITIES.map(s => (
              <Chip
                key={s}
                label={s}
                color={value.severity.includes(s) ? 'primary' : 'default'}
                onClick={() => toggleSeverity(s)}
                clickable
              />
            ))}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box className={classes.chipRow}>
            <span className={classes.label}>Status</span>
            {(
              [
                ['any', 'Any'],
                ['succeeded', 'Succeeded'],
                ['failed', 'Failed'],
              ] as Array<[StatusFilter, string]>
            ).map(([key, label]) => (
              <Chip
                key={key}
                label={label}
                color={value.status === key ? 'primary' : 'default'}
                onClick={() => setStatus(key)}
                clickable
              />
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export function filterStateToListOptions(state: FilterState): {
  actor?: string;
  eventId?: string;
  severity?: AuditSeverity[];
  status?: string;
  from?: string;
  to?: string;
} {
  const now = Date.now();
  let from: string | undefined;
  let to: string | undefined;
  if (state.dateRange === '1h') {
    from = new Date(now - 60 * 60 * 1000).toISOString();
  } else if (state.dateRange === '24h') {
    from = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  } else if (state.dateRange === '7d') {
    from = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  } else if (state.dateRange === 'custom') {
    from = state.customFrom || undefined;
    to = state.customTo || undefined;
  }

  const status =
    state.status === 'succeeded' || state.status === 'failed'
      ? state.status
      : undefined;

  return {
    actor: state.actor || undefined,
    eventId: state.eventId || undefined,
    severity: state.severity.length > 0 ? state.severity : undefined,
    status,
    from,
    to,
  };
}
