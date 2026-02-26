import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    leads: defineTable({
        title: v.string(),
        description: v.optional(v.string()),
        owner: v.optional(v.string()),
        category: v.optional(v.string()),
        issue: v.optional(v.object({
            year: v.number(),
            number: v.number(),
        })),
    }),
});