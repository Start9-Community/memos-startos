import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.30.0:0',
  releaseNotes: {
    en_US: 'Initial release of Memos for StartOS.',
    es_ES: 'Versión inicial de Memos para StartOS.',
    de_DE: 'Erstveröffentlichung von Memos für StartOS.',
    pl_PL: 'Pierwsze wydanie Memos dla StartOS.',
    fr_FR: 'Version initiale de Memos pour StartOS.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
