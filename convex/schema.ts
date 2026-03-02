import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  leads: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    owner: v.optional(v.string()),
    category: v.optional(v.string()),
    state: v.union(v.literal("New"), v.literal("Accepted"), v.literal("Deleted")),
    issue: v.optional(v.object({
      year: v.number(),
      number: v.number()
    })),
    attachments: v.optional(v.array(v.object({
      storageId: v.id("_storage"),
      name: v.string(),
      contentType: v.string(),
      size: v.number()
    })))
  }),
  comments: defineTable({
    leadId: v.id("leads"),
    author: v.string(),
    text: v.string()
  }).index("by_leadId", ["leadId"])
})
