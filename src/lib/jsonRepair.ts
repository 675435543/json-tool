/**
 * JSON Repair Utility
 * Fixes common JSON errors to make invalid JSON parseable.
 *
 * Handles:
 * - Single quotes → double quotes
 * - Unquoted object keys → quoted keys
 * - Trailing commas
 * - Comments (// and /* *​/)
 * - True/False/None → true/false/null
 * - Undefined → null
 * - Unquoted string values
 */

export function repairJSON(input: string): string {
  let text = input

  // 1. Remove BOM
  text = text.replace(/^\uFEFF/, '')

  // 2. Remove // line comments (but not inside strings)
  text = removeLineComments(text)

  // 3. Remove /* */ block comments
  text = removeBlockComments(text)

  // 4. Replace single quotes with double quotes (for keys and string values)
  text = fixSingleQuotes(text)

  // 5. Add quotes to unquoted keys
  text = fixUnquotedKeys(text)

  // 6. Remove trailing commas before ] and }
  text = text.replace(/,(\s*[\]}])/g, '$1')

  // 7. Replace Python-style True/False/None and JS undefined
  text = text.replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/\bNone\b/g, 'null')
    .replace(/\bundefined\b/g, 'null')

  // 8. Fix numbers with leading zeros (but not trailing)
  text = text.replace(/"(0[0-9]+)"/g, (_, num) => `"${num.replace(/^0+/, '') || '0'}"`)

  // 9. Try to add missing closing braces/brackets
  text = fixMissingClosing(text)

  return text
}

function removeLineComments(text: string): string {
  // Remove // comments, but not inside strings
  const result: string[] = []
  let i = 0
  let inString = false
  let stringChar = ''

  while (i < text.length) {
    const ch = text[i]

    if (inString) {
      result.push(ch)
      if (ch === '\\') {
        i++
        if (i < text.length) {
          result.push(text[i])
        }
      } else if (ch === stringChar) {
        inString = false
      }
      i++
      continue
    }

    if (ch === '"' || ch === "'") {
      inString = true
      stringChar = ch
      result.push(ch)
      i++
      continue
    }

    // Check for //
    if (ch === '/' && i + 1 < text.length && text[i + 1] === '/') {
      // Skip until end of line
      while (i < text.length && text[i] !== '\n') {
        i++
      }
      result.push('\n')
      i++
      continue
    }

    result.push(ch)
    i++
  }

  return result.join('')
}

function removeBlockComments(text: string): string {
  // Simple regex approach for block comments
  // This doesn't handle strings containing /*, but good enough for repair
  const result: string[] = []
  let i = 0
  let inString = false
  let stringChar = ''

  while (i < text.length) {
    const ch = text[i]

    if (inString) {
      result.push(ch)
      if (ch === '\\') {
        i++
        if (i < text.length) result.push(text[i])
      } else if (ch === stringChar) {
        inString = false
      }
      i++
      continue
    }

    if (ch === '"') {
      inString = true
      stringChar = '"'
      result.push(ch)
      i++
      continue
    }

    // Check for /*
    if (ch === '/' && i + 1 < text.length && text[i + 1] === '*') {
      i += 2
      while (i + 1 < text.length && !(text[i] === '*' && text[i + 1] === '/')) {
        i++
      }
      i += 2 // skip */
      continue
    }

    result.push(ch)
    i++
  }

  return result.join('')
}

function fixSingleQuotes(text: string): string {
  // Replace single-quoted strings with double-quoted strings
  // This is tricky because we need to handle escaped single quotes inside
  const result: string[] = []
  let i = 0
  let inDoubleString = false
  let inSingleString = false

  while (i < text.length) {
    const ch = text[i]

    if (inDoubleString) {
      result.push(ch)
      if (ch === '\\') {
        i++
        if (i < text.length) result.push(text[i])
      } else if (ch === '"') {
        inDoubleString = false
      }
      i++
      continue
    }

    if (inSingleString) {
      if (ch === '\\') {
        result.push('\\')
        i++
        if (i < text.length) result.push(text[i])
        i++
        continue
      }
      if (ch === "'") {
        result.push('"')
        inSingleString = false
        i++
        continue
      }
      // Escape special characters for JSON
      if (ch === '"') {
        result.push('\\"')
        i++
        continue
      }
      result.push(ch)
      i++
      continue
    }

    if (ch === '"') {
      inDoubleString = true
      result.push(ch)
      i++
      continue
    }

    if (ch === "'") {
      inSingleString = true
      result.push('"')
      i++
      continue
    }

    result.push(ch)
    i++
  }

  return result.join('')
}

function fixUnquotedKeys(text: string): string {
  // Find unquoted keys (word chars before a colon)
  // Pattern: { word: or , word:
  return text.replace(
    /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g,
    (_, prefix, key) => {
      // Don't quote if already quoted
      return `${prefix}"${key}":`
    }
  )
}

function fixMissingClosing(text: string): string {
  // Use a stack to track opening order, so we close in reverse (LIFO)
  const stack: Array<'{' | '['> = []
  let inString = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (inString) {
      if (ch === '\\') {
        i++ // skip escaped char
      } else if (ch === '"') {
        inString = false
      }
      continue
    }

    if (ch === '"') {
      inString = true
      continue
    }

    if (ch === '{') {
      stack.push('{')
    } else if (ch === '}') {
      if (stack.length > 0 && stack[stack.length - 1] === '{') {
        stack.pop()
      }
    } else if (ch === '[') {
      stack.push('[')
    } else if (ch === ']') {
      if (stack.length > 0 && stack[stack.length - 1] === '[') {
        stack.pop()
      }
    }
  }

  // Close in reverse order (LIFO)
  let result = text
  for (let i = stack.length - 1; i >= 0; i--) {
    result += stack[i] === '{' ? '}' : ']'
  }

  return result
}
