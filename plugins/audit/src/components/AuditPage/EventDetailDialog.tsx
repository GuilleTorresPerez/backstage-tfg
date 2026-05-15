import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  makeStyles,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { AuditEvent } from '../../api';

const useStyles = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  fieldLabel: {
    color: theme.palette.text.secondary,
    fontSize: '0.85rem',
    marginTop: theme.spacing(1),
  },
  meta: {
    background: theme.palette.background.default,
    padding: theme.spacing(1.5),
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
}));

export function EventDetailDialog(props: {
  event: AuditEvent | undefined;
  onClose: () => void;
}) {
  const { event, onClose } = props;
  const classes = useStyles();
  return (
    <Dialog open={Boolean(event)} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle disableTypography>
        <Typography variant="h6">
          {event?.eventId} {event ? `· ${event.severity}` : ''}
        </Typography>
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {event && (
          <Box>
            <Typography className={classes.fieldLabel}>HTTP method</Typography>
            <Typography>{event.httpMethod ?? '—'}</Typography>

            <Typography className={classes.fieldLabel}>HTTP path</Typography>
            <Typography>{event.httpPath ?? '—'}</Typography>

            <Typography className={classes.fieldLabel}>User agent</Typography>
            <Typography>{event.userAgent ?? '—'}</Typography>

            <Typography className={classes.fieldLabel}>
              Error message
            </Typography>
            <Typography>{event.errorMessage ?? '—'}</Typography>

            <Typography className={classes.fieldLabel}>Meta</Typography>
            <pre className={classes.meta}>
              {JSON.stringify(event.meta ?? {}, null, 2)}
            </pre>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
