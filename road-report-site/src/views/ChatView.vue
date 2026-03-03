<script setup lang="ts">
/**
 * ChatView — AI Chat Interface
 * Wireframe: Screen 2 (Chat)
 *
 * Layout: sidebar (chat history) + main (messages + input)
 * Sidebar hidden on mobile (TODO: slide-out drawer)
 */
import { ref } from 'vue'
import ScoreRing from '@/components/ScoreRing.vue'
import RiskBadge from '@/components/RiskBadge.vue'

const chatInput = ref('')

// Placeholder chat sessions for the sidebar
const sessions = [
  { id: '1', title: 'I-35 Austin safety check', group: 'Today', active: true },
  { id: '2', title: 'US-290 Houston commute', group: 'Today', active: false },
  { id: '3', title: 'Loop 1604 weekend trip', group: 'Yesterday', active: false },
  { id: '4', title: 'SH-130 Georgetown analysis', group: 'Yesterday', active: false },
  { id: '5', title: 'Dallas I-635 rush hour', group: 'Last week', active: false },
]

// Group sessions by their group label
const groupedSessions = sessions.reduce(
  (acc, s) => {
    ;(acc[s.group] ??= []).push(s)
    return acc
  },
  {} as Record<string, typeof sessions>,
)
</script>

<template>
  <div class="animate-fade-in max-w-layout mx-auto px-6 pt-4 pb-6">
    <div class="border border-border-0 rounded-lg overflow-hidden bg-bg-card shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-[220px_1fr] h-[560px]">

        <!-- ======== SIDEBAR ======== -->
        <aside
          class="hidden md:flex flex-col border-r border-border-0 bg-bg-1 p-4 overflow-y-auto"
        >
          <!-- Header -->
          <div class="flex justify-between items-center mb-3">
            <span class="text-[13px] font-semibold">Chats</span>
            <button
              class="w-6 h-6 rounded border border-border-0 bg-bg-card
                     text-text-1 flex items-center justify-center text-sm
                     hover:text-text-0 transition-colors duration-fast"
            >
              +
            </button>
          </div>

          <!-- Search -->
          <input
            type="text"
            placeholder="Search chats..."
            class="w-full px-2.5 py-1.5 rounded-md border border-border-1 bg-bg-card
                   text-xs text-text-0 placeholder:text-text-3
                   outline-none focus:border-accent mb-3"
          />

          <!-- Session list -->
          <template v-for="(items, group) in groupedSessions" :key="group">
            <div class="font-mono text-[9px] font-semibold uppercase tracking-wider text-text-3 mt-2 mb-1">
              {{ group }}
            </div>
            <button
              v-for="s in items"
              :key="s.id"
              class="w-full text-left text-[11px] px-2 py-1.5 rounded-md mb-0.5 transition-colors duration-fast"
              :class="s.active
                ? 'bg-bg-card text-text-0 font-medium border border-border-1'
                : 'text-text-2 hover:bg-bg-card/50'"
            >
              {{ s.title }}
            </button>
          </template>
        </aside>

        <!-- ======== MAIN CHAT ======== -->
        <div class="flex flex-col">
          <!-- Messages -->
          <div class="flex-1 overflow-y-auto p-5 space-y-4">

            <!-- User message -->
            <div class="flex gap-2.5 items-start">
              <div
                class="w-7 h-7 rounded-full bg-bg-2 flex items-center justify-center
                       text-[10px] font-semibold text-text-2 flex-shrink-0"
              >
                D
              </div>
              <div class="bg-bg-1 border border-border-1 rounded-md px-3 py-2 max-w-[80%]">
                <p class="text-[13px]">How safe is I-35 southbound near downtown Austin right now?</p>
              </div>
            </div>

            <!-- AI response with risk card -->
            <div class="flex gap-2.5 items-start">
              <div
                class="w-7 h-7 rounded-full bg-accent text-text-on-accent
                       flex items-center justify-center
                       text-[9px] font-bold flex-shrink-0"
              >
                RR
              </div>
              <div class="bg-bg-card border border-border-0 rounded-md px-3 py-2.5 max-w-[85%]">
                <p class="text-[13px] mb-2">Here's the current safety report for I-35 Southbound:</p>

                <!-- Inline risk card -->
                <div class="border border-border-0 rounded-md p-3 bg-bg-0">
                  <!-- Road + badge -->
                  <div class="flex justify-between items-center mb-2.5">
                    <span class="font-mono text-[11px] font-semibold">I-35 S — Exit 233, Austin</span>
                    <RiskBadge tier="moderate" />
                  </div>

                  <!-- Score + label -->
                  <div class="flex items-center gap-3 mb-3">
                    <ScoreRing :score="64" tier="moderate" size="sm" />
                    <div>
                      <div class="text-xs font-semibold">Road Risk Score: 64 / 100</div>
                      <div class="font-mono text-[10px] text-text-2">
                        RRS = 0.35(10) + 0.30(20) + 0.20(12) + 0.15(12)
                      </div>
                    </div>
                  </div>

                  <!-- Factor bars -->
                  <div class="space-y-1.5">
                    <div v-for="f in [
                      { icon: '🛣', label: 'Road Cond.', pct: 33, val: '10/30', color: 'var(--risk-mod)' },
                      { icon: '📊', label: 'Historical', pct: 80, val: '20/25', color: 'var(--risk-high)' },
                      { icon: '☁', label: 'Environmental', pct: 48, val: '12/25', color: 'var(--risk-mod)' },
                      { icon: '🚗', label: 'Traffic', pct: 60, val: '12/20', color: 'var(--risk-high)' },
                    ]" :key="f.label"
                      class="grid grid-cols-[90px_1fr_36px] items-center gap-2 font-mono text-[10px]"
                    >
                      <span class="text-text-2">{{ f.icon }} {{ f.label }}</span>
                      <div class="h-[5px] rounded-full bg-bg-2 overflow-hidden">
                        <div
                          class="h-full rounded-full transition-all duration-[800ms]"
                          :style="{ width: f.pct + '%', background: f.color }"
                        />
                      </div>
                      <span class="text-right font-semibold">{{ f.val }}</span>
                    </div>
                  </div>

                  <!-- Advice -->
                  <div
                    class="mt-2.5 px-2.5 py-2 rounded-md bg-accent-muted
                           border border-dashed border-accent/20
                           text-[10px] text-text-1 leading-relaxed"
                  >
                    💡 Rain + rush hour. 127 crashes/yr this segment.
                    Consider MoPac (Loop 1) as alternate, or delay 30 min.
                  </div>
                </div>
              </div>
            </div>

            <!-- Second user message -->
            <div class="flex gap-2.5 items-start">
              <div
                class="w-7 h-7 rounded-full bg-bg-2 flex items-center justify-center
                       text-[10px] font-semibold text-text-2 flex-shrink-0"
              >
                D
              </div>
              <div class="bg-bg-1 border border-border-1 rounded-md px-3 py-2 max-w-[80%]">
                <p class="text-[13px]">What about MoPac northbound? Is it safer right now?</p>
              </div>
            </div>

            <!-- Second AI response -->
            <div class="flex gap-2.5 items-start">
              <div
                class="w-7 h-7 rounded-full bg-accent text-text-on-accent
                       flex items-center justify-center
                       text-[9px] font-bold flex-shrink-0"
              >
                RR
              </div>
              <div class="bg-bg-card border border-border-0 rounded-md px-3 py-2.5 max-w-[85%]">
                <div class="border border-border-0 rounded-md p-3 bg-bg-0">
                  <div class="flex justify-between items-center mb-2.5">
                    <span class="font-mono text-[11px] font-semibold">Loop 1 (MoPac) N — Austin</span>
                    <RiskBadge tier="low" />
                  </div>
                  <div class="flex items-center gap-3">
                    <ScoreRing :score="32" tier="low" size="sm" />
                    <div>
                      <div class="text-xs font-semibold">Road Risk Score: 32 / 100</div>
                      <div class="text-[11px] text-text-2">Significantly lower risk than I-35</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ======== INPUT BAR ======== -->
          <div class="border-t border-border-0 p-3">
            <div
              class="flex items-center gap-2.5 bg-bg-input border border-border-0
                     rounded-lg py-1.5 pl-4 pr-1.5
                     focus-within:border-accent focus-within:shadow-ring
                     transition-all duration-fast"
            >
              <input
                v-model="chatInput"
                type="text"
                placeholder="Ask about any road in Texas..."
                class="flex-1 bg-transparent border-none outline-none text-sm
                       text-text-0 placeholder:text-text-3"
              />
              <!-- Attach -->
              <button class="w-8 h-8 rounded-md text-text-2 hover:text-text-1 flex items-center justify-center">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
              <!-- Send -->
              <button
                class="w-8 h-8 rounded-md bg-accent text-text-on-accent
                       flex items-center justify-center
                       hover:bg-accent-hover transition-colors duration-fast"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
