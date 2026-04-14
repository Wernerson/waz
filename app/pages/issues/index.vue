<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "#imports"
import { useMagazineIssues } from "~/composables/useMagazineIssues"

const { issues, addIssue } = useMagazineIssues()
const router = useRouter()

const isModalOpen = ref(false)

const year = ref(new Date().getFullYear() % 100)
const number = ref(1)
const releaseDate = ref("")

const onCreate = () => {
  if (!releaseDate.value) return

  const id = addIssue(year.value, number.value, releaseDate.value)
  isModalOpen.value = false
  router.push(`/issues/${id}`)
}
</script>

<template>
  <UContainer class="py-8">
    <div class="flex justify-between items-end mb-8 pl-1">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Magazine Issues
        </h1>
        <p class="text-slate-500 mt-1">
          Manage issues and their page layouts.
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        label="New Issue"
        color="primary"
        @click="isModalOpen = true"
      />
    </div>

    <!-- Empty State -->
    <div
      v-if="issues.length === 0"
      class="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl"
    >
      <div class="bg-slate-50 dark:bg-slate-900/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
        <UIcon
          name="i-lucide-book-open"
          class="w-10 h-10 text-slate-300"
        />
      </div>
      <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        No issues found
      </h2>
      <p class="text-slate-500 mb-6">
        Start by creating your first magazine issue.
      </p>
      <UButton
        icon="i-lucide-plus"
        size="lg"
        @click="isModalOpen = true"
      >
        Create Issue
      </UButton>
    </div>

    <!-- Issue List -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
    >
      <div
        v-for="issue in issues"
        :key="issue.id"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
        @click="router.push(`/issues/${issue.id}`)"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-lg">
            {{ issue.number }}/{{ issue.year }}
          </div>
          <UIcon
            name="i-lucide-chevron-right"
            class="w-5 h-5 text-slate-400"
          />
        </div>

        <h3 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
          Issue {{ issue.number }}/{{ issue.year }}
        </h3>
        <div class="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Release: {{ issue.releaseDate }}
        </div>

        <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm">
          <span class="text-slate-500">Pages</span>
          <span class="font-semibold text-slate-700 dark:text-slate-300">{{ issue.pages.length }}</span>
        </div>
      </div>
    </div>

    <UModal
      v-model:open="isModalOpen"
      title="Create New Issue"
      description="Enter the issue details below."
    >
      <template #content>
        <div class="p-6 flex flex-col gap-4">
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Year (e.g. 26)</label>
              <UInput
                v-model.number="year"
                type="number"
              />
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Number (e.g. 2)</label>
              <UInput
                v-model.number="number"
                type="number"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Release Date</label>
            <UInput
              v-model="releaseDate"
              type="date"
            />
          </div>
          <div class="flex justify-end gap-3 mt-4">
            <UButton
              variant="ghost"
              color="neutral"
              @click="isModalOpen = false"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              :disabled="!releaseDate"
              @click="onCreate"
            >
              Create Issue
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
