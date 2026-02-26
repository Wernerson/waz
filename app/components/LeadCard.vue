<script setup lang="ts">
import type { Doc } from '@@/convex/_generated/dataModel'

defineProps<{
  lead: Doc<'leads'>
}>()
</script>

<template>
  <div
    class="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 hover:border-primary-500/50 group"
  >
    <div class="flex flex-col gap-2">
      <div class="flex justify-between items-start gap-4">
        <h3 class="font-bold text-slate-900 dark:text-white leading-tight">
          {{ lead.title }}
        </h3>
        <UBadge
          v-if="lead.category"
          color="neutral"
          variant="subtle"
          size="sm"
          class="shrink-0"
        >
          {{ lead.category }}
        </UBadge>
      </div>

      <p
        v-if="lead.description"
        class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2"
      >
        {{ lead.description }}
      </p>

      <div class="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-user"
            class="w-4 h-4 text-slate-400"
          />
          <span class="text-xs text-slate-500 dark:text-slate-400">
            {{ lead.owner || 'Unassigned' }}
          </span>
        </div>

        <span class="text-[10px] font-mono text-slate-300 dark:text-slate-600 uppercase tracking-tighter">
          {{ lead._id.slice(-6) }}
        </span>
      </div>
    </div>
  </div>
</template>
