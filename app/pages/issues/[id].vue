<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRoute, useRouter } from "#imports"
import { useConvexQuery } from "convex-vue"
import { api } from "@@/convex/_generated/api"
import type { Doc } from "@@/convex/_generated/dataModel"
import draggable from "vuedraggable"
import { useMagazineIssues, generateRowId } from "~/composables/useMagazineIssues"

const { getIssue } = useMagazineIssues()
const route = useRoute()
const router = useRouter()

const issueId = route.params.id as string
const issue = getIssue(issueId)

if (!issue) {
  router.push("/issues")
}

// Input for total pages
const totalPages = ref(issue?.pages.length || 16)

const onTotalPagesChange = () => {
  if (!issue) return
  const oldVal = issue.pages.length
  const newVal = totalPages.value

  if (newVal < 1) {
    totalPages.value = oldVal
    return
  }

  if (newVal < oldVal) {
    const deletedPages = issue.pages.slice(newVal)
    const hasAssignments = deletedPages.some(p => p.rows.some(r => r.items.length > 0))
    if (hasAssignments) {
      if (!confirm("There are assigned leads or ads in the pages being deleted. Are you sure you want to proceed?")) {
        totalPages.value = oldVal
        return
      }
    }
    issue.pages.length = newVal // truncate
  } else if (newVal > oldVal) {
    for (let i = oldVal; i < newVal; i++) {
      issue.pages.push({ pageNumber: i + 1, rows: [{ id: generateRowId(), items: [] }] })
    }
  }
}

// Data from Convex
const { data: leadsData, isPending } = useConvexQuery(api.leads.list, {})

const currentlyAssignedLeadIds = computed(() => {
  const ids = new Set<string>()
  if (!issue) return ids
  issue.pages.forEach((p) => {
    p.rows.forEach((r) => {
      r.items.forEach((item) => {
        if (!item.isAd && item._id) {
          ids.add(item._id)
        }
      })
    })
  })
  return ids
})

const availableLeads = computed(() => {
  if (!leadsData.value) return []
  return leadsData.value.filter(l => !currentlyAssignedLeadIds.value.has(l._id))
})

const newLeads = computed(() => availableLeads.value.filter(l => l.state === "New"))
const acceptedLeads = computed(() => availableLeads.value.filter(l => l.state === "Accepted"))

interface Section {
  id: string
  title: string
  leads: Doc<"leads">[]
  issue?: { year: number, number: number }
}

const groupedSections = computed<Section[]>(() => {
  const sections: Section[] = []

  const assignedAccepted = acceptedLeads.value.filter(l => !!l.issue)
  const issueMap = new Map<string, Section>()

  assignedAccepted.forEach((l: Doc<"leads">) => {
    const key = `${l.issue!.year}-${l.issue!.number}`
    if (!issueMap.has(key)) {
      const section: Section = {
        id: key,
        title: `${l.issue!.number}/${l.issue!.year}`,
        leads: [],
        issue: l.issue
      }
      issueMap.set(key, section)
      sections.push(section)
    }
    issueMap.get(key)!.leads.push(l)
  })

  sections.sort((a, b) => {
    if (!a.issue || !b.issue) return 0
    if (a.issue.year !== b.issue.year) return a.issue.year - b.issue.year
    return a.issue.number - b.issue.number
  })

  const ideaPool = acceptedLeads.value.filter(l => !l.issue)
  if (ideaPool.length > 0) {
    sections.push({
      id: "idea-pool",
      title: "Idea Pool",
      leads: ideaPool
    })
  }

  return sections
})

const existingIssues = computed(() => {
  if (!leadsData.value) return []
  const issues = new Map<string, { year: number, number: number }>()
  leadsData.value.forEach((l) => {
    if (l.issue) {
      const key = `${l.issue.number}/${l.issue.year}`
      issues.set(key, l.issue)
    }
  })
  return Array.from(issues.values()).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.number - a.number
  })
})

const setPageRows = (page: any, newCount: number) => {
  const oldCount = page.rows.length
  if (newCount === oldCount) return
  if (newCount < oldCount) {
    const deletedRows = page.rows.slice(newCount)
    const hasAssignments = deletedRows.some((r: any) => r.items.length > 0)
    if (hasAssignments) {
      if (!confirm("Deleted rows contain assigned leads or ads. Are you sure you want to proceed?")) {
        // Find the select element and revert its value by forcing an update (Vue reactivity might lack here without direct ref, but we don't bind v-model on it directly)
        return
      }
    }
    page.rows.length = newCount
  } else {
    for (let i = oldCount; i < newCount; i++) {
      page.rows.push({ id: generateRowId(), items: [] })
    }
  }
}

const onRowAdd = (evt: any, row: any) => {
  if (row.items.length > 1) {
    row.items = [row.items[evt.newIndex]]
  }
}

const onAddAd = (row: any) => {
  row.items.push({ isAd: true, _id: "ad-" + generateRowId() })
}

const onDeleteItem = (row: any) => {
  row.items = []
}

const hasAssignments = (page: any) => {
  return page.rows.some((r: any) => r.items.length > 0)
}
</script>

<template>
  <div
    v-if="issue"
    class="flex h-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans"
  >
    <!-- Left Pane: Leads -->
    <div class="flex-1 border-r border-slate-200 dark:border-slate-800 overflow-y-auto px-6 py-6 bg-white dark:bg-slate-900 shadow-sm z-10 flex flex-col gap-10">
      <!-- Loading State -->
      <div
        v-if="isPending"
        class="flex justify-center py-10"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin text-primary-500"
        />
      </div>

      <!-- Leads Lists -->
      <div
        v-else
        class="flex flex-col gap-8"
      >
        <!-- New Leads -->
        <section v-if="newLeads.length > 0">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs bg-primary-500">
              N
            </div>
            <h2 class="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase uppercase">
              New Leads
            </h2>
          </div>

          <draggable
            :list="newLeads"
            group="leads"
            item-key="_id"
            ghost-class="opacity-40"
            class="flex flex-col gap-3 min-h-[50px]"
          >
            <template #item="{ element: lead }">
              <div class="cursor-pointer">
                <LeadCard
                  :lead="lead"
                  :existing-issues="existingIssues"
                />
              </div>
            </template>
          </draggable>
        </section>

        <!-- Grouped Accepted Leads -->
        <section
          v-for="section in groupedSections"
          :key="section.id"
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs"
              :class="section.id === 'idea-pool' ? 'bg-amber-500' : 'bg-slate-700 dark:bg-slate-600'"
            >
              {{ section.id === 'idea-pool' ? '★' : '#' }}
            </div>
            <h2 class="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              {{ section.title }}
            </h2>
            <span class="ml-auto text-xs font-semibold text-slate-400 tabular-nums">{{ section.leads.length }}</span>
          </div>

          <draggable
            :list="section.leads"
            group="leads"
            item-key="_id"
            ghost-class="opacity-40"
            class="flex flex-col gap-3 min-h-[50px]"
          >
            <template #item="{ element: lead }">
              <div class="cursor-pointer">
                <LeadCard
                  :lead="lead"
                  :existing-issues="existingIssues"
                />
              </div>
            </template>
          </draggable>
        </section>

        <!-- Empty left pane info -->
        <div
          v-if="newLeads.length === 0 && groupedSections.length === 0"
          class="text-center py-10"
        >
          <p class="text-sm text-slate-500">
            All available leads are assigned!
          </p>
        </div>
      </div>
    </div>

    <!-- Right Pane: Magazine Editor Grid -->
    <div class="w-1/2 xl:w-1/3 shrink-0 overflow-y-auto relative">
      <!-- Top header strip -->
      <div class="sticky top-0 z-20 px-8 py-5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center shadow-sm">
        <div class="flex flex-col">
          <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2">
            Issue {{ issue.number }}/{{ issue.year }}
          </h1>
          <span class="text-sm text-slate-500 font-medium">Release: {{ issue.releaseDate }}</span>
        </div>
        <div class="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm">
          <span class="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Pages:</span>
          <UInput
            v-model.number="totalPages"
            type="number"
            class="w-24 text-center font-bold"
            min="1"
            @change="onTotalPagesChange"
          />
        </div>
      </div>

      <!-- Grid Container -->
      <div class="px-8 py-8">
        <!-- Grid -->
        <div class="grid grid-cols-2 gap-6">
          <!-- Single Page -->
          <div
            v-for="page in issue.pages"
            :key="page.pageNumber"
            :class="[
              'rounded-2xl border min-h-[220px] transition-all relative group flex flex-col pt-12 pb-3 px-3 shadow-sm hover:shadow-md',
              hasAssignments(page) ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700' : 'bg-slate-200/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-80',
              page.pageNumber === 1 ? 'col-start-2' : ''
            ]"
          >
            <div class="absolute top-0 left-0 w-full h-10 flex items-center px-4 justify-between border-b border-slate-100 dark:border-slate-800 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 rounded-t-2xl">
              <span class="font-bold text-slate-700 dark:text-slate-300 font-mono tracking-wider">Pg {{ page.pageNumber }}</span>

              <div class="opacity-0 group-hover:opacity-100 transition-opacity z-10 w-24">
                <!-- We manually ensure the selector visually reverts on cancel by binding value to length, though simple select might need forced update -->
                <select
                  class="w-full text-xs font-semibold border border-slate-300 dark:border-slate-600 rounded-lg py-1 px-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                  @change="setPageRows(page, Number(($event.target as HTMLSelectElement).value))"
                >
                  <option
                    v-for="n in 4"
                    :key="n"
                    :value="n"
                    :selected="page.rows.length === n"
                  >
                    {{ n }} Row{{ n>1 ? 's': '' }}
                  </option>
                </select>
              </div>
            </div>

            <div class="flex-1 flex flex-col gap-2 mt-2">
              <div
                v-for="(row, idx) in page.rows"
                :key="row.id"
                class="flex-1 min-h-[60px] border-2 border-dashed rounded-xl relative overflow-hidden flex transition-colors"
                :class="row.items.length > 0 ? 'bg-white border-transparent shadow dark:bg-slate-800' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50'"
              >
                <draggable
                  v-model="row.items"
                  group="leads"
                  item-key="_id"
                  class="flex-1 w-full h-full flex flex-col relative z-0"
                  ghost-class="!h-full flex-1 opacity-50"
                  @add="onRowAdd($event, row)"
                >
                  <template #item="{ element }">
                    <div class="w-full h-full flex-1 bg-white dark:bg-slate-800 flex items-center justify-between px-4 py-2 group/item relative z-10 transition-colors">
                      <!-- Ad Representation -->
                      <template v-if="element.isAd">
                        <div class="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-950/30 w-full h-full z-0">
                          <span class="text-red-500 font-black uppercase tracking-widest text-lg">ADS</span>
                        </div>
                      </template>
                      <!-- Lead Representation -->
                      <template v-else>
                        <div class="flex items-center gap-3 z-20 w-full overflow-hidden">
                          <div class="w-2 h-full absolute left-0 top-0 bottom-0 bg-primary-500" />
                          <span class="font-bold text-sm text-slate-800 dark:text-slate-100 truncate pl-2">{{ element.title || element.company }}</span>
                        </div>
                      </template>

                      <!-- Delete Assignment Button -->
                      <button
                        aria-label="Delete assignment"
                        class="z-30 text-slate-400 hover:text-red-500 hidden group-hover/item:flex items-center justify-center absolute right-2 opacity-100 bg-white dark:bg-slate-800 shadow-sm p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition"
                        @click="onDeleteItem(row)"
                      >
                        <UIcon
                          name="i-lucide-x"
                          class="w-4 h-4"
                        />
                      </button>
                    </div>
                  </template>
                  <template #footer>
                    <!-- Empty State -->
                    <div
                      v-if="row.items.length === 0"
                      class="absolute inset-0 w-full h-full flex items-center justify-between px-3 text-slate-400 z-0 pointer-events-none"
                    >
                      <span class="text-xs font-medium uppercase tracking-wider text-slate-400/70">Drop lead</span>
                      <div class="pointer-events-auto">
                        <UButton
                          size="xs"
                          variant="outline"
                          color="gray"
                          class="bg-white/50 dark:bg-slate-800/50 font-bold hover:bg-slate-100 hover:text-red-600 transition"
                          @click="onAddAd(row)"
                        >
                          Ads
                        </UButton>
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
            </div>
          </div>
        </div>
        <div class="h-20" /> <!-- Bottom padding -->
      </div>
    </div>
  </div>
</template>
