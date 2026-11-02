import IconButton from '@mui/material/IconButton';
import {
  ExportCsv,
  GridDownloadIcon,
  GridViewColumnIcon,
  ColumnsPanelTrigger,
} from '@mui/x-data-grid';

import { useTranslate } from 'src/locales';

export function GridActions({ fileName }: { fileName: string }) {
  const { t } = useTranslate('usage');

  return (
    <>
      <ColumnsPanelTrigger render={<IconButton aria-label={t('grid.columns')} />}>
        <GridViewColumnIcon />
      </ColumnsPanelTrigger>
      <ExportCsv
        render={<IconButton aria-label={t('grid.exportCsv')} />}
        options={{ fileName, allColumns: true }}
      >
        <GridDownloadIcon />
      </ExportCsv>
    </>
  );
}
