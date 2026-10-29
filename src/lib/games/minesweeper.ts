export type Difficulty = 'beginner' | 'intermediate' | 'expert'
export type Cell = { mine: boolean; open: boolean; flagged: boolean; adjacent: number }
export type Board = { rows: number; columns: number; mines: number; cells: Cell[] }

const LEVELS: Record<Difficulty, { rows: number; columns: number; mines: number }> = {
  beginner: { rows: 9, columns: 9, mines: 10 },
  intermediate: { rows: 16, columns: 16, mines: 40 },
  expert: { rows: 16, columns: 30, mines: 99 },
}

export function newBoard(difficulty: Difficulty): Board {
  const { rows, columns, mines } = LEVELS[difficulty]
  const cells = Array.from({ length: rows * columns }, () => ({ mine: false, open: false, flagged: false, adjacent: 0 }))
  const mineIndexes = new Set<number>()
  while (mineIndexes.size < mines) mineIndexes.add(Math.floor(Math.random() * cells.length))
  mineIndexes.forEach((index) => { cells[index].mine = true })
  cells.forEach((cell, index) => { cell.adjacent = neighbors(index, rows, columns).filter((neighbor) => cells[neighbor]?.mine).length })
  return { rows, columns, mines, cells }
}

export function neighbors(index: number, rows: number, columns: number): number[] {
  const row = Math.floor(index / columns)
  const column = index % columns
  const result: number[] = []
  for (let y = Math.max(0, row - 1); y <= Math.min(rows - 1, row + 1); y += 1) {
    for (let x = Math.max(0, column - 1); x <= Math.min(columns - 1, column + 1); x += 1) {
      const neighbor = y * columns + x
      if (neighbor !== index) result.push(neighbor)
    }
  }
  return result
}

export function reveal(board: Board, index: number): Board {
  const cells = board.cells.map((cell) => ({ ...cell }))
  if (cells[index]?.flagged || cells[index]?.open) return { ...board, cells }
  const queue = [index]
  const visited = new Set<number>()
  while (queue.length) {
    const current = queue.shift()
    if (current === undefined || visited.has(current)) continue
    visited.add(current)
    const cell = cells[current]
    if (!cell || cell.flagged || cell.open) continue
    cell.open = true
    if (!cell.mine && cell.adjacent === 0) neighbors(current, board.rows, board.columns).forEach((neighbor) => queue.push(neighbor))
  }
  return { ...board, cells }
}

export function toggleFlag(board: Board, index: number): Board {
  return { ...board, cells: board.cells.map((cell, cellIndex) => cellIndex === index && !cell.open ? { ...cell, flagged: !cell.flagged } : cell) }
}

export function isWin(board: Board): boolean {
  return board.cells.every((cell) => cell.mine || cell.open)
}

export function isMine(board: Board, index: number): boolean {
  return board.cells[index]?.mine ?? false
}
