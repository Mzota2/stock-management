import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { read, utils } from 'xlsx'

const str = (v) => (v === undefined || v === null ? '' : String(v).trim())
const isBlank = (v) => str(v) === '' || str(v) === '-'
const cleanQty = (v) => (isBlank(v) ? '' : str(v))
const sheetRows = (wb, name) =>
  utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '', blankrows: false })
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function parseGaldi() {
  const wb = read(readFileSync('data/CONIPAK-3000-SPARE-PARTS-LIST-187231.xlsx'))
  const index = sheetRows(wb, 'Section Index')
  const titles = new Map()
  for (const r of index) {
    if (typeof r[0] === 'number' && r[1]) titles.set(str(r[1]), str(r[2]))
  }

  const sections = wb.SheetNames.slice(1).map((sheet, sIdx) => {
    const rows = sheetRows(wb, sheet)
    const headerIdx = rows.findIndex((r) => r.map(str).includes('Part Code'))
    const code = str(rows[0][0])
    const title = titles.get(code) || (headerIdx > 1 ? str(rows[1][0]) : code)
    const parts = []
    rows.slice(headerIdx + 1).forEach((r, i) => {
      const partNumber = str(r[1])
      const descEn = str(r[3])
      const descIt = str(r[2])
      if (!partNumber && !descEn && !descIt) return
      parts.push({
        id: `g${String(sIdx + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
        item: str(r[0]),
        partNumber,
        description: descEn || descIt,
        descriptionAlt: descEn && descIt && descIt !== descEn ? descIt : '',
        qty: cleanQty(r[4]),
      })
    })
    return {
      id: slug(code),
      code,
      title,
      drawing: code,
      parts,
    }
  })

  return {
    id: 'galdi',
    name: 'GALDI',
    model: 'CONIPAK 3000',
    sections,
  }
}

const NIMCO_SKIP = new Set(['INDEX', 'Technical Data', 'Illustrations Index'])

const NIMCO_TABLES = {
  'Table of Sprockets': (r, group) => ({
    item: str(r[0]),
    partNumber: str(r[4]) || (str(r[3]) !== 'T.L.B.' ? str(r[3]) : ''),
    description: [group, str(r[1]), str(r[2]), str(r[3]) === 'T.L.B.' ? '(T.L.B.)' : '']
      .filter(Boolean)
      .join(' '),
    qty: cleanQty(r[5]),
  }),
  'Table of Roller Chains': (r, group) => ({
    item: str(r[0]),
    partNumber: str(r[4]) || str(r[3]),
    description: [group, str(r[1]), str(r[2]), str(r[4]) ? str(r[3]) : '']
      .filter(Boolean)
      .join(' '),
    qty: cleanQty(r[5]),
  }),
  'Table of Cam Followers': (r) => ({
    item: '',
    partNumber: str(r[0]),
    description: [`Cam Follower ${str(r[1])}`.trim(), str(r[2]) && `(${str(r[2])})`, str(r[3]) && `— ${str(r[3])}`]
      .filter(Boolean)
      .join(' '),
    qty: cleanQty(r[4]),
  }),
  'Table of Bearings': (r) => ({
    item: '',
    partNumber: str(r[0]),
    description: [str(r[1]), str(r[2]), str(r[3]) && `Ø${str(r[3])}mm shaft`].filter(Boolean).join(' '),
    qty: cleanQty(r[4]),
  }),
  'Table of Springs': (r) => ({
    item: '',
    partNumber: str(r[0]),
    description: [`${str(r[1])} Spring`, str(r[2]), str(r[3]), str(r[4]) && `— ${str(r[4])}`]
      .filter(Boolean)
      .join(' '),
    qty: cleanQty(r[5]),
  }),
  'Table of O-Rings': (r) => ({
    item: '',
    partNumber: str(r[0]),
    description: [`O-Ring ${str(r[1])}`, str(r[2]) && `— ${str(r[2])}`].filter(Boolean).join(' '),
    qty: cleanQty(r[3]),
  }),
  'Table of Bushes': (r) => ({
    item: '',
    partNumber: str(r[0]),
    description: [`Bush ${str(r[1])}`, str(r[2]), str(r[3]) && `— ${str(r[3])}`].filter(Boolean).join(' '),
    qty: cleanQty(r[4]),
  }),
}

function parseNimco() {
  const wb = read(readFileSync('data/NIMCO_8080_Parts_FULL-Lists-5087dc.xlsx'))
  const sheets = wb.SheetNames.filter((n) => !NIMCO_SKIP.has(n))

  const sections = sheets.map((sheet, sIdx) => {
    const rows = sheetRows(wb, sheet)
    const meta = str(rows[1]?.[0])
    const drawing = str(meta.match(/Drawing No\.:\s*([^]*?)\s{2,}Section/)?.[1]).replace(/^-$/, '')
    const sectionCode = str(meta.match(/Section:\s*(.+)$/)?.[1]).replace(/^-$/, '')
    const mapper = NIMCO_TABLES[sheet]
    const parts = []
    let group = ''

    rows.slice(3).forEach((r, i) => {
      const filled = r.map(str).filter(Boolean)
      if (filled.length === 0) return
      if (mapper && filled.length === 1 && str(r[0])) {
        group = str(r[0]).replace(/s$/, '')
        return
      }
      const part = mapper
        ? mapper(r, group)
        : {
            item: str(r[0]),
            partNumber: str(r[2]),
            description: str(r[1]) + (str(r[4]) ? ` (${str(r[4])})` : ''),
            qty: cleanQty(r[3]),
          }
      if (!part.partNumber && !part.description) return
      if (part.item === '-') part.item = ''
      parts.push({
        id: `n${String(sIdx + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
        item: part.item,
        partNumber: part.partNumber === '-' ? '' : part.partNumber,
        description: part.description,
        descriptionAlt: '',
        qty: part.qty,
      })
    })

    return {
      id: slug(sheet),
      code: sectionCode || drawing || sheet,
      title: sheet,
      drawing,
      parts,
    }
  })

  return {
    id: 'nimco',
    name: 'NIMCO',
    model: '8080',
    sections,
  }
}

mkdirSync('lib/data', { recursive: true })
for (const machine of [parseGaldi(), parseNimco()]) {
  writeFileSync(`lib/data/${machine.id}.json`, JSON.stringify(machine))
  const total = machine.sections.reduce((n, s) => n + s.parts.length, 0)
  console.log(machine.id, machine.sections.length, 'sections', total, 'parts')
}
