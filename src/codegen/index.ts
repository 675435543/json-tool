import { generatePython } from './python'
import { generateGo } from './go'
import { generateCSharp } from './csharp'
import { generateRust } from './rust'
import { generateKotlin } from './kotlin'
import { generatePHP } from './php'
import { generateRuby } from './ruby'
import { generateSwift } from './swift'
import { generateScala } from './scala'
import { generateGroovy } from './groovy'
import { generateC } from './c'
import { generateCpp } from './cpp'
import { generateSQL, type SqlDialect } from './sql'

export interface CodegenEntry {
  id: string
  labelKey: string  // i18n key
  commentPrefix: string  // comment syntax: "//", "#", "--"
  generate: (obj: any, rootName?: string) => string
}

export interface SqlEntry {
  id: string
  labelKey: string
  dialect: SqlDialect
}

/** Code languages (appear in "To Other Code" dropdown) */
export const codegenLanguages: CodegenEntry[] = [
  { id: 'python',    labelKey: 'codegen.python',    commentPrefix: '#',   generate: (o, n = 'Root') => generatePython(o, n) },
  { id: 'go',        labelKey: 'codegen.go',        commentPrefix: '//',  generate: (o, n = 'Root') => generateGo(o, n) },
  { id: 'csharp',    labelKey: 'codegen.csharp',    commentPrefix: '//',  generate: (o, n = 'Root') => generateCSharp(o, n) },
  { id: 'rust',      labelKey: 'codegen.rust',      commentPrefix: '//',  generate: (o, n = 'Root') => generateRust(o, n) },
  { id: 'kotlin',    labelKey: 'codegen.kotlin',    commentPrefix: '//',  generate: (o, n = 'Root') => generateKotlin(o, n) },
  { id: 'php',       labelKey: 'codegen.php',       commentPrefix: '//',  generate: (o, n = 'Root') => generatePHP(o, n) },
  { id: 'ruby',      labelKey: 'codegen.ruby',      commentPrefix: '#',   generate: (o, n = 'Root') => generateRuby(o, n) },
  { id: 'swift',     labelKey: 'codegen.swift',     commentPrefix: '//',  generate: (o, n = 'Root') => generateSwift(o, n) },
  { id: 'scala',     labelKey: 'codegen.scala',     commentPrefix: '//',  generate: (o, n = 'Root') => generateScala(o, n) },
  { id: 'groovy',    labelKey: 'codegen.groovy',    commentPrefix: '//',  generate: (o, n = 'Root') => generateGroovy(o, n) },
  { id: 'c',         labelKey: 'codegen.c',         commentPrefix: '//',  generate: (o, n = 'Root') => generateC(o, n) },
  { id: 'cpp',       labelKey: 'codegen.cpp',       commentPrefix: '//',  generate: (o, n = 'Root') => generateCpp(o, n) },
]

/** SQL dialects (appear in a separate "To SQL" dropdown) */
export const sqlDialects: CodegenEntry[] = [
  { id: 'sql_mysql',  labelKey: 'codegen.mysql',  commentPrefix: '--', generate: (o, n = 'TableName') => generateSQL(o, n, 'mysql') },
  { id: 'sql_oracle', labelKey: 'codegen.oracle', commentPrefix: '--', generate: (o, n = 'TableName') => generateSQL(o, n, 'oracle') },
  { id: 'sql_sqlite', labelKey: 'codegen.sqlite', commentPrefix: '--', generate: (o, n = 'TableName') => generateSQL(o, n, 'sqlite') },
]
