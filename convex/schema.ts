import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
    test: defineTable({
        title: v.string()
    })
})