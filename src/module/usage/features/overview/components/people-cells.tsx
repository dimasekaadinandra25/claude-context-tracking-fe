import type { OverviewPerson } from 'src/module/usage/types';

import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

import { useTranslate } from 'src/locales';
import { Iconify } from 'src/shared/ui/iconify';
import { fToNow } from 'src/shared/utils/format-time';
import { formatDateTime } from 'src/module/usage/utils/format';

const STALE_HOURS = 24;
const ACTIVE_MINUTES = 10;
const DOT_SIZE = 8;

export function ActiveDot({ lastRequestAt }: { lastRequestAt: string | null }) {
  const { t } = useTranslate('usage');
  if (!lastRequestAt || dayjs().diff(lastRequestAt, 'minute', true) > ACTIVE_MINUTES) return null;
  return (
    <Tooltip title={t('sync.activeNow')}>
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          flexShrink: 0,
          width: DOT_SIZE,
          height: DOT_SIZE,
          mr: 1,
          borderRadius: '50%',
          bgcolor: 'success.main',
        }}
      />
    </Tooltip>
  );
}

export const formatShare = (value: number | null) =>
  value === null ? '—' : `${Math.round(value)}%`;

const compareVersions = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });

export function latestVersion(people: OverviewPerson[]) {
  return people
    .map((p) => p.app_version)
    .reduce<
      string | null
    >((max, v) => (v && (!max || compareVersions(v, max) > 0) ? v : max), null);
}

function isStale(person: OverviewPerson) {
  if (person.is_active === false) return false;
  if (!person.last_synced_at) return true;
  return dayjs().diff(person.last_synced_at, 'hour', true) > STALE_HOURS;
}

export function VersionCell({
  version,
  latest,
}: {
  version: string | null;
  latest: string | null;
}) {
  const { t } = useTranslate('usage');
  if (!version) return '—';
  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <Chip size="small" label={version} />
      {latest && compareVersions(version, latest) < 0 && (
        <Tooltip title={t('version.latest', { version: latest })}>
          <Chip size="small" color="warning" label={t('version.outdated')} />
        </Tooltip>
      )}
    </Box>
  );
}

export function SyncedCell({ person }: { person: OverviewPerson }) {
  const { t } = useTranslate('usage');
  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      {formatDateTime(person.last_synced_at)}
      {isStale(person) && (
        <Tooltip
          title={
            person.last_synced_at
              ? t('sync.stale', { ago: fToNow(person.last_synced_at) })
              : t('sync.never')
          }
        >
          <Box component="span" sx={{ display: 'inline-flex', color: 'warning.main' }}>
            <Iconify icon="solar:danger-triangle-bold" />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
}
