import type { MemberModel } from '../../../types';

import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { useTranslate } from 'src/locales';

import { ChartCard } from '../../../components/chart-card';
import { EmptyState } from '../../../components/empty-state';
import { modelLabel, formatTokens } from '../../../utils/format';
import { PERCENT, oneDecimal, roundToTotal, OUTPUT_WEIGHT } from '../../../utils/plan';

const inputOf = (row: MemberModel) =>
  row.input_tokens + row.cache_write_tokens + row.cache_read_tokens;

const weightOf = (row: MemberModel) => inputOf(row) + OUTPUT_WEIGHT * row.output_tokens;

type Member = {
  userId: string;
  name: string;
  byModel: Map<string, MemberModel>;
  shares: Map<string, number>;
  input: number;
  output: number;
  weight: number;
};

function groupMembers(rows: MemberModel[]): Member[] {
  const members = new Map<string, MemberModel[]>();
  rows.forEach((row) => members.set(row.user_id, [...(members.get(row.user_id) ?? []), row]));
  return [...members.values()]
    .map((own) => {
      const shares = roundToTotal(own.map(weightOf), PERCENT);
      return {
        userId: own[0].user_id,
        name: own[0].full_name || own[0].email,
        byModel: new Map(own.map((row) => [row.model, row])),
        shares: new Map(own.map((row, index) => [row.model, shares[index]])),
        input: own.reduce((total, row) => total + inputOf(row), 0),
        output: own.reduce((total, row) => total + row.output_tokens, 0),
        weight: own.reduce((total, row) => total + weightOf(row), 0),
      };
    })
    .sort((a, b) => b.weight - a.weight);
}

function modelOrder(rows: MemberModel[]): string[] {
  const totals = new Map<string, number>();
  rows.forEach((row) => totals.set(row.model, (totals.get(row.model) ?? 0) + weightOf(row)));
  return [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([model]) => model);
}

export function MemberModelsCard({ rows }: { rows: MemberModel[] }) {
  const { t } = useTranslate('usage');
  const members = groupMembers(rows);
  const models = modelOrder(rows);

  return (
    <ChartCard title={t('models.byMember')}>
      {members.length === 0 ? (
        <EmptyState message={t('empty.models')} />
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('planUsage.member')}</TableCell>
                {models.map((model) => (
                  <TableCell key={model} align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {modelLabel(model)}
                  </TableCell>
                ))}
                <TableCell align="right">{t('planUsage.total')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell>
                    <Typography variant="subtitle2">{member.name}</Typography>
                  </TableCell>
                  {models.map((model) => {
                    const row = member.byModel.get(model);
                    return (
                      <TableCell key={model} align="right">
                        {row ? (
                          <>
                            <Typography variant="subtitle2">
                              {oneDecimal(member.shares.get(model) ?? 0)}%
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {t('planUsage.requests', { count: row.requests.toLocaleString() })}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                            –
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Typography variant="subtitle2">
                      {formatTokens(member.input)} {t('planUsage.in')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'success.main' }}>
                      {formatTokens(member.output)} {t('planUsage.out')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.disabled' }}>
        {t('models.byMemberNote')}
      </Typography>
    </ChartCard>
  );
}
