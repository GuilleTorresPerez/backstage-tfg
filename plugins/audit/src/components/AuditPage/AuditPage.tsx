import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  makeStyles,
} from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import RefreshIcon from '@material-ui/icons/Refresh';
import {
  Content,
  ContentHeader,
  Header,
  Page,
  Progress,
  ResponseErrorPanel,
  StatusError,
  StatusOK,
  StatusPending,
  SupportButton,
} from '@backstage/core-components';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { AuditEvent } from '../../api';
import {
  AuditFilters,
  DEFAULT_FILTER_STATE,
  FilterState,
  filterStateToListOptions,
} from './AuditFilters';
import { EventDetailDialog } from './EventDetailDialog';
import { useAuditEvents } from './useAuditEvents';

const useStyles = makeStyles(theme => ({
  toolbar: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing(1),
  },
  loadMoreRow: {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(2),
  },
  noResults: {
    padding: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

const SEVERITY_COLORS: Record<
  AuditEvent['severity'],
  'default' | 'primary' | 'secondary'
> = {
  low: 'default',
  medium: 'default',
  high: 'primary',
  critical: 'secondary',
};

function StatusIcon({ status }: { status: string }) {
  if (status === 'succeeded') return <StatusOK />;
  if (status === 'failed') return <StatusError />;
  return <StatusPending />;
}

export function AuditPage() {
  const classes = useStyles();
  const [filterState, setFilterState] = useState<FilterState>(
    DEFAULT_FILTER_STATE,
  );
  const listOptions = useMemo(
    () => filterStateToListOptions(filterState),
    [filterState],
  );
  const { items, hasMore, loading, error, refresh, loadMore } =
    useAuditEvents(listOptions);
  const [selected, setSelected] = useState<AuditEvent | undefined>();

  return (
    <Page themeId="tool">
      <Header title="Audit log" subtitle="Auditable events (ENS op.exp.8)" />
      <Content>
        <ContentHeader title="Events">
          <Button
            startIcon={<RefreshIcon />}
            color="primary"
            variant="outlined"
            onClick={refresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <SupportButton>
            Read-only view of the audit_events table. Filtering and pagination
            run server-side; rows are sorted by timestamp descending.
          </SupportButton>
        </ContentHeader>

        <AuditFilters value={filterState} onChange={setFilterState} />

        {error && <ResponseErrorPanel error={error} />}

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Event</TableCell>
                <TableCell>Actor</TableCell>
                <TableCell>Source IP</TableCell>
                <TableCell>Plugin</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map(event => (
                <TableRow key={event.id} hover>
                  <TableCell>{event.ts}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={event.severity}
                      color={SEVERITY_COLORS[event.severity]}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={event.status}>
                      <span>
                        <StatusIcon status={event.status} />
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{event.eventId}</TableCell>
                  <TableCell>
                    {event.actorRef ? (
                      <EntityRefLink entityRef={event.actorRef} />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{event.sourceIp ?? '—'}</TableCell>
                  <TableCell>{event.pluginId}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      aria-label={`Open event ${event.id} details`}
                      onClick={() => setSelected(event)}
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography className={classes.noResults}>
                      No events match the current filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {loading && <Progress />}
          {hasMore && (
            <Box className={classes.loadMoreRow}>
              <Button
                onClick={loadMore}
                disabled={loading}
                variant="outlined"
                color="primary"
              >
                Load more
              </Button>
            </Box>
          )}
        </TableContainer>

        <EventDetailDialog
          event={selected}
          onClose={() => setSelected(undefined)}
        />
      </Content>
    </Page>
  );
}
