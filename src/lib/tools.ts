export interface ToolItem {
  path: string
  icon: string
  nameKey: string
  descKey: string
  categoryKey: string
}

export interface ToolCategory {
  icon: string
  titleKey: string
  tools: ToolItem[]
}

export const toolCategories: ToolCategory[] = [
  {
    icon: '🛠',
    titleKey: 'home.cat_format',
    tools: [
      { path: '/json-formatter', icon: '✨', nameKey: 'home.formatter', descKey: 'home.desc_formatter', categoryKey: 'home.cat_format' },
      { path: '/json-validator', icon: '✅', nameKey: 'home.validator', descKey: 'home.desc_validator', categoryKey: 'home.cat_format' },
      { path: '/json-compressor', icon: '📦', nameKey: 'home.compressor', descKey: 'home.desc_compressor', categoryKey: 'home.cat_format' },
      { path: '/json-repair', icon: '🔧', nameKey: 'home.repair', descKey: 'home.desc_repair', categoryKey: 'home.cat_format' },
      { path: '/json-viewer', icon: '🌳', nameKey: 'home.json_viewer', descKey: 'home.desc_json_viewer', categoryKey: 'home.cat_format' },
    ],
  },
  {
    icon: '🔄',
    titleKey: 'home.cat_convert',
    tools: [
      { path: '/json-to-csv', icon: '📊', nameKey: 'home.to_csv', descKey: 'home.desc_csv', categoryKey: 'home.cat_convert' },
      { path: '/csv-to-json', icon: '🔄', nameKey: 'home.csv_to_json', descKey: 'home.desc_csv_to_json', categoryKey: 'home.cat_convert' },
      { path: '/json-to-yaml', icon: '📝', nameKey: 'home.to_yaml', descKey: 'home.desc_yaml', categoryKey: 'home.cat_convert' },
      { path: '/json-to-typescript', icon: '🔷', nameKey: 'home.to_ts', descKey: 'home.desc_ts', categoryKey: 'home.cat_convert' },
      { path: '/json-to-java', icon: '☕', nameKey: 'home.to_java', descKey: 'home.desc_java', categoryKey: 'home.cat_convert' },
      { path: '/json-flatten', icon: '📐', nameKey: 'home.flatten', descKey: 'home.desc_flatten', categoryKey: 'home.cat_convert' },
      { path: '/json-converter', icon: '🔀', nameKey: 'home.converter_hub', descKey: 'home.desc_converter_hub', categoryKey: 'home.cat_convert' },
    ],
  },
  {
    icon: '⚡',
    titleKey: 'home.cat_codegen',
    tools: [
      { path: '/json-code-generator', icon: '⚡', nameKey: 'home.codegen', descKey: 'home.desc_codegen', categoryKey: 'home.cat_codegen' },
      { path: '/json-schema-generator', icon: '📋', nameKey: 'home.schema_gen', descKey: 'home.desc_schema_gen', categoryKey: 'home.cat_codegen' },
      { path: '/json-generator', icon: '⚡', nameKey: 'home.generator', descKey: 'home.desc_generator', categoryKey: 'home.cat_codegen' },
      { path: '/json-schema-validator', icon: '📋', nameKey: 'home.schema_validator', descKey: 'home.desc_schema_validator', categoryKey: 'home.cat_codegen' },
    ],
  },
  {
    icon: '🔍',
    titleKey: 'home.cat_devtools',
    tools: [
      { path: '/json-playground', icon: '🎮', nameKey: 'home.playground', descKey: 'home.desc_playground', categoryKey: 'home.cat_devtools' },
      { path: '/jsonpath', icon: '🔍', nameKey: 'home.jsonpath', descKey: 'home.desc_jsonpath', categoryKey: 'home.cat_devtools' },
      { path: '/json-diff', icon: '🔄', nameKey: 'home.diff', descKey: 'home.desc_diff', categoryKey: 'home.cat_devtools' },
      { path: '/jwt-decode', icon: '🔓', nameKey: 'home.jwt', descKey: 'home.desc_jwt', categoryKey: 'home.cat_devtools' },
      { path: '/json-stats', icon: '📊', nameKey: 'home.stats', descKey: 'home.desc_stats', categoryKey: 'home.cat_devtools' },
      { path: '/api-tester', icon: '🚀', nameKey: 'home.api_tester', descKey: 'home.desc_api_tester', categoryKey: 'home.cat_devtools' },
    ],
  },
]

export function getAllTools(): ToolItem[] {
  return toolCategories.flatMap(cat => cat.tools)
}

export function searchTools(query: string, t: (key: string) => string): ToolItem[] {
  const q = query.toLowerCase().trim()
  if (!q) return getAllTools()
  return getAllTools().filter(tool => {
    const name = t(tool.nameKey).toLowerCase()
    const desc = t(tool.descKey).toLowerCase()
    const cat = t(tool.categoryKey).toLowerCase()
    return name.includes(q) || desc.includes(q) || cat.includes(q)
  })
}
