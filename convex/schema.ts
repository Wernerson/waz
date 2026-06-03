import { defineSchema, defineTable } from "convex/server"
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values"

const vDate = v.object({
    year: v.number(),
    month: v.number(),
    day: v.number()
})

export default defineSchema({
    ...authTables,
    users: defineTable({
        name: v.optional(v.string()),
        image: v.optional(v.string()),
        email: v.optional(v.string()),
        emailVerificationTime: v.optional(v.number()),
        phone: v.optional(v.string()),
        phoneVerificationTime: v.optional(v.number()),
        isAnonymous: v.optional(v.boolean()),
        // other "users" fields...
        tag: v.string()
    }).index("email", ["email"]),
    files: defineTable({
        storageId: v.id("_storage"),
        name: v.string(),
        contentType: v.string(),
        size: v.number()
    }),
    leads: defineTable({
        subject: v.string(),
        body: v.optional(v.string()),
        plannedIssue: v.optional(v.object({
            year: v.number(),
            number: v.number()
        })),
        tag: v.optional(v.string()),
        eventDate: v.optional(vDate),
        source: v.union(
            v.object({
                kind: v.literal("Email"),
                email: v.string()
            }), v.object({
                kind: v.literal("User"),
                userId: v.id("users")
            })
        )
    }),
    leadComments: defineTable({
        leadId: v.id("leads"),
        author: v.id("users"),
        text: v.string()
    }),
    issues: defineTable({
        releaseDate: vDate
    }),
})