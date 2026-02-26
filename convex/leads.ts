import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const createLead = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        owner: v.optional(v.string()),
        category: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const leadId = await ctx.db.insert('leads', { title: args.title, description: args.description, owner: args.owner, category: args.category })
        return leadId
    }
})
