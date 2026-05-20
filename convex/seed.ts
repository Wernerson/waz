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
        return false // todo change
    }
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
            body: pdfBytes
        })
        const { storageId: pdfStorageId } = await pdfResponse.json() as { storageId: Id<"_storage"> }

        // Upload a minimal placeholder PNG
        const pngUploadUrl = await ctx.storage.generateUploadUrl()
        const pngBytes = Uint8Array.from(atob(MINIMAL_PNG_BASE64), c => c.charCodeAt(0))
        const pngResponse = await fetch(pngUploadUrl, {
            method: "POST",
            headers: { "Content-Type": "image/png" },
            body: pngBytes
        })
        const { storageId: pngStorageId } = await pngResponse.json() as { storageId: Id<"_storage"> }

        // await ctx.runMutation(internal.seed.insertLeads, {
        //     pdfStorageId,
        //     pdfSize: pdfBytes.length,
        //     pngStorageId,
        //     pngSize: pngBytes.length
        // })
    }
})