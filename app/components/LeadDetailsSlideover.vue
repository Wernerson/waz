<script setup lang="ts">
import { api } from '@@/convex/_generated/api'
import type { Id } from '@@/convex/_generated/dataModel'

const props = defineProps<{
  lead: any
}>()

defineEmits<{
  close: []
}>()

// Use query to get the live lead data including comments
const { data: fullLead } = useConvexQuery(api.leads.get, { id: props.lead._id as Id<'leads'> })

const commentText = ref('')
const isSubmitting = ref(false)
const { mutate: addComment } = useConvexMutation(api.leads.addComment)

const handleAddComment = async () => {
  if (!commentText.value.trim() || isSubmitting.value) return

  isSubmitting.value = true
  try {
    await addComment({
      leadId: props.lead._id as Id<'leads'>,
      author: 'You', // Hardcoded for now as there's no auth
      text: commentText.value.trim()
    })
    commentText.value = ''
  } catch (err) {
    console.error('Failed to add comment:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <USlideover
    title="Lead Details"
    :close="{ onClick: () => $emit('close') }"
  >
    <template #body>
      <div
        v-if="fullLead"
        class="space-y-8"
      >
        <div>
          <div class="flex items-center gap-2 mb-3">
            <UBadge
              v-if="fullLead.category"
              color="primary"
              variant="subtle"
              size="md"
            >
              {{ fullLead.category }}
            </UBadge>
            <UBadge
              v-if="fullLead.issue"
              color="neutral"
              variant="outline"
              size="md"
            >
              #{{ fullLead.issue.number }}/{{ fullLead.issue.year }}
            </UBadge>
          </div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
            {{ fullLead.title }}
          </h2>
        </div>

        <div v-if="fullLead.description">
          <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            Description
          </h3>
          <p class="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {{ fullLead.description }}
          </p>
        </div>

        <div
          v-if="fullLead.attachments && fullLead.attachments.length > 0"
          class="pt-6 border-t border-slate-100 dark:border-slate-800"
        >
          <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            Attachments ({{ fullLead.attachments.length }})
          </h3>
          <div class="space-y-2">
            <a
              v-for="file in fullLead.attachments"
              :key="file.storageId"
              :href="file.url || '#'"
              target="_blank"
              class="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
            >
              <div class="flex items-center gap-3 overflow-hidden">
                <UIcon
                  :name="file.contentType.startsWith('image/') ? 'i-lucide-image' : 'i-lucide-file-text'"
                  class="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors flex-shrink-0"
                />
                <div class="flex flex-col overflow-hidden">
                  <span class="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {{ file.name }}
                  </span>
                  <span class="text-xs text-slate-500">
                    {{ (file.size / 1024).toFixed(1) }} KB
                  </span>
                </div>
              </div>
              <UIcon
                name="i-lucide-external-link"
                class="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </a>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-100 dark:border-slate-800">
          <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
            Comments
          </h3>

          <div class="space-y-4 mb-6">
            <div
              v-for="comment in (fullLead as any).comments"
              :key="comment._id"
              class="flex gap-3"
            >
              <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span class="text-[10px] font-bold text-primary">{{ (comment.author?.[0] || 'U').toUpperCase() }}</span>
              </div>
              <div class="flex-1 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ comment.author }}</span>
                  <span class="text-[10px] text-slate-400">{{ new Date(comment._creationTime).toLocaleString() }}</span>
                </div>
                <p class="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  {{ comment.text }}
                </p>
              </div>
            </div>

            <div
              v-if="!(fullLead as any).comments || (fullLead as any).comments.length === 0"
              class="text-center py-6"
            >
              <p class="text-sm text-slate-400 italic">
                No comments yet. Be the first to add one!
              </p>
            </div>
          </div>

          <div class="space-y-3">
            <UTextarea
              v-model="commentText"
              placeholder="Write a comment..."
              autoresize
              :rows="2"
              class="w-full"
              @keydown.enter.ctrl.prevent="handleAddComment"
            />
            <div class="flex justify-end">
              <UButton
                label="Post Comment"
                size="sm"
                :loading="isSubmitting"
                :disabled="!commentText.trim()"
                @click="handleAddComment"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div>
            <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
              Owner
            </h3>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <UIcon
                  name="i-lucide-user"
                  class="w-4 h-4 text-slate-500"
                />
              </div>
              <span class="font-medium text-slate-900 dark:text-white">
                {{ fullLead.owner || 'Unassigned' }}
              </span>
            </div>
          </div>
          <div>
            <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
              Lead ID
            </h3>
            <div class="flex items-center gap-2 text-slate-500">
              <UIcon
                name="i-lucide-hash"
                class="w-4 h-4"
              />
              <span class="text-xs font-mono">{{ fullLead._id }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="flex items-center justify-center h-full"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin text-primary"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <UButton
          label="Close"
          color="neutral"
          variant="ghost"
          @click="$emit('close')"
        />
      </div>
    </template>
  </USlideover>
</template>
