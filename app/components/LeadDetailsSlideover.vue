<script setup lang="ts">
import type { Doc } from '@@/convex/_generated/dataModel'

defineProps<{
  lead: Doc<'leads'>
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <USlideover
    title="Lead Details"
    :close="{ onClick: () => $emit('close') }"
  >
    <template #body>
      <div class="space-y-8">
        <div>
          <div class="flex items-center gap-2 mb-3">
            <UBadge
              v-if="lead.category"
              color="primary"
              variant="subtle"
              size="md"
            >
              {{ lead.category }}
            </UBadge>
            <UBadge
              v-if="lead.issue"
              color="neutral"
              variant="outline"
              size="md"
            >
              #{{ lead.issue.number }}/{{ lead.issue.year }}
            </UBadge>
          </div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
            {{ lead.title }}
          </h2>
        </div>

        <div v-if="lead.description">
          <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            Description
          </h3>
          <p class="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {{ lead.description }}
          </p>
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
                {{ lead.owner || 'Unassigned' }}
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
              <span class="text-xs font-mono">{{ lead._id }}</span>
            </div>
          </div>
        </div>
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
