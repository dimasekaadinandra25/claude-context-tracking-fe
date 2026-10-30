import { themeConfig } from 'src/theme/theme-config';

const { primary, common } = themeConfig.palette;

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden focusable="false">
      <rect width="32" height="32" rx="8" fill={primary.main} />
      <g fill={common.white}>
        <rect x="7.5" y="17" width="4" height="8" rx="1.5" />
        <rect x="14" y="12" width="4" height="13" rx="1.5" />
        <rect x="20.5" y="7" width="4" height="18" rx="1.5" />
      </g>
    </svg>
  );
}
