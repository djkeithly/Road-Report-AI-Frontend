<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const mode = ref<'signin' | 'register'>('signin')

watch(
  () => route.query.mode,
  (value) => {
    mode.value = value === 'register' ? 'register' : 'signin'
  },
  { immediate: true },
)

const title = computed(() => (mode.value === 'register' ? 'Create your account' : 'Sign in'))

function switchMode(nextMode: 'signin' | 'register') {
  mode.value = nextMode
  router.replace({
    path: '/account',
    query: nextMode === 'register' ? { mode: 'register' } : undefined,
  })
}
</script>

<template>
  <div class="max-w-layout mx-auto px-6 py-10 animate-fade-in">
    <section class="max-w-[460px] mx-auto border border-border-0 rounded-lg bg-bg-card p-6 shadow-sm">
      <h1 class="font-serif text-3xl tracking-tight mb-2">{{ title }}</h1>
      <p class="text-sm text-text-2 mb-5">
        Authentication backend is not connected yet. This form is ready for API wiring.
      </p>

      <div class="grid grid-cols-2 gap-2 mb-5 bg-bg-1 p-1 rounded-md">
        <button
          type="button"
          class="py-2 rounded-md text-sm"
          :class="mode === 'signin' ? 'bg-bg-card border border-border-0 text-text-0' : 'text-text-2'"
          @click="switchMode('signin')"
        >
          Sign in
        </button>
        <button
          type="button"
          class="py-2 rounded-md text-sm"
          :class="mode === 'register' ? 'bg-bg-card border border-border-0 text-text-0' : 'text-text-2'"
          @click="switchMode('register')"
        >
          Register
        </button>
      </div>

      <form class="space-y-3" @submit.prevent>
        <input
          type="email"
          placeholder="Email"
          class="w-full px-3 py-2 rounded-md border border-border-1 bg-bg-0 text-sm"
        >
        <input
          v-if="mode === 'register'"
          type="text"
          placeholder="Full name"
          class="w-full px-3 py-2 rounded-md border border-border-1 bg-bg-0 text-sm"
        >
        <input
          type="password"
          placeholder="Password"
          class="w-full px-3 py-2 rounded-md border border-border-1 bg-bg-0 text-sm"
        >
        <button
          type="submit"
          class="w-full py-2.5 rounded-md bg-accent text-text-on-accent text-sm font-medium hover:bg-accent-hover"
        >
          {{ mode === 'register' ? 'Create account' : 'Continue' }}
        </button>
      </form>
    </section>
  </div>
</template>