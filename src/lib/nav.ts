import type { Section } from '@/lib/content'

export interface GroupDef {
  key: string
}

export const SECTION_GROUPS: Record<Section, GroupDef[]> = {
  help: [
    { key: 'getting-started' },
    { key: 'admin' },
    { key: 'buyers' },
    { key: 'vendors' },
    { key: 'service-providers' },
    { key: 'delivery' },
    { key: 'payments' },
    { key: 'trust-safety' },
    { key: 'faq' },
  ],
  developers: [
    { key: 'overview' },
    { key: 'authentication' },
    { key: 'api' },
    { key: 'payments' },
    { key: 'platform' },
    { key: 'deployment' },
  ],
}
