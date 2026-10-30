import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useTranslate } from 'src/locales';
import { toast } from 'src/shared/ui/snackbar';

type Props = {
  issuedKey: string | null;
  onClose: () => void;
};

export function IssuedKeyDialog({ issuedKey, onClose }: Props) {
  const { t } = useTranslate('usage');

  const copy = async () => {
    if (!issuedKey) return;
    await navigator.clipboard.writeText(issuedKey);
    toast.success(t('keys.copied'));
  };

  return (
    <Dialog open={!!issuedKey} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('keys.issuedTitle')}</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('keys.once')}
        </Alert>
        <Box
          component="code"
          sx={{
            display: 'block',
            p: 2,
            borderRadius: 1,
            bgcolor: 'background.neutral',
            wordBreak: 'break-all',
          }}
        >
          {issuedKey}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={copy}>{t('keys.copy')}</Button>
        <Button variant="contained" onClick={onClose}>
          {t('keys.done')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
