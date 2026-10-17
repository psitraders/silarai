import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import path from 'node:path'

// ── Storefront builder module boundaries (SB-R6, design.md §13) ───────────────
// • App code may import the builder only through src/storefront-builder/index.ts.
// • core/ and ui/ never import packs, templates, shell or editor.
// • A pack (packs/<kind>/<id>, templates/<id>) imports only its own folder,
//   core/, ui/ and shared app basics (api, utils, context, hooks, lib,
//   components/storefront) — never another pack, pages or the dashboard.
const SB_ROOT = path.resolve(import.meta.dirname, 'src/storefront-builder')
const SRC_ROOT = path.resolve(import.meta.dirname, 'src')
const APP_BASICS = ['api', 'utils', 'context', 'hooks', 'lib', path.join('components', 'storefront')]
const inside = (root, p) => { const r = path.relative(root, p); return !r.startsWith('..') && !path.isAbsolute(r) }

const storefrontBuilder = {
  rules: {
    boundaries: {
      meta: {
        type: 'problem',
        messages: {
          app: 'Import the storefront builder only through "src/storefront-builder" (its index.ts).',
          engine: 'core/ and ui/ must not depend on packs, templates, shell or editor.',
          pack: 'A pack may import only its own folder, core/, ui/ and shared app basics — not "{{target}}".',
        },
      },
      create(context) {
        const file = context.filename
        const fileInBuilder = inside(SB_ROOT, file)
        const check = (node, source) => {
          if (typeof source !== 'string' || !source.startsWith('.')) return
          const target = path.resolve(path.dirname(file), source)
          const targetInBuilder = inside(SB_ROOT, target)
          if (!fileInBuilder) {
            const rel = path.relative(SB_ROOT, target)
            if (targetInBuilder && rel !== '' && rel !== 'index' && rel !== 'index.ts') context.report({ node, messageId: 'app' })
            return
          }
          const parts = path.relative(SB_ROOT, file).split(path.sep)
          const targetTop = targetInBuilder ? path.relative(SB_ROOT, target).split(path.sep)[0] : null
          if (parts[0] === 'core' || parts[0] === 'ui') {
            if (targetTop && ['packs', 'templates', 'shell', 'editor'].includes(targetTop)) context.report({ node, messageId: 'engine' })
            return
          }
          if (parts[0] !== 'packs' && parts[0] !== 'templates') return
          const ownRoot = path.join(SB_ROOT, ...(parts[0] === 'packs' ? parts.slice(0, 3) : parts.slice(0, 2)))
          if (target === ownRoot || inside(ownRoot, target)) return
          if (targetInBuilder) {
            if (targetTop === 'core' || targetTop === 'ui') return
          } else {
            const appRel = path.relative(SRC_ROOT, target)
            if (APP_BASICS.some(b => appRel === b || appRel.startsWith(b + path.sep))) return
          }
          context.report({ node, messageId: 'pack', data: { target: source } })
        }
        return {
          ImportDeclaration: n => check(n, n.source.value),
          ImportExpression: n => { if (n.source.type === 'Literal') check(n, n.source.value) },
          ExportNamedDeclaration: n => { if (n.source) check(n, n.source.value) },
          ExportAllDeclaration: n => check(n, n.source.value),
        }
      },
    },
  },
}


export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'storefront-builder': storefrontBuilder },
    rules: { 'storefront-builder/boundaries': 'error' },
  },
])
