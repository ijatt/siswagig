import { createClient } from '@supabase/supabase-js'

/**
 * This function returns a Supabase client based on the runtime configuration.
 * It uses the `useRuntimeConfig` hook to retrieve the Supabase URL and key from the configuration.
 * 
 * @returns {SupabaseClient} The Supabase client instance.
 */
export default () => {
  const config = useRuntimeConfig()
  return createClient(config.public.SUPABASE_URL, config.public.SUPABASE_KEY)
}