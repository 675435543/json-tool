/**
 * JSON Statistics Analyzer
 * Analyzes JSON structure and returns detailed statistics.
 */

export interface JsonStats {
  totalKeys: number
  maxDepth: number
  objectCount: number
  arrayCount: number
  arrayItemCount: number
  stringCount: number
  numberCount: number
  integerCount: number
  booleanCount: number
  nullCount: number
  fileSizeBytes: number
  typeSummary: Record<string, number>
}

export function analyzeJSON(data: any, fileSizeBytes: number = 0): JsonStats {
  const stats: JsonStats = {
    totalKeys: 0,
    maxDepth: 0,
    objectCount: 0,
    arrayCount: 0,
    arrayItemCount: 0,
    stringCount: 0,
    numberCount: 0,
    integerCount: 0,
    booleanCount: 0,
    nullCount: 0,
    fileSizeBytes,
    typeSummary: {},
  }

  function traverse(value: any, depth: number) {
    stats.maxDepth = Math.max(stats.maxDepth, depth)

    if (value === null) {
      stats.nullCount++
      stats.typeSummary['null'] = (stats.typeSummary['null'] || 0) + 1
      return
    }

    const type = typeof value
    if (Array.isArray(value)) {
      stats.arrayCount++
      stats.typeSummary['array'] = (stats.typeSummary['array'] || 0) + 1
      stats.arrayItemCount += value.length
      for (const item of value) {
        traverse(item, depth + 1)
      }
    } else if (type === 'object') {
      stats.objectCount++
      stats.typeSummary['object'] = (stats.typeSummary['object'] || 0) + 1
      const keys = Object.keys(value)
      stats.totalKeys += keys.length
      for (const key of keys) {
        traverse(value[key], depth + 1)
      }
    } else if (type === 'string') {
      stats.stringCount++
      stats.typeSummary['string'] = (stats.typeSummary['string'] || 0) + 1
    } else if (type === 'number') {
      stats.numberCount++
      if (Number.isInteger(value)) {
        stats.integerCount++
        stats.typeSummary['integer'] = (stats.typeSummary['integer'] || 0) + 1
      } else {
        stats.typeSummary['float'] = (stats.typeSummary['float'] || 0) + 1
      }
    } else if (type === 'boolean') {
      stats.booleanCount++
      stats.typeSummary['boolean'] = (stats.typeSummary['boolean'] || 0) + 1
    }
  }

  traverse(data, 0)
  return stats
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}
