import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'memos',
  title: 'Memos',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9Labs/memos-startos',
  upstreamRepo: 'https://github.com/usememos/memos',
  marketingUrl: 'https://usememos.com',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    memos: {
      source: { dockerTag: 'neosmemo/memos:0.29.1' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  hardwareRequirements: {
    ram: 256,
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
