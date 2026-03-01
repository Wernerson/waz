<script setup lang="ts">
import { api } from "@@/convex/_generated/api"
import type { Doc } from "@@/convex/_generated/dataModel"

const props = defineProps<{
  lead: Doc<"leads">
  existingIssues?: { year: number, number: number }[]
}>()

const { mutate: updateIssue } = useConvexMutation(api.leads.updateIssue)
const { mutate: updateState } = useConvexMutation(api.leads.updateState)

const isNew = computed(() => !props.lead.state || props.lead.state === "New")

const items = computed(() => {
  const issueItems = (props.existingIssues || []).map(issue => ({
    label: `${issue.number}/${issue.year}`,
    onSelect: () => {
      updateIssue({ id: props.lead._id, issue })
    }
  }))

  return [
    [{ label: "Issue...", disabled: true, class: "font-bold text-slate-900 border-b border-slate-100 dark:border-slate-800" }],
    issueItems.length > 0 ? issueItems : [{ label: "No existing issues", disabled: true }],
    [{
      label: "Clear Issue",
      icon: "i-lucide-x",
      onSelect: () => {
        updateIssue({ id: props.lead._id, issue: undefined })
      }
    }]
  ]
})

const accept = (e: Event) => {
  e.stopPropagation()
  updateState({ id: props.lead._id, state: "Accepted" })
}

const reject = (e: Event) => {
  e.stopPropagation()
  updateState({ id: props.lead._id, state: "Deleted" })
}
</script>

<template>
  <UContextMenu
    :items="items"
    :ui="{ content: 'w-48' }"
  >
    <div
      class="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 hover:border-primary-500/50 group cursor-pointer"
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

        <div
          v-if="isNew"
          class="flex gap-2 mt-1"
          @click.stop
        >
          <UButton
            size="xs"
            color="success"
            variant="soft"
            icon="i-lucide-check"
            label="Accept"
            class="flex-1 justify-center"
            @click="accept"
          />
          <UButton
            size="xs"
            color="error"
            variant="soft"
            icon="i-lucide-x"
            label="Reject"
            class="flex-1 justify-center"
            @click="reject"
          />
        </div>
      </div>
    </div>
  </UContextMenu>
</template>
