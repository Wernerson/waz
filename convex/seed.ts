import { internalAction, internalMutation, internalQuery } from "./_generated/server"
import { internal } from "./_generated/api"
import { v } from "convex/values"
import type { Id } from "./_generated/dataModel"

// Minimal valid single-page PDF
const MINIMAL_PDF = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer<</Size 4/Root 1 0 R>>
startxref
190
%%EOF`

// Minimal valid 1×1 transparent PNG (base64-encoded)
const MINIMAL_PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

export const isSeeded = internalQuery({
  handler: async (ctx) => {
    const lead = await ctx.db.query("leads").first()
    return lead !== null
  },
})

export const insertLeads = internalMutation({
  args: {
    pdfStorageId: v.id("_storage"),
    pdfSize: v.number(),
    pngStorageId: v.id("_storage"),
    pngSize: v.number(),
  },
  handler: async (ctx, { pdfStorageId, pdfSize, pngStorageId, pngSize }) => {
    // Lead 1: A new lead (New, with PDF attachment)
    await ctx.db.insert("leads", {
      title: "A new lead",
      description: "This is a new lead...",
      state: "New",
      attachments: [{ storageId: pdfStorageId, name: "attachment.pdf", contentType: "application/pdf", size: pdfSize }],
    })

    // Lead 2: Another new lead (New, owner: mst, category: Grüezi, issue: 3/26, two comments)
    const lead2Id = await ctx.db.insert("leads", {
      title: "Another new lead",
      description: "This is another new lead...",
      owner: "mst",
      category: "Grüezi",
      state: "New",
      issue: { number: 3, year: 26 },
    })
    await ctx.db.insert("comments", { leadId: lead2Id, author: "mst", text: "This is a comment about the new lead." })
    await ctx.db.insert("comments", { leadId: lead2Id, author: "mst", text: "This is another comment about the new lead." })

    // Lead 3: An assigned lead (Accepted, owner: jsb, issue: 4/26, PNG attachment, two comments)
    const lead3Id = await ctx.db.insert("leads", {
      title: "An assigned lead",
      description: "This is an assigned lead...",
      owner: "jsb",
      state: "Accepted",
      issue: { number: 4, year: 26 },
      attachments: [{ storageId: pngStorageId, name: "attachment.png", contentType: "image/png", size: pngSize }],
    })
    await ctx.db.insert("comments", { leadId: lead3Id, author: "jsb", text: "This is a comment." })
    await ctx.db.insert("comments", { leadId: lead3Id, author: "jsb", text: "This is another comment." })

    // Lead 4: An idea pool lead (Accepted, category: Rückblick)
    await ctx.db.insert("leads", {
      title: "An idea pool lead",
      description: "This lead is in the idea pool...",
      category: "Rückblick",
      state: "Accepted",
    })

    // Lead 5: Already has issue (Accepted, issue: 3/26)
    await ctx.db.insert("leads", {
      title: "Already has issue",
      description: "This lead already has an issue...",
      state: "Accepted",
      issue: { number: 3, year: 26 },
    })
  },
})

export const seed = internalAction({
  handler: async (ctx) => {
    const alreadySeeded = await ctx.runQuery(internal.seed.isSeeded)
    if (alreadySeeded) return

    // Upload a minimal placeholder PDF
    const pdfUploadUrl = await ctx.storage.generateUploadUrl()
    const pdfBytes = new TextEncoder().encode(MINIMAL_PDF)
    const pdfResponse = await fetch(pdfUploadUrl, {
      method: "POST",
      headers: { "Content-Type": "application/pdf" },
      body: pdfBytes,
    })
    const { storageId: pdfStorageId } = await pdfResponse.json() as { storageId: Id<"_storage"> }

    // Upload a minimal placeholder PNG
    const pngUploadUrl = await ctx.storage.generateUploadUrl()
    const pngBytes = Uint8Array.from(atob(MINIMAL_PNG_BASE64), c => c.charCodeAt(0))
    const pngResponse = await fetch(pngUploadUrl, {
      method: "POST",
      headers: { "Content-Type": "image/png" },
      body: pngBytes,
    })
    const { storageId: pngStorageId } = await pngResponse.json() as { storageId: Id<"_storage"> }

    await ctx.runMutation(internal.seed.insertLeads, {
      pdfStorageId,
      pdfSize: pdfBytes.length,
      pngStorageId,
      pngSize: pngBytes.length,
    })
  },
})
