import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import { shortModel } from '../utils/format';

export function ModelChips({ models }: { models: string[] }) {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{ height: 1, alignItems: 'center', overflow: 'hidden' }}
    >
      {models.map((model) => (
        <Chip key={model} size="small" variant="soft" label={shortModel(model)} title={model} />
      ))}
    </Stack>
  );
}
