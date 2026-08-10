/** DESIGN.md 颜色常量 — 供非 className 场景（ActivityIndicator 等） */
export const colors = {
  canvas: '#0a0a0a',
  canvasCard: '#191919',
  canvasSoft: '#1a1c20',
  /** Host Desk session rail (Path B) */
  canvasElev: '#101114',
  canvasElevNotes: '#121014',
  hairline: '#212327',
  /** Stronger hairline for session chrome border */
  hairlineStrong: '#2e3238',
  ink: '#ffffff',
  body: '#dadbdf',
  muted: '#7d8187',
  /** 数独冲突格描边/浅底 — 对应 tailwind `accent-sunset` */
  accentSunset: '#ff7a17',
  /** Notes-mode digit tint — DESIGN accent-sunset-soft */
  accentSunsetSoft: '#ffc285',
  /** 题目给定数字（不可改） */
  sudokuGiven: '#b8bcc4',
  /** 冲突 / 错误数字 */
  sudokuError: '#f87171',
  /** 月历护盾日标记 */
  calendarShield: '#6eb5ff',
  /** 数独细格线（格与格之间） */
  sudokuCellLine: 'rgba(255, 255, 255, 0.09)',
  /** 数独 3×3 宫格分隔线 */
  sudokuBoxLine: 'rgba(255, 255, 255, 0.22)',
  /** 数独外框 */
  sudokuOuterLine: 'rgba(255, 255, 255, 0.35)',
  primary: '#ffffff',
  onPrimary: '#0a0a0a',
} as const;
