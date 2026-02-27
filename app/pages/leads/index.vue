<script setup lang="ts">
import { useConvexQuery } from "convex-vue"
import { api } from "@@/convex/_generated/api"
import type { Doc } from "@@/convex/_generated/dataModel"
import { LazyLeadDetailsSlideover } from "#components"

interface Section {
  id: string
  title: string
  leads: Doc<"leads">[]
}

const { data: leads, isPending } = useConvexQuery(api.leads.list, {})
const { open: openNewLeadModal } = useNewLeadModal()

const overlay = useOverlay()
const leadSlideover = overlay.create(LazyLeadDetailsSlideover)

const openLead = (lead: Doc<"leads">) => {
  leadSlideover.open({ lead })
}

const groupedSections = computed<Section[]>(() => {
  const leadsData = leads.value
  if (!leadsData) return []

  const sections: Section[] = []

  // 1. New leads (no issue)
  const newLeads = leadsData.filter((l: Doc<"leads">) => !l.issue)
  if (newLeads.length > 0) {
    sections.push({
      id: "new",
      title: "New",
      leads: newLeads
    })
  }

  // 2. Assigned leads grouped by issue
  const assignedLeads = leadsData.filter((l: Doc<"leads">) => !!l.issue)

  // Sort assigned leads by year then number
  const sortedAssigned = [...assignedLeads].sort((a: Doc<"leads">, b: Doc<"leads">) => {
    if (a.issue!.year !== b.issue!.year) return a.issue!.year - b.issue!.year
    return a.issue!.number - b.issue!.number
  })

  // Create unique issue groups
  const issueMap = new Map<string, Section>()

  sortedAssigned.forEach((l: Doc<"leads">) => {
    const key = `${l.issue!.year}-${l.issue!.number}`
    if (!issueMap.has(key)) {
      const section: Section = {
        id: key,
        title: `${l.issue!.number}/${l.issue!.year}`,
        leads: []
      }
      issueMap.set(key, section)
      sections.push(section)
    }
    issueMap.get(key)!.leads.push(l)
  })

  return sections
})
</script>

<template>
  <UContainer class="py-8">
    <div class="flex justify-between items-end mb-8 pl-1">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Leads
        </h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">
          Browse and manage your leads by issue.
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        label="New Lead"
        color="primary"
        @click="openNewLeadModal"
      />
    </div>

    <div
      v-if="isPending"
      class="flex justify-center py-20"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="w-10 h-10 animate-spin text-primary-500"
      />
    </div>

    <div
      v-else-if="groupedSections.length === 0"
      class="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl"
    >
      <div class="bg-slate-50 dark:bg-slate-900/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
        <UIcon
          name="i-lucide-inbox"
          class="w-10 h-10 text-slate-300"
        />
      </div>
      <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        No leads found
      </h2>
      <p class="text-slate-500 mb-6">
        Start by creating your first lead for a specific issue or a general one.
      </p>
      <UButton
        icon="i-lucide-plus"
        size="lg"
        @click="openNewLeadModal"
      >
        Create Lead
      </UButton>
    </div>

    <div
      v-else
      class="flex flex-col gap-12"
    >
      <section
        v-for="section in groupedSections"
        :key="section.id"
        class="animate-in fade-in slide-in-from-bottom-2 duration-500"
      >
        <div class="flex items-center gap-4 mb-6 sticky top-0 z-10 py-1 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              :class="section.id === 'new' ? 'bg-primary-500' : 'bg-slate-700 dark:bg-slate-600'"
            >
              {{ section.id === 'new' ? 'N' : '#' }}
            </div>
            <h2 class="text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              {{ section.title }}
            </h2>
          </div>
          <div class="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span class="text-sm font-semibold text-slate-400 dark:text-slate-500 tabular-nums">
            {{ section.leads.length }} {{ section.leads.length === 1 ? 'lead' : 'leads' }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <LeadCard
            v-for="lead in section.leads"
            :key="lead._id"
            :lead="lead"
            @click="openLead(lead)"
          />
        </div>
      </section>
    </div>
  </UContainer>
</template>
