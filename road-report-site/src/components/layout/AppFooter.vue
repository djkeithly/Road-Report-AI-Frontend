<script setup lang="ts">
const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Risk Predictions', to: '/report' },
      { label: 'AI Chat', to: '/chat' },
      { label: 'Heatmap', to: '/' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Team', to: '/about' },
      { label: 'Tech Stack', to: '/about' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', to: '#' },
      { label: 'GitHub', href: 'https://github.com/djkeithly/Road-Report-AI-Frontend' },
      { label: 'TxDOT CRIS', href: 'https://cris.dot.state.tx.us/' },
    ],
  },
]
</script>

<template>
  <footer class="border-t border-border-0 bg-bg-0 transition-colors duration-base">
    <div class="max-w-layout mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Brand column -->
      <div>
        <div class="flex items-center gap-2 mb-2">
          <div
            class="w-5 h-5 rounded bg-accent text-text-on-accent
                   flex items-center justify-center font-mono text-[8px] font-bold"
          >
            RR
          </div>
          <span class="font-serif text-sm font-medium text-text-0">Road Report AI</span>
        </div>
        <p class="text-xs text-text-2 leading-relaxed max-w-[200px]">
          AI-powered crash risk predictions for Texas roads. Built with data from TxDOT CRIS and weather.gov.
        </p>
      </div>

      <!-- Link columns -->
      <div v-for="col in columns" :key="col.title">
        <div class="font-mono text-[10px] font-semibold uppercase tracking-wider text-text-2 mb-2">
          {{ col.title }}
        </div>
        <template v-for="link in col.links" :key="link.label">
          <a
            v-if="'href' in link"
            :href="(link as any).href"
            target="_blank"
            rel="noopener"
            class="block text-xs text-text-2 py-0.5 hover:text-text-0 transition-colors duration-fast"
          >
            {{ link.label }}
          </a>
          <RouterLink
            v-else
            :to="link.to!"
            class="block text-xs text-text-2 py-0.5 hover:text-text-0 transition-colors duration-fast"
          >
            {{ link.label }}
          </RouterLink>
        </template>
      </div>
    </div>

    <!-- Data note -->
    <div class="border-t border-border-1 px-6 py-4 max-w-layout mx-auto">
      <p class="font-mono text-[9px] text-text-3">
        Data sourced from TxDOT CRIS Query Tool, US Weather.gov API, Google Maps Platform,
        and TxDOT AADT. Records from 2016–2024. Risk scores are estimates.
      </p>
    </div>
  </footer>
</template>
