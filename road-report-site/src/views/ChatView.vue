<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import RiskBadge from '@/components/RiskBadge.vue'
import ScoreRing from '@/components/ScoreRing.vue'

type SessionGroup = 'Today' | 'Yesterday' | 'Last week'

type ChatSession = {
  id: string
  title: string
  group: SessionGroup
}

type MessageFactor = {
  label: string
  value: string
  width: string
  color: string
}

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  score?: number
  tier?: 'low' | 'moderate' | 'high'
  road?: string
  formula?: string
  factors?: MessageFactor[]
  advice?: string
}

const route = useRoute()
const chatInput = ref('')
const selectedFile = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const prefetchedQuery = ref('')

const sessions = ref<ChatSession[]>([
  { id: '1', title: 'I-35 Austin safety check', group: 'Today' },
  { id: '2', title: 'US-290 Houston commute', group: 'Today' },
  { id: '3', title: 'Loop 1604 weekend trip', group: 'Yesterday' },
  { id: '4', title: 'SH-130 Georgetown analysis', group: 'Yesterday' },
  { id: '5', title: 'Dallas I-635 rush hour', group: 'Last week' },
  { id: '6', title: 'Corpus Christi SH-358', group: 'Last week' },
])

const activeSessionId = ref('1')

const messagesBySession = ref<Record<string, ChatMessage[]>>({
  '1': [
    {
      id: '1',
      role: 'user',
      text: 'How safe is I-35 southbound near downtown Austin right now?',
    },
    {
      id: '2',
      role: 'assistant',
      text: "Here's the current safety report for I-35 Southbound near downtown Austin:",
      score: 64,
      tier: 'moderate',
      road: 'I-35 S - Exit 233, Austin',
      formula: 'RRS = 0.35(10) + 0.30(20) + 0.20(12) + 0.15(12)',
      factors: [
        { label: 'Road Condition', value: '10 / 30', width: '33%', color: 'var(--risk-mod)' },
        { label: 'Historical', value: '20 / 25', width: '80%', color: 'var(--risk-high)' },
        { label: 'Environmental', value: '12 / 25', width: '48%', color: 'var(--risk-mod)' },
        { label: 'Traffic', value: '12 / 20', width: '60%', color: 'var(--risk-high)' },
      ],
      advice: 'Currently raining with heavy rush-hour traffic. I-35 near downtown Austin averages 127 crashes per year in this segment. Consider Loop 1 as an alternate or delay departure by 30 minutes.',
    },
    {
      id: '3',
      role: 'user',
      text: 'What about MoPac northbound? Is it safer right now?',
    },
    {
      id: '4',
      role: 'assistant',
      text: 'MoPac Loop 1 Northbound is looking better right now:',
      score: 32,
      tier: 'low',
      road: 'Loop 1 (MoPac) N - Austin',
      factors: [
        { label: 'Relative comparison', value: 'Lower than I-35', width: '32%', color: 'var(--risk-low)' },
      ],
    },
  ],
})

const groupedSessions = computed(() => {
  const groups: Record<SessionGroup, ChatSession[]> = {
    Today: [],
    Yesterday: [],
    'Last week': [],
  }

  for (const session of sessions.value) groups[session.group].push(session)
  return groups
})

const activeMessages = computed(() => messagesBySession.value[activeSessionId.value] ?? [])

function selectSession(id: string) {
  activeSessionId.value = id
}

function startNewChat() {
  const id = `${Date.now()}`
  sessions.value.unshift({ id, title: 'New road risk chat', group: 'Today' })
  messagesBySession.value[id] = [
    {
      id: '1',
      role: 'assistant',
      text: 'New chat started. Ask about any Texas road and I will generate a risk summary.',
    },
  ]
  activeSessionId.value = id
  chatInput.value = ''
  selectedFile.value = ''
}

function attachFile() {
  fileInput.value?.click()
}

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  selectedFile.value = target.files?.[0]?.name ?? ''
}

function sendMessage(messageText?: string) {
  const text = (messageText ?? chatInput.value).trim()
  if (!text) return

  const current = messagesBySession.value[activeSessionId.value] ?? []

  current.push({
    id: `${Date.now()}-u`,
    role: 'user',
    text,
  })

  current.push({
    id: `${Date.now()}-a`,
    role: 'assistant',
    text: `For "${text}", current risk is moderate. Watch weather shifts, intersections, and peak traffic windows before departure.`,
    score: 58,
    tier: 'moderate',
    road: text,
    formula: 'Model summary based on current weather, crash history, and traffic proxies',
    factors: [
      { label: 'Road Condition', value: '9 / 30', width: '30%', color: 'var(--risk-mod)' },
      { label: 'Historical', value: '18 / 25', width: '72%', color: 'var(--risk-high)' },
      { label: 'Environmental', value: '11 / 25', width: '44%', color: 'var(--risk-mod)' },
      { label: 'Traffic', value: '11 / 20', width: '55%', color: 'var(--risk-high)' },
    ],
    advice: 'Conditions are serviceable, but crash history and active traffic keep this segment above baseline.',
  })

  messagesBySession.value[activeSessionId.value] = current

  const activeSession = sessions.value.find((session) => session.id === activeSessionId.value)
  if (activeSession) activeSession.title = text.length > 38 ? `${text.slice(0, 38)}...` : text

  chatInput.value = ''
}

watch(
  () => route.query.query,
  (queryValue) => {
    const query = typeof queryValue === 'string' ? queryValue.trim() : ''
    if (!query || query === prefetchedQuery.value) return

    prefetchedQuery.value = query
    sendMessage(query)
  },
  { immediate: true },
)
</script>

<template>
  <div class="animate-fade-in mx-auto max-w-layout px-6 pb-8 pt-6">
    <div class="overflow-hidden rounded-[24px] border border-border-0 bg-bg-0 shadow-lg">
      <div class="grid h-[580px] grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside class="hidden overflow-y-auto border-r border-border-0 bg-bg-1 p-4 md:flex md:flex-col">
          <div class="mb-3 flex items-center justify-between">
            <div class="text-[13px] font-semibold">Chats</div>
            <button
              type="button"
              class="flex h-[26px] w-[26px] items-center justify-center rounded-[4px] border border-border-0 bg-bg-card text-[15px] text-text-1 transition-all duration-fast hover:border-accent hover:text-accent-text"
              @click="startNewChat"
              aria-label="Start new chat"
            >
              +
            </button>
          </div>

          <input
            type="text"
            placeholder="Search chats..."
            class="mb-[14px] w-full rounded-[4px] border border-border-0 bg-bg-card px-[10px] py-[7px] text-[12px] text-text-0 outline-none placeholder:text-text-2 focus:border-accent"
          >

          <template v-for="(items, group) in groupedSessions" :key="group">
            <div class="mb-[6px] mt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-text-2">
              {{ group }}
            </div>
            <button
              v-for="session in items"
              :key="session.id"
              type="button"
              class="mb-px w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-[4px] px-[9px] py-[7px] text-left text-[12px] transition-all duration-fast"
              :class="session.id === activeSessionId
                ? 'bg-accent-muted font-medium text-accent-text'
                : 'text-text-1 hover:bg-bg-2 hover:text-text-0'"
              @click="selectSession(session.id)"
            >
              {{ session.title }}
            </button>
          </template>
        </aside>

        <div class="flex flex-col bg-bg-0">
          <div class="flex-1 space-y-5 overflow-y-auto p-6">
            <div
              v-for="message in activeMessages"
              :key="message.id"
              class="flex max-w-[88%] gap-[10px]"
              :class="message.role === 'user' ? 'ml-auto flex-row-reverse' : ''"
            >
              <div
                class="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[7px] text-[10px] font-bold"
                :class="message.role === 'assistant' ? 'bg-accent text-text-on-accent' : 'bg-bg-2 text-text-1'"
              >
                {{ message.role === 'assistant' ? 'RR' : 'D' }}
              </div>

              <div
                class="rounded-[12px] px-[14px] py-[10px] text-[13px] leading-[1.55]"
                :class="message.role === 'assistant'
                  ? 'rounded-bl-[4px] border border-border-0 bg-bg-card text-text-0'
                  : 'rounded-br-[4px] bg-text-0 text-text-inv'"
              >
                <p>{{ message.text }}</p>

                <div
                  v-if="message.score && message.tier && message.road"
                  class="mt-2 rounded-[12px] border border-border-0 bg-bg-0 p-[14px]"
                >
                  <div class="mb-[10px] flex items-center justify-between gap-3">
                    <span class="text-[13px] font-semibold">{{ message.road }}</span>
                    <RiskBadge :tier="message.tier" />
                  </div>

                  <div class="mb-3 flex items-center gap-3">
                    <ScoreRing :score="message.score" :tier="message.tier" size="sm" />
                    <div>
                      <div class="text-[12px] font-semibold">Road Risk Score: {{ message.score }} / 100</div>
                      <div class="font-mono text-[11px] text-text-2">{{ message.formula }}</div>
                    </div>
                  </div>

                  <div v-if="message.factors?.length" class="flex flex-col gap-[7px]">
                    <div
                      v-for="factor in message.factors"
                      :key="factor.label"
                      class="flex items-center gap-[10px] text-[12px]"
                    >
                      <span class="min-w-[132px] text-text-1">{{ factor.label }}</span>
                      <span class="h-[5px] flex-1 overflow-hidden rounded-[3px] bg-bg-2">
                        <span class="block h-full rounded-[3px]" :style="{ width: factor.width, background: factor.color }" />
                      </span>
                      <span class="min-w-[50px] text-right font-mono text-[10px] text-text-2">{{ factor.value }}</span>
                    </div>
                  </div>

                  <div
                    v-if="message.advice"
                    class="mt-[10px] flex gap-[6px] rounded-[8px] bg-accent-muted px-3 py-2 text-[12px] leading-[1.45] text-accent-text"
                  >
                    <span>Tip:</span>
                    <span>{{ message.advice }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex max-w-[88%] gap-[10px]">
              <div class="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-accent text-[10px] font-bold text-text-on-accent">RR</div>
              <div class="inline-flex items-center gap-[6px] rounded-[12px] border border-[rgba(10,123,101,0.18)] bg-[rgba(10,123,101,0.08)] px-[14px] py-[10px]">
                <span class="h-[6px] w-[6px] animate-pulse rounded-full bg-accent opacity-60" />
                <span class="h-[6px] w-[6px] animate-pulse rounded-full bg-accent opacity-60 [animation-delay:150ms]" />
                <span class="h-[6px] w-[6px] animate-pulse rounded-full bg-accent opacity-60 [animation-delay:300ms]" />
              </div>
            </div>
          </div>

          <div class="border-t border-border-1 px-6 pb-[18px] pt-3">
            <div class="flex items-end gap-[6px] rounded-[18px] border border-border-0 bg-bg-input px-4 py-2 transition-all duration-fast focus-within:border-accent">
              <input
                v-model="chatInput"
                type="text"
                placeholder="Ask about any road in Texas..."
                class="flex-1 border-none bg-transparent text-[13px] text-text-0 outline-none placeholder:text-text-2"
                @keydown.enter.prevent="sendMessage()"
              >
              <div class="flex items-center gap-[2px]">
                <button type="button" class="flex h-[30px] w-[30px] items-center justify-center rounded-[4px] text-text-2 transition-all duration-fast hover:bg-bg-1 hover:text-text-1" @click="attachFile" aria-label="Attach file">
                  <svg class="h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" /></svg>
                </button>
                <button type="button" class="flex h-[30px] w-[30px] items-center justify-center rounded-[4px] text-text-2 transition-all duration-fast hover:bg-bg-1 hover:text-text-1" aria-label="Record voice note">
                  <svg class="h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /></svg>
                </button>
              </div>
              <button type="button" class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-accent text-text-on-accent transition-all duration-fast hover:scale-[1.04] hover:bg-accent-hover" @click="sendMessage()" aria-label="Send message">
                <svg class="h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
            <p class="mt-2 min-h-5 px-1 font-mono text-[10px] text-text-2">
              {{ selectedFile ? `Attached: ${selectedFile}` : 'No file attached' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <input ref="fileInput" type="file" class="hidden" @change="onFileSelected">
  </div>
</template>
