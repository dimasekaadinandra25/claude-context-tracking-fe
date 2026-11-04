import type { ToolUsage } from 'src/module/usage/types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { useTranslate } from 'src/locales';
import { formatTokens } from 'src/module/usage/utils/format';
import { ChartCard } from 'src/module/usage/components/chart-card';
import { EmptyState } from 'src/module/usage/components/empty-state';

const PERCENT = 100;
const MAX_TOOLS = 8;

const count = (value: number) => value.toLocaleString();

type Props = {
  linesAdded: number;
  linesRemoved: number;
  commits: number;
  outputTokens?: number;
  tools: ToolUsage[];
};

function ToolBars({ tools }: { tools: ToolUsage[] }) {
  const { t } = useTranslate('usage');
  const top = tools.slice(0, MAX_TOOLS);
  const most = Math.max(1, ...top.map((tool) => tool.calls));

  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {t('activity.tools')}
      </Typography>
      <Stack spacing={1} sx={{ mt: 1 }}>
        {top.map((tool) => (
          <Box
            key={tool.tool}
            sx={{
              display: 'grid',
              gridTemplateColumns: '112px 1fr 56px',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Typography variant="body2" noWrap>
              {tool.tool}
            </Typography>
            <LinearProgress
              variant="determinate"
              color="primary"
              value={(tool.calls / most) * PERCENT}
              aria-label={tool.tool}
              sx={{ height: 8 }}
            />
            <Typography variant="body2" sx={{ textAlign: 'right' }}>
              {count(tool.calls)}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export function ActivityCard({ linesAdded, linesRemoved, commits, outputTokens, tools }: Props) {
  const { t } = useTranslate('usage');
  const stats: [string, string][] = [
    ['linesAdded', `+${count(linesAdded)}`],
    ['linesRemoved', `-${count(linesRemoved)}`],
    ['commits', count(commits)],
  ];
  if (outputTokens !== undefined && commits > 0) {
    stats.push(['tokensPerCommit', formatTokens(Math.round(outputTokens / commits))]);
  }
  const empty = tools.length === 0 && linesAdded === 0 && linesRemoved === 0 && commits === 0;

  return (
    <ChartCard title={t('activity.title')}>
      {empty ? (
        <EmptyState message={t('activity.empty')} />
      ) : (
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 6, rowGap: 2 }}>
            {stats.map(([key, value]) => (
              <Box key={key}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {t(`activity.${key}`)}
                </Typography>
                <Typography variant="h4">{value}</Typography>
              </Box>
            ))}
          </Box>
          {tools.length > 0 && <ToolBars tools={tools} />}
        </Stack>
      )}
    </ChartCard>
  );
}
