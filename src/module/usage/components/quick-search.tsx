import { useState, useEffect, useCallback } from 'react';

import List from '@mui/material/List';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';
import { Iconify } from 'src/shared/ui/iconify';
import { useAuthContext } from 'src/module/core/features/auth/hooks';

import { useFetch } from '../hooks/use-fetch';
import { getPeople, getSessions } from '../api/usage';
import { useReportRange } from '../hooks/use-report-range';

const DEBOUNCE_MS = 250;
const LIMIT = 8;

type Result = {
  id: string;
  group: 'members' | 'sessions';
  label: string;
  detail: string;
  href: string;
};

function useDebounced(value: string) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value]);
  return debounced;
}

function useResults(open: boolean, query: string): Result[] {
  const { user } = useAuthContext();
  const { range } = useReportRange();
  const isAdmin = !!user?.is_super_admin;
  const q = useDebounced(query.trim());

  const loadPeople = useCallback(
    () => (open && isAdmin ? getPeople() : Promise.resolve([])),
    [open, isAdmin]
  );
  const loadSessions = useCallback(
    () => (q ? getSessions(range, { q, per_page: String(LIMIT) }) : Promise.resolve(null)),
    [range, q]
  );
  const people = useFetch(loadPeople).data ?? [];
  const sessions = useFetch(loadSessions).data?.items ?? [];
  const needle = query.trim().toLowerCase();

  if (!needle) return [];
  return [
    ...people
      .filter((p) => `${p.full_name} ${p.email}`.toLowerCase().includes(needle))
      .slice(0, LIMIT)
      .map((p) => ({
        id: p.id,
        group: 'members' as const,
        label: p.full_name || p.email,
        detail: p.email,
        href: paths.dashboard.person(p.id),
      })),
    ...sessions.slice(0, LIMIT).map((s) => ({
      id: s.id,
      group: 'sessions' as const,
      label: s.title || s.id,
      detail: [s.user_name, s.project].filter(Boolean).join(' · '),
      href: paths.dashboard.session(s.id),
    })),
  ];
}

export function QuickSearchButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslate('usage');

  return (
    <Tooltip title={t('search.open')}>
      <IconButton aria-label={t('search.open')} onClick={onClick} sx={{ width: 40, height: 40 }}>
        <Iconify icon="eva:search-fill" />
      </IconButton>
    </Tooltip>
  );
}

function useHotkey(onOpen: () => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpen();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onOpen]);
}

type ListProps = {
  query: string;
  results: Result[];
  active: number;
  onPick: (result: Result) => void;
};

function ResultList({ query, results, active, onPick }: ListProps) {
  const { t } = useTranslate('usage');

  if (query.trim() && results.length === 0) {
    return (
      <Typography variant="body2" sx={{ px: 3, pb: 2, color: 'text.secondary' }}>
        {t('search.empty')}
      </Typography>
    );
  }

  return (
    <List dense sx={{ pt: 0 }}>
      {results.map((result, index) => [
        result.group !== results[index - 1]?.group && (
          <ListSubheader key={result.group}>{t(`search.${result.group}`)}</ListSubheader>
        ),
        <ListItemButton
          key={`${result.group}-${result.id}`}
          selected={index === active}
          onClick={() => onPick(result)}
        >
          <ListItemText primary={result.label} secondary={result.detail} />
        </ListItemButton>,
      ])}
    </List>
  );
}

type Props = { open: boolean; onOpen: () => void; onClose: () => void };

export function QuickSearchDialog({ open, onOpen, onClose }: Props) {
  const { t } = useTranslate('usage');
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const results = useResults(open, query);

  useHotkey(onOpen);

  const close = () => {
    setQuery('');
    setActive(0);
    onClose();
  };

  const go = (result: Result | undefined) => {
    if (!result) return;
    router.push(result.href);
    close();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') setActive((i) => Math.min(i + 1, results.length - 1));
    else if (event.key === 'ArrowUp') setActive((i) => Math.max(i - 1, 0));
    else if (event.key === 'Enter') go(results[active]);
    else return;
    event.preventDefault();
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <TextField
        autoFocus
        fullWidth
        placeholder={t('search.placeholder')}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
        slotProps={{ htmlInput: { 'aria-label': t('search.placeholder') } }}
        sx={{ p: 2 }}
      />
      <ResultList query={query} results={results} active={active} onPick={go} />
    </Dialog>
  );
}
