/** Push notification copy pools (D-12 — restrained tone). */
export const notifications = {
  routineTitle: '今日一题',
  routineBodies: [
    '还没收工？今天的傻题在等你。',
    '到点了 — 打开 App，把今天这局做完。',
    '别装没看见，今日谜题还没通关。',
  ] as const,
  /** Carry push pool (v2.7-04 D-13–D-15) */
  routineTitleCarry: '还没收工',
  routineBodiesCarry: [
    '这局还没收工 — 打开接着下。',
    '到点了 — 把进行中的那局收完。',
    '别装没看见，这局还没通关。',
  ] as const,
} as const;
