<script setup lang="ts">
import { api } from "@@/convex/_generated/api"
import type { Doc } from "@@/convex/_generated/dataModel"

const props = defineProps<{
  lead: Doc<"leads">
  existingIssues?: { year: number, number: number }[]
}>()

const emit = defineEmits(["updateIssue"])

const { mutate: updateIssue } = useConvexMutation(api.leads.updateIssue)

const onDragStart = (e: DragEvent) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData("application/json", JSON.stringify({ leadId: props.lead._id }))
    e.dataTransfer.effectAllowed = "move"
  }
}

const items = computed(() => {
  const issueItems = (props.existingIssues || []).map(issue => ({
    label: `${issue.number}/${issue.year}`,
    onSelect: () => {
      updateIssue({ id: props.lead._id, issue })
    }
  }))

  return [
    [{ label: 'Issue...', disabled: true, class: 'font-bold text-slate-900 border-b border-slate-100 dark:border-slate-800' }],
    issueItems.length > 0 ? issueItems : [{ label: 'No existing issues', disabled: true }],
    [{
      label: 'Clear Issue',
      icon: 'i-lucide-x',
      onSelect: () => {
        updateIssue({ id: props.lead._id, issue: undefined })
      }
    }]
  ]
})
</script>

<template>
  <UDropdown
    :items="items"
    :popper="{ placement: 'bottom-start' }"
    :ui="{ width: 'w-48' }"
    trigger="contextmenu"
  >
    <div
      draggable="true"
      class="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 hover:border-primary-500/50 group cursor-pointer"
      @dragstart="onDragStart"
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
  </UDropdown>
</template>
