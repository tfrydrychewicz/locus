export default {
  locales: ['en', 'pl'],
  defaultNamespace: 'common',
  namespaceSeparator: ':',
  keySeparator: '.',
  output: 'src/locales/$LOCALE/$NAMESPACE.json',
  input: [
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../apps/desktop/src/**/*.{ts,tsx}',
    '../../apps/mobile/src/**/*.{ts,tsx}',
  ],
  sort: true,
  createOldCatalogs: false,
  keepRemoved: false,
  failOnWarnings: true,
  failOnUpdate: true,
  verbose: true,
}
