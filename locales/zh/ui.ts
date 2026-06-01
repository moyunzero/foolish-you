/** Chinese UI strings (Plan 02). */
export const ui = {
  common: {
    back: '返回',
    gotIt: '知道了',
    later: '稍后',
    retryTap: '点此重试',
    reload: '重新加载',
    retrySave: '重试保存',
    retryStreak: '重试连签',
    timer: '用时',
  },
  index: {
    loadingPuzzle: '正在翻出今天的傻题…',
    errorReloading: '出了点问题，点击下方重试。',
  },
  game: {
    completeToday: '完成今日',
    giveUpToday: '放弃今日挑战',
    loadFailed: '今日题目加载失败，可能是本地数据损坏。',
  },
  result: {
    loadingStatus: '今日状态加载中…',
    statusWin: '通关',
    statusSurrender: '认怂',
    recordPrefix: '今日战绩 ·',
    elapsedPrefix: '用时：',
    foolIndexPrefix: '傻了指数：',
    daysSuffix: '天',
  },
  privacy: {
    openInBrowser: '在浏览器中打开公开版',
    publicUrlA11y: '公开隐私政策网址',
    cannotOpenLinkTitle: '无法打开链接',
    cannotOpenLinkMessage:
      '请稍后重试，或在浏览器中访问公开隐私政策页面。',
  },
  share: {
    copyReport: '拷贝战报',
    copying: '拷贝中…',
    copied: '已复制',
    copyFailed: '拷贝失败，再试一次',
    copyReportA11y: '拷贝今日战报',
    copiedA11y: '战报已复制到剪贴板',
    failedA11y: '战报复制失败',
    hint: '战报不含答案，可粘贴到聊天应用',
  },
  stats: {
    today: '今日',
    thisWeek: '本周',
    bestStreak: '最长连签',
  },
  gameTypes: {
    sudoku: '数独',
    binary: '二进制',
    nonogram: '数绘',
    slitherlink: '数回',
  },
  nonogramReveal: {
    prefix: '今日画作 ·',
  },
  slitherlinkReveal: {
    prefix: '今日数回 ·',
  },
  rules: {
    closeA11y: '关闭规则说明',
    viewRulesA11y: (title: string) => `查看${title}`,
  },
  badges: {
    foolA11y: '傻了成就图标',
    winA11y: '通关成就图标，聪明脸',
  },
  legal: {
    privacyLink: '隐私政策',
    privacyA11y: '查看隐私政策',
    lastUpdated: (date: string) => `最后更新：${date}`,
  },
  settings: {
    title: '设置（占位）',
    subtitle: '语言跟随系统；手动切换将在后续版本开放',
    previewNote: '以下为开发预览，不写入存储，重启后恢复系统语言。',
    deviceLabel: (locale: string) => `当前系统语言 → ${locale}`,
    segments: {
      system: '系统',
      zh: '中文',
      en: 'English',
    },
    segmentA11y: (choice: string) => `预览语言：${choice}`,
  },
  login: {
    title: '登录以后再说',
    subtitle: '账号同步将在后续版本开放',
    backToToday: '返回今日',
  },
  hooks: {
    sudoku: {
      complete: '全部填对啦，可以收工',
      conflict: '有冲突，检查一下标红的格子',
      selectCell: '先点一个空格，再选数字',
    },
    binary: {
      complete: '规则都满足了，可以收工',
      conflict: '有违规，检查一下标红的格子',
      tapHint: '点格子切换 · 长按清空',
    },
    nonogram: {
      complete: '图案对了，可以收工',
      tapHint: '点格子切换 · 长按清空',
    },
    slitherlink: {
      complete: '单环闭合，可以收工',
      conflict: '环或数字不对，再想想',
      tapHint: '点边：未标 → 连线 → × · 长按：清除',
    },
  },
  alerts: {
    abandonTitle: '放弃今日挑战？',
    abandonMessage: '今天的进度会保存为「认怂」，明天再来也行。',
    continuePlay: '继续玩',
    giveUp: '放弃',
    saveFailedTitle: '保存失败',
    saveFailedMessage: '进度没能写入本地，请稍后再试或点「重试保存」。',
    streakSaveFailedTitle: '连签保存失败',
    streakSaveFailedMessage:
      '连签没能写入本地，请稍后再试或点「重试连签」。',
  },
  shareCard: {
    completed: (elapsed: string, suffix: string, streak: string) =>
      `✅ 通关 · 用时 ${elapsed}${suffix}${streak}`,
    abandoned: (elapsed: string) => `🏳 认怂 · 用时 ${elapsed}`,
    suffixHadMistakes: ' · 曾翻车',
    suffixSlow: ' · 慢热局',
    suffixFast: ' · 手速局',
    suffixClean: ' · 干净局',
    streakDays: (days: number) => ` · 连签 ${days} 天`,
  },
  grid: {
    rowCol: (row: number, col: number) => `第 ${row + 1} 行第 ${col + 1} 列`,
    empty: '，空',
    filled: '，已填色',
    marked: '，已标记',
    given: '已知',
    filledCell: '已填',
    knownGiven: '已知数',
    conflictSudoku: '，与同行列或同宫冲突',
    conflictBinary: '，违反规则',
    sudokuGivenA11y: '题目给定数字，不可修改',
    sudokuConflictA11y: '与同行、同列或同宫有重复数字',
    sudokuCellA11y: '点按选中，长按清空',
    clearCell: '清除当前格',
    clear: '清除',
    digitDisabled: (n: number) => `数字 ${n} 在本行、列或宫内已有`,
    fillDigit: (n: number) => `填入 ${n}`,
    slitherlinkClueA11y: (row: number, col: number, clue: number) =>
      `第 ${row + 1} 行第 ${col + 1} 列，提示数字 ${clue}`,
    slitherlinkEdgeA11y: (
      row: number,
      col: number,
      orientation: 'h' | 'v',
      state: 'line' | 'blank' | 'unknown',
      conflict: boolean,
    ) => {
      const pos = `第 ${row + 1} 行第 ${col + 1} 列`;
      const kind = orientation === 'h' ? '横边' : '竖边';
      const stateText =
        state === 'line' ? '连线' : state === 'blank' ? '×' : '空';
      const conflictText = conflict ? '，冲突' : '';
      return `${pos}${kind}，${stateText}${conflictText}`;
    },
  },
} as const;
