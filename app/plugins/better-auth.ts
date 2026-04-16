import { convexClient } from "@convex-dev/better-auth/client/plugins"
import { createAuthClient } from "better-auth/vue"

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const baseURL = config.public.convexUrl ? `${config.public.convexUrl}/api/auth` : "/api/auth"

  const authClient = createAuthClient({
    baseURL,
    plugins: [convexClient()]
  })

  return {
    provide: {
      authClient
    }
  }
})
