import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    tasks: defineTable({
        text: v.string(),
        isCompleted: v.boolean(),
    }),
    leads: defineTable({
        title: v.string(),
        description: v.string(),
        owner: v.string(),
        category: v.string(),
        issue: v.object({
            year: v.number(),
            number: v.number(),
        }),
    }),
});