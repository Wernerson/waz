<script setup lang="ts">
import { ref } from 'vue'
import draggable from 'vuedraggable'

interface Task {
  id: string
  text: string
  status: 'todo' | 'in-progress' | 'done'
}

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-100 dark:bg-slate-800' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'done', title: 'Done', color: 'bg-green-50 dark:bg-green-900/20' }
] as const

const tasksByStatus = ref<Record<Task['status'], Task[]>>({
  'todo': [
    { id: '4', text: 'Add HTML5 drag and drop API support', status: 'todo' },
    { id: '5', text: 'Refactor UI components to use Tailwind CSS variants', status: 'todo' },
    { id: '6', text: 'Setup CI/CD pipeline in GitHub Actions', status: 'todo' }
  ],
  'in-progress': [
    { id: '2', text: 'Implement authentication using NextAuth.js or custom solution', status: 'in-progress' },
    { id: '3', text: 'Create board layout with responsive grid', status: 'in-progress' }
  ],
  'done': [
    { id: '1', text: 'Design new architecture for the Nuxt app', status: 'done' }
  ]
})

const onChange = (event: { added?: { element: Task } }, newStatus: Task['status']) => {
  if (event.added) {
    const task = event.added.element
    task.status = newStatus
  }
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-950 p-6 md:p-8 font-sans">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 pl-1">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Project Tasks
        </h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">
          Manage your development workflow.
        </p>
      </div>

      <div class="flex flex-col md:flex-row gap-6 items-start overflow-x-auto pb-8">
        <!-- Columns -->
        <div
          v-for="col in columns"
          :key="col.id"
          class="flex-1 w-full md:min-w-[320px] md:w-[320px] lg:w-auto shrink-0 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col transition-colors duration-200"
          :class="[col.color]"
        >
          <!-- Column Header -->
          <div class="p-4 border-b border-slate-200/60 dark:border-slate-700/60 flex justify-between items-center bg-white/40 dark:bg-slate-900/40 rounded-t-2xl backdrop-blur-sm">
            <h2 class="font-semibold text-slate-800 dark:text-slate-200 text-sm tracking-wide uppercase">
              {{ col.title }}
            </h2>
            <span class="bg-white dark:bg-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-400 shadow-sm border border-slate-200 dark:border-slate-700">
              {{ (tasksByStatus[col.id as Task['status']] || []).length }}
            </span>
          </div>

          <!-- Column Tasks -->
          <draggable
            v-model="tasksByStatus[col.id as Task['status']]"
            group="tasks"
            item-key="id"
            class="p-4 flex-1 flex flex-col gap-3 min-h-[500px]"
            ghost-class="opacity-40"
            drag-class="rotate-2"
            :animation="200"
            @change="onChange($event, col.id)"
          >
            <template #item="{ element }">
              <TaskCard
                :task="element"
                :column-title="col.title"
              />
            </template>

            <template #footer>
              <!-- Empty state area for dropping -->
              <div
                v-if="(tasksByStatus[col.id as Task['status']] || []).length === 0"
                class="h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm gap-2 mt-auto"
              >
                <UIcon
                  name="i-lucide-inbox"
                  class="w-5 h-5 opacity-50"
                />
                <span>Drop task here</span>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>
  </div>
</template>
