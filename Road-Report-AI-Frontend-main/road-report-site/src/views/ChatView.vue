<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

type SessionGroup = 'Today' | 'Yesterday' | 'Last week'

type ChatSession = {
  id: string
  title: string
  group: SessionGroup
}

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
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
      text: 'Current risk is moderate due to rain and heavier traffic volume. Consider delaying by 20-30 minutes or taking Loop 1.',
    },
  ],
  '2': [
    { id: '1', role: 'user', text: 'How risky is US-290 for morning commute?' },
    {
      id: '2',
      role: 'assistant',
      text: 'US-290 is showing low-to-moderate risk right now. Main concern is congestion around major ramps.',
    },
  ],
})

const groupedSessions = computed(() => {
  const groups: Record<SessionGroup, ChatSession[]> = {
    Today: [],
    Yesterday: [],
    'Last week': [],
  }

  for (const session of sessions.value) {
    groups[session.group].push(session)
  }

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
  if (!text) {
    return
  }

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
  })

  messagesBySession.value[activeSessionId.value] = current

  const activeSession = sessions.value.find((session) => session.id === activeSessionId.value)
  if (activeSession) {
    activeSession.title = text.length > 38 ? `${text.slice(0, 38)}...` : text
  }

  chatInput.value = ''
}

watch(
  () => route.query.query,
  (queryValue) => {
    const query = typeof queryValue === 'string' ? queryValue.trim() : ''
    if (!query || query === prefetchedQuery.value) {
      return
    }

    prefetchedQuery.value = query
    sendMessage(query)
  },
  { immediate: true },
)
</script>

<template>
  <div class="animate-fade-in max-w-layout mx-auto px-6 pt-4 pb-6">
    <div class="border border-border-0 rounded-lg overflow-hidden bg-bg-card shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-[240px_1fr] h-[560px]">
        <aside class="hidden md:flex flex-col border-r border-border-0 bg-bg-1 p-4 overflow-y-auto">
          <div class="flex justify-between items-center mb-3">
            <span class="text-[13px] font-semibold">Chats</span>
            <button
              type="button"
              class="w-6 h-6 rounded border border-border-0 bg-bg-card
                     text-text-1 flex items-center justify-center text-sm
                     hover:text-text-0 transition-colors duration-fast"
              @click="startNewChat"
              aria-label="Start new chat"
            >
              +
            </button>
          </div>

          <template v-for="(items, group) in groupedSessions" :key="group">
            <div class="font-mono text-[9px] font-semibold uppercase tracking-wider text-text-3 mt-2 mb-1">
              {{ group }}
            </div>
            <button
              v-for="session in items"
              :key="session.id"
              type="button"
              class="w-full text-left text-[11px] px-2 py-1.5 rounded-md mb-0.5 transition-colors duration-fast"
              :class="session.id === activeSessionId
                ? 'bg-bg-card text-text-0 font-medium border border-border-1'
                : 'text-text-2 hover:bg-bg-card/50'"
              @click="selectSession(session.id)"
            >
              {{ session.title }}
            </button>
          </template>
        </aside>

        <div class="flex flex-col">
          <div class="flex-1 overflow-y-auto p-5 space-y-4">
            <div
              v-for="message in activeMessages"
              :key="message.id"
              class="flex gap-2.5 items-start"
            >
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center
                       text-[9px] font-semibold flex-shrink-0"
                :class="message.role === 'assistant'
                  ? 'bg-accent text-text-on-accent'
                  : 'bg-bg-2 text-text-2'"
              >
                {{ message.role === 'assistant' ? 'RR' : 'U' }}
              </div>
              <div
                class="rounded-md px-3 py-2.5 max-w-[85%] border"
                :class="message.role === 'assistant'
                  ? 'bg-bg-card border-border-0'
                  : 'bg-bg-1 border-border-1'"
              >
                <p class="text-[13px] leading-relaxed">{{ message.text }}</p>
              </div>
            </div>
          </div>

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
                @keydown.enter.prevent="sendMessage()"
              >
              <button
                type="button"
                class="w-8 h-8 rounded-md text-text-2 hover:text-text-1 flex items-center justify-center"
                @click="attachFile"
                aria-label="Attach file"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
              <button
                type="button"
                class="w-8 h-8 rounded-md bg-accent text-text-on-accent
                       flex items-center justify-center
                       hover:bg-accent-hover transition-colors duration-fast"
                @click="sendMessage()"
                aria-label="Send message"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <p class="min-h-5 mt-1 text-[10px] text-text-2">
              {{ selectedFile ? `Attached: ${selectedFile}` : 'No file attached' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      class="hidden"
      @change="onFileSelected"
    >
  </div>
</template>