<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const localError = ref('')

const redirectTarget = computed(() =>
  typeof route.query.redirect === 'string' ? route.query.redirect : '/'
)

onMounted(() => {
  authStore.error = ''
})

async function handleLogin() {
  localError.value = ''

  if (!email.value.trim() || !password.value) {
    localError.value = 'Please enter your email and password.'
    return
  }

  try {
    await authStore.login({ email: email.value.trim(), password: password.value })
    await router.replace(redirectTarget.value)
  } catch {
    // Error message is set by the auth store.
  }
}

async function handleGoogleLogin() {
  localError.value = ''

  try {
    await authStore.loginWithGoogle()
    await router.replace(redirectTarget.value)
  } catch {
    // Error message is set by the auth store.
  }
}
</script>

<template>
  <div class="min-h-screen grid lg:grid-cols-2 bg-ivory">
    <!-- Brand panel -->
    <aside
      class="relative hidden lg:flex flex-col justify-between overflow-hidden bg-charcoal p-12 text-white"
    >
      <div class="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-gold/15 blur-3xl"></div>
      <div class="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-champagne/10 blur-3xl"></div>

      <div class="relative">
        <p class="text-xs tracking-[0.28em] uppercase text-champagne/70">Holy Matrimony</p>
        <h1 class="mt-3 font-serif text-4xl font-light leading-tight text-champagne">
          Song Arrangement
        </h1>
      </div>

      <div class="relative max-w-md">
        <svg class="w-8 h-8 text-gold/70 mb-6" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M12 21s-7.5-4.6-9.7-9A5.6 5.6 0 0112 4.6 5.6 5.6 0 0121.7 12C19.5 16.4 12 21 12 21z"
          />
        </svg>
        <p class="font-serif text-2xl font-light leading-relaxed text-white/90">
          “Music is the art which is most nigh to tears and memory.”
        </p>
        <p class="mt-4 text-xs tracking-[0.2em] uppercase text-warm-gray">Oscar Wilde</p>
      </div>

      <p class="relative text-xs text-warm-gray tracking-[0.18em] uppercase">
        Wedding Season 2026
      </p>
    </aside>

    <!-- Form panel -->
    <main class="flex items-center justify-center p-6 sm:p-10 lg:p-16">
      <div class="w-full max-w-md">
        <div class="lg:hidden mb-10 text-center">
          <p class="text-xs tracking-[0.28em] uppercase text-gold-dark">Holy Matrimony</p>
          <h1 class="mt-2 font-serif text-3xl text-charcoal">Song Arrangement</h1>
        </div>

        <h2 class="font-serif text-3xl sm:text-4xl text-charcoal">Welcome back</h2>
        <p class="mt-2 text-sm text-warm-gray">
          Sign in to manage your matrimony events and song arrangements.
        </p>

        <form class="mt-8 space-y-5" @submit.prevent="handleLogin">
          <label class="block">
            <span class="text-xs text-warm-gray tracking-wider uppercase">Email</span>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              class="input-luxe mt-2"
              required
            />
          </label>

          <label class="block">
            <span class="text-xs text-warm-gray tracking-wider uppercase">Password</span>
            <div class="relative mt-2">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Enter your password"
                class="input-luxe pr-12"
                required
              />
              <button
                type="button"
                class="absolute inset-y-0 right-3 flex items-center text-warm-gray hover:text-gold transition-colors"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    v-if="showPassword"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 012.563-4.568M6.228 6.228A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-4.293 5.092M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65M9.878 9.878a3 3 0 104.243 4.243"
                  />
                  <path
                    v-else
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </label>

          <div
            v-if="localError || authStore.error"
            role="alert"
            class="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {{ localError || authStore.error }}
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="btn-gold w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ authStore.loading ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>

        <div class="my-6 flex items-center gap-4">
          <span class="h-px flex-1 bg-champagne/60"></span>
          <span class="text-[10px] tracking-[0.2em] uppercase text-warm-gray">or</span>
          <span class="h-px flex-1 bg-champagne/60"></span>
        </div>

        <button
          type="button"
          :disabled="authStore.loading"
          class="flex w-full items-center justify-center gap-3 rounded-sm border border-champagne/70 bg-white px-6 py-3 text-sm font-medium text-charcoal transition-all hover:border-gold/40 hover:bg-champagne/10 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleGoogleLogin"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M21.6 12.227c0-.709-.064-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.351z"
            />
            <path
              fill="#34A853"
              d="M12 22c2.7 0 4.964-.895 6.618-2.422l-3.232-2.51c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.596-4.123H3.062v2.59A10 10 0 0012 22z"
            />
            <path
              fill="#FBBC05"
              d="M6.404 13.9A6.013 6.013 0 016.09 12c0-.659.114-1.3.314-1.9V7.51H3.062A10 10 0 002 12c0 1.614.386 3.14 1.062 4.49l3.342-2.59z"
            />
            <path
              fill="#EA4335"
              d="M12 5.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C16.96 2.99 14.696 2 12 2A10 10 0 003.062 7.51l3.342 2.59C7.19 7.737 9.395 5.977 12 5.977z"
            />
          </svg>
          Continue with Google
        </button>

        <p class="mt-8 text-center text-sm text-warm-gray">
          New here?
          <RouterLink
            to="/register"
            class="font-medium text-gold-dark hover:text-gold transition-colors"
          >
            Create an account
          </RouterLink>
        </p>
      </div>
    </main>
  </div>
</template>
