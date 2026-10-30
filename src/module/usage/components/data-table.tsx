import type { TableHeadCellProps } from 'src/shared/ui/table';

import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';

import { TableNoData, TableHeadCustom } from 'src/shared/ui/table';

export type Column<T> = TableHeadCellProps & {
  render: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage: string;
  onRowClick?: (row: T) => void;
};

export function DataTable<T>({ columns, rows, rowKey, emptyMessage, onRowClick }: Props<T>) {
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small">
        <TableHeadCustom headCells={columns} />
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={rowKey(row)}
              hover={!!onRowClick}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align}>
                  {column.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableNoData notFound colSpan={columns.length} message={emptyMessage} />
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
