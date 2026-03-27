<script setup lang="ts">
type InternalLink = { label: string; to: string }
type ExternalLink = { label: string; href: string }
type FooterColumn = {
  title: string
  links: Array<InternalLink | ExternalLink>
}

const columns: FooterColumn[] = [
  {
    title: 'Project',
    links: [
      { label: 'Overview', to: '/about' },
      { label: 'Data Sources', to: '/about' },
      { label: 'RRS Method', to: '/about' },
      { label: 'Team', to: '/about' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Chat', to: '/chat' },
      { label: 'Report', to: '/report' },
      { label: 'About', to: '/about' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', to: '/about' },
      { label: 'GitHub', href: 'https://github.com/djkeithly/Road-Report-AI-Frontend' },
      { label: 'TxDOT CRIS', href: 'https://cris.dot.state.tx.us/' },
      { label: 'Weather.gov', href: 'https://www.weather.gov/documentation/services-web-api' },
    ],
  },
]
</script>

<template>
  <footer class="border-t border-border-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--bg-0)_78%,transparent),var(--bg-0))] transition-colors duration-base">
    <div class="mx-auto max-w-[1320px] px-6 py-12" style="padding: 3rem;">

      <div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 3rem; align-items: flex-start;">

        <div style="display: flex; flex-direction: column; max-width: 280px;">
          <div class="flex items-center gap-2 text-[15px] font-semibold text-text-0">
            <div class="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-accent font-mono text-[8px] font-bold text-text-on-accent">
              RR
            </div>
            <span>Road Report AI</span>
          </div>
          <p class="mt-3 max-w-[240px] text-[12px] leading-[1.6] text-text-2">
            AI-powered crash risk predictions for Texas roads.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4rem;">
          <div v-for="col in columns" :key="col.title" style="display: flex; flex-direction: column;">
            <div class="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-text-2">
              {{ col.title }}
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <template v-for="link in col.links" :key="link.label">
                <a
                  v-if="'href' in link"
                  :href="link.href"
                  target="_blank"
                  rel="noopener"
                  class="text-[12px] text-text-2 transition-colors duration-fast hover:text-text-0"
                >
                  {{ link.label }}
                </a>
                <RouterLink
                  v-else
                  :to="link.to"
                  class="text-[12px] text-text-2 transition-colors duration-fast hover:text-text-0"
                >
                  {{ link.label }}
                </RouterLink>
              </template>
            </div>
          </div>
        </div>

      </div>

      <div style="margin-top: 3rem; padding-top: 1.5rem;" class="border-t border-border-1 font-mono text-[10px] leading-relaxed text-text-2">
        Risk scores are estimates derived from historical crash data and current conditions. Data sourced from TxDOT CRIS Query Tool, US Weather.gov API, Google Maps Platform, and TxDOT AADT.
      </div>

    </div>
  </footer>
</template>
