import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
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
