import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  handler: async (ctx) => {
    const leads = await ctx.db.query('leads').collect()
    return await Promise.all(
      leads.map(async (lead) => {
        const attachments = await Promise.all(
          (lead.attachments ?? []).map(async (attachment) => ({
            ...attachment,
            url: await ctx.storage.getUrl(attachment.storageId),
          }))
        )
        return { ...lead, attachments }
      })
    )
  }
})

export const get = query({
  args: { id: v.id('leads') },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.id)
    if (!lead) return null
    const attachments = await Promise.all(
      (lead.attachments ?? []).map(async (attachment) => ({
        ...attachment,
        url: await ctx.storage.getUrl(attachment.storageId),
      }))
    )
    return { ...lead, attachments }
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
      size: v.number(),
    })))
  },
  handler: async (ctx, args) => {
    const leadId = await ctx.db.insert('leads', {
      title: args.title,
      description: args.description,
      owner: args.owner,
      category: args.category,
      attachments: args.attachments ?? []
    })
    return leadId
  }
})


export const addAttachment = mutation({
  args: {
    leadId: v.id('leads'),
    storageId: v.id('_storage'),
    name: v.string(),
    contentType: v.string(),
    size: v.number()
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId)
    if (!lead) throw new Error('Lead not found')

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
    leadId: v.id('leads'),
    storageId: v.id('_storage')
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId)
    if (!lead) throw new Error('Lead not found')

    const attachments = (lead.attachments ?? []).filter(
      (a) => a.storageId !== args.storageId
    )

    await ctx.db.patch(args.leadId, { attachments })
    await ctx.storage.delete(args.storageId)
  }
})

