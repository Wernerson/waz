import { betterAuth } from "better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { createClient, convexAdapter, type GenericCtx } from "@convex-dev/better-auth"
import { components } from "./_generated/api"
import type { DataModel } from "./_generated/dataModel"
import authConfig from "./auth.config"

export const authComponent = createClient<DataModel>(components.betterAuth)

const trustedOrigins = [
  process.env.SITE_URL,
  process.env.NUXT_PUBLIC_APP_URL,
  "http://localhost:3000"
].filter((origin): origin is string => Boolean(origin))

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const baseURL = process.env.CONVEX_SITE_URL ? `${process.env.CONVEX_SITE_URL}/api/auth` : undefined

  return betterAuth({
    database: convexAdapter(ctx, authComponent),
    secret: process.env.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true
    },
    trustedOrigins,
    ...(baseURL ? { baseURL } : {}),
    plugins: [convex({ authConfig, jwks: process.env.JWKS })]
  })
}

export const { getAuthUser } = authComponent.clientApi()
