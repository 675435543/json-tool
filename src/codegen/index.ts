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
import { generateSQL } from './sql'

export interface CodegenEntry {
  id: string
  labelKey: string  // i18n key for the language name
  generate: (obj: any, rootName?: string) => string
}

export const codegenLanguages: CodegenEntry[] = [
  { id: 'python',    labelKey: 'codegen.python',    generate: (o, n = 'Root') => generatePython(o, n) },
  { id: 'go',        labelKey: 'codegen.go',        generate: (o, n = 'Root') => generateGo(o, n) },
  { id: 'csharp',    labelKey: 'codegen.csharp',    generate: (o, n = 'Root') => generateCSharp(o, n) },
  { id: 'rust',      labelKey: 'codegen.rust',      generate: (o, n = 'Root') => generateRust(o, n) },
  { id: 'kotlin',    labelKey: 'codegen.kotlin',    generate: (o, n = 'Root') => generateKotlin(o, n) },
  { id: 'php',       labelKey: 'codegen.php',       generate: (o, n = 'Root') => generatePHP(o, n) },
  { id: 'ruby',      labelKey: 'codegen.ruby',      generate: (o, n = 'Root') => generateRuby(o, n) },
  { id: 'swift',     labelKey: 'codegen.swift',     generate: (o, n = 'Root') => generateSwift(o, n) },
  { id: 'scala',     labelKey: 'codegen.scala',     generate: (o, n = 'Root') => generateScala(o, n) },
  { id: 'groovy',    labelKey: 'codegen.groovy',    generate: (o, n = 'Root') => generateGroovy(o, n) },
  { id: 'c',         labelKey: 'codegen.c',         generate: (o, n = 'Root') => generateC(o, n) },
  { id: 'cpp',       labelKey: 'codegen.cpp',       generate: (o, n = 'Root') => generateCpp(o, n) },
  { id: 'sql',       labelKey: 'codegen.sql',       generate: (o, n = 'TableName') => generateSQL(o, n) },
]
