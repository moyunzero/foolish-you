/** 从一行/列 solution 生成 Picross 线索（空行 → [0]） */
export function computeLineClues(line: boolean[]): number[] {
  const clues: number[] = [];
  let run = 0;

  for (const filled of line) {
    if (filled) {
      run += 1;
    } else if (run > 0) {
      clues.push(run);
      run = 0;
    }
  }
  if (run > 0) clues.push(run);
  if (clues.length === 0) return [0];
  return clues;
}

export function computeClues(solution: boolean[][]): {
  rowClues: number[][];
  colClues: number[][];
} {
  const rows = solution.length;
  const cols = solution[0]?.length ?? 0;
  const rowClues = solution.map((line) => computeLineClues(line));
  const colClues: number[][] = [];

  for (let col = 0; col < cols; col += 1) {
    const line: boolean[] = [];
    for (let row = 0; row < rows; row += 1) {
      line.push(solution[row]![col]!);
    }
    colClues.push(computeLineClues(line));
  }

  return { rowClues, colClues };
}
