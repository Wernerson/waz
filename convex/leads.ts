import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const leads = await ctx.db.query("leads").collect();

    const withResolvedSource = await Promise.all(
      leads.map(async (lead) => {
        if (lead.source?.kind !== "User") return lead;
        const user = await ctx.db.get(lead.source.userId);
        return {
          ...lead,
          source: {
            kind: "User" as const,
            userId: lead.source.userId,
            label: user?.name ?? user?.tag ?? user?.email ?? "User",
          },
        };
      }),
    );

    return withResolvedSource.sort((a, b) => {
      const aIssue = a.plannedIssue;
      const bIssue = b.plannedIssue;
      if (!aIssue && !bIssue) return 0;
      if (!aIssue) return -1;
      if (!bIssue) return 1;
      if (aIssue.year !== bIssue.year) return aIssue.year - bIssue.year;
      return aIssue.number - bIssue.number;
    });
  },
});

export const assignIssue = mutation({
  args: {
    leadId: v.id("leads"),
    plannedIssue: v.object({
      year: v.number(),
      number: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(args.leadId, { plannedIssue: args.plannedIssue });
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const deleteAttachment = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.storage.delete(args.storageId);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    tag: v.optional(v.string()),
    source: v.optional(v.string()),
    plannedIssue: v.optional(
      v.object({
        year: v.number(),
        number: v.number(),
      }),
    ),
    attachments: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          name: v.string(),
          contentType: v.string(),
          size: v.number(),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let source;
    if (!args.source || !args.source.trim()) {
      source = undefined;
    } else if (args.source.includes("@")) {
      source = {kind: "Email", email: args.source}
    } else {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("tag"), args.source))
        .unique();
      source = user
        ? {kind: "User", userId: user._id}
        : {kind: "Other", name: args.source}
    }

    const leadId = await ctx.db.insert("leads", {
      title: args.title,
      description: args.description,
      tag: args.tag,
      plannedIssue: args.plannedIssue,
      source: source,
    });

    for (const attachment of args.attachments ?? []) {
      await ctx.db.insert("files", { ...attachment, leadId });
    }

    return leadId;
  },
});
