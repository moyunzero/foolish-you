/** DESIGN.md 颜色常量 — 供非 className 场景（ActivityIndicator 等） */
export const colors = {
  canvas: '#0a0a0a',
  canvasCard: '#191919',
  canvasSoft: '#1a1c20',
  hairline: '#212327',
  ink: '#ffffff',
  body: '#dadbdf',
  muted: '#7d8187',
  /** 数独冲突格描边/浅底 — 对应 tailwind `accent-sunset` */
  accentSunset: '#ff7a17',
  /** 题目给定数字（不可改） */
  sudokuGiven: '#b8bcc4',
  /** 冲突 / 错误数字 */
  sudokuError: '#f87171',
  primary: '#ffffff',
  onPrimary: '#0a0a0a',
} as const;
