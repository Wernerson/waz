import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const list = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("leads").collect()
    return all.filter(l => !l.state || l.state === "New" || l.state === "Accepted")
  }
})

export const get = query({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.id)
    if (!lead) return null
    const attachments = await Promise.all(
      (lead.attachments ?? []).map(async attachment => ({
        ...attachment,
        url: await ctx.storage.getUrl(attachment.storageId)
      }))
    )
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_leadId", q => q.eq("leadId", args.id))
      .collect()
    return { ...lead, attachments, comments }
  }
})

export const createLead = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    owner: v.optional(v.string()),
    category: v.optional(v.string()),
    attachments: v.optional(v.array(v.object({
      storageId: v.id("_storage"),
      name: v.string(),
      contentType: v.string(),
      size: v.number()
    }))),
    issue: v.optional(v.object({
      year: v.number(),
      number: v.number()
    }))
  },
  handler: async (ctx, args) => {
    const leadId = await ctx.db.insert("leads", {
      title: args.title,
      description: args.description,
      owner: args.owner,
      category: args.category,
      state: "New",
      attachments: args.attachments ?? [],
      issue: args.issue
    })
    return leadId
  }
})

export const addAttachment = mutation({
  args: {
    leadId: v.id("leads"),
    storageId: v.id("_storage"),
    name: v.string(),
    contentType: v.string(),
    size: v.number()
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId)
    if (!lead) throw new Error("Lead not found")

    const attachments = lead.attachments ?? []
    attachments.push({
      storageId: args.storageId,
      name: args.name,
      contentType: args.contentType,
      size: args.size
    })

    await ctx.db.patch(args.leadId, { attachments })
  }
})

export const removeAttachment = mutation({
  args: {
    leadId: v.id("leads"),
    storageId: v.id("_storage")
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId)
    if (!lead) throw new Error("Lead not found")

    const attachments = (lead.attachments ?? []).filter(
      a => a.storageId !== args.storageId
    )

    await ctx.db.patch(args.leadId, { attachments })
    await ctx.storage.delete(args.storageId)
  }
})

export const addComment = mutation({
  args: {
    leadId: v.id("leads"),
    author: v.string(),
    text: v.string()
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("comments", {
      leadId: args.leadId,
      author: args.author,
      text: args.text
    })
    return commentId
  }
})

export const updateTitle = mutation({
  args: { id: v.id("leads"), title: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { title: args.title })
  }
})

export const updateDescription = mutation({
  args: { id: v.id("leads"), description: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { description: args.description || undefined })
  }
})

export const updateOwner = mutation({
  args: { id: v.id("leads"), owner: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { owner: args.owner || undefined })
  }
})

export const updateCategory = mutation({
  args: { id: v.id("leads"), category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { category: args.category || undefined })
  }
})

export const updateIssue = mutation({
  args: {
    id: v.id("leads"),
    issue: v.optional(v.object({
      year: v.number(),
      number: v.number()
    }))
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { issue: args.issue })
  }
})

export const updateState = mutation({
  args: {
    id: v.id("leads"),
    state: v.union(v.literal("New"), v.literal("Accepted"), v.literal("Deleted"))
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { state: args.state })
  }
})
