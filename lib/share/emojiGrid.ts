export const SHARE_EMOJI_COMPLETE = '🟩';
export const SHARE_EMOJI_WARN = '🟨';
export const SHARE_EMOJI_EMPTY = '⬛';

export type ShareCellTone = 'complete' | 'warn' | 'empty';

export function toneToEmoji(tone: ShareCellTone): string {
  switch (tone) {
    case 'complete':
      return SHARE_EMOJI_COMPLETE;
    case 'warn':
      return SHARE_EMOJI_WARN;
    case 'empty':
      return SHARE_EMOJI_EMPTY;
  }
}

export function renderEmojiGrid(rows: ShareCellTone[][]): string {
  return rows.map((row) => row.map(toneToEmoji).join('')).join('\n');
}
