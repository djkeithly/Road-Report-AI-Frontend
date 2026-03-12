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
  <footer class="border-t border-border-0 bg-bg-0 transition-colors duration-base">
    <div class="mx-auto grid max-w-layout grid-cols-1 gap-6 px-6 py-9 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
      <div>
        <div class="flex items-center gap-2 text-[15px] font-semibold text-text-0">
          <div class="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-accent font-mono text-[8px] font-bold text-text-on-accent">
            RR
          </div>
          <span>Road Report AI</span>
        </div>
        <p class="mt-2 max-w-[220px] text-[12px] leading-[1.5] text-text-2">
          AI-powered crash risk predictions for Texas roads.
        </p>
        <div class="mt-4 flex gap-[10px]">
          <a href="#" class="grid h-[34px] w-[34px] place-items-center rounded-full border border-border-1 text-text-2 transition-all duration-fast hover:-translate-y-px hover:text-text-0" aria-label="X">
            <svg viewBox="0 0 24 24" class="h-4 w-4" aria-hidden="true"><path fill="currentColor" d="M18.9 2H22l-6.8 7.8L23 22h-6.7l-5.2-6.8L4.9 22H2l7.3-8.4L1 2h6.9l4.7 6.1L18.9 2Zm-1.2 18h1.7L6.2 4H4.4l13.3 16Z"/></svg>
          </a>
          <a href="#" class="grid h-[34px] w-[34px] place-items-center rounded-full border border-border-1 text-text-2 transition-all duration-fast hover:-translate-y-px hover:text-text-0" aria-label="YouTube">
            <svg viewBox="0 0 24 24" class="h-4 w-4" aria-hidden="true"><path fill="currentColor" d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5A3 3 0 0 0 2.4 7.2 31.2 31.2 0 0 0 2 12a31.2 31.2 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1A31.2 31.2 0 0 0 22 12a31.2 31.2 0 0 0-.4-4.8ZM10.2 15.3V8.7L16 12l-5.8 3.3Z"/></svg>
          </a>
          <a href="#" class="grid h-[34px] w-[34px] place-items-center rounded-full border border-border-1 text-text-2 transition-all duration-fast hover:-translate-y-px hover:text-text-0" aria-label="Instagram">
            <svg viewBox="0 0 24 24" class="h-4 w-4" aria-hidden="true"><path fill="currentColor" d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm10.2 1.6a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>
          </a>
        </div>
      </div>

      <div v-for="col in columns" :key="col.title">
        <div class="mb-[10px] font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-text-2">
          {{ col.title }}
        </div>
        <template v-for="link in col.links" :key="link.label">
          <a
            v-if="'href' in link"
            :href="link.href"
            target="_blank"
            rel="noopener"
            class="block py-[2px] text-[12px] text-text-2 transition-colors duration-fast hover:text-text-0"
          >
            {{ link.label }}
          </a>
          <RouterLink
            v-else
            :to="link.to"
            class="block py-[2px] text-[12px] text-text-2 transition-colors duration-fast hover:text-text-0"
          >
            {{ link.label }}
          </RouterLink>
        </template>
      </div>

      <div class="border-t border-border-1 pt-4 font-mono text-[10px] text-text-2 sm:col-span-2 lg:col-span-4">
        Risk scores are estimates derived from historical crash data and current conditions. Data sourced from TxDOT CRIS Query Tool, US Weather.gov API, Google Maps Platform, and TxDOT AADT.
      </div>
    </div>
  </footer>
</template>
