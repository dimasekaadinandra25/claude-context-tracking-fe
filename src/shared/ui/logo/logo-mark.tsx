import { themeConfig } from 'src/theme/theme-config';

const { primary, common } = themeConfig.palette;

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden focusable="false">
      <rect width="32" height="32" rx="7" fill={primary.main} />
      <circle
        cx="16"
        cy="16"
        r="8.48"
        fill="none"
        stroke={common.white}
        strokeOpacity={0.35}
        strokeWidth="4.16"
      />
      <circle
        cx="16"
        cy="16"
        r="8.48"
        fill="none"
        stroke={common.white}
        strokeWidth="4.16"
        pathLength={100}
        strokeDasharray="70 100"
        transform="rotate(-90 16 16)"
      />
    </svg>
  );
}
