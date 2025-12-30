// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config"
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@vueuse/nuxt'
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    SECRET_KEY: process.env.SECRET_KEY,
    // Stripe configuration (server-side only)
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_CLIENT_ID: process.env.STRIPE_CLIENT_ID, // For OAuth with Standard accounts
    public: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY,
      // Stripe public key (client-side)
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
      // Platform configuration
      PLATFORM_FEE_PERCENT: process.env.PLATFORM_FEE_PERCENT || '10', // 10% default platform fee
      APP_URL: process.env.APP_URL || 'http://localhost:3000'
    }
  }
})