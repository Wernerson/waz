<script setup lang="ts">
import { ref } from 'vue'

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

const tasks = ref<Task[]>([
  { id: '1', text: 'Design new architecture for the Nuxt app', status: 'done' },
  { id: '2', text: 'Implement authentication using NextAuth.js or custom solution', status: 'in-progress' },
  { id: '3', text: 'Create board layout with responsive grid', status: 'in-progress' },
  { id: '4', text: 'Add HTML5 drag and drop API support', status: 'todo' },
  { id: '5', text: 'Refactor UI components to use Tailwind CSS variants', status: 'todo' },
  { id: '6', text: 'Setup CI/CD pipeline in GitHub Actions', status: 'todo' },
])

const draggedTaskId = ref<string | null>(null)

const onDragStart = (e: DragEvent, taskId: string) => {
  draggedTaskId.value = taskId
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', taskId)
    // Optional: could customize drag image here
  }
}

const onDrop = (e: DragEvent, status: Task['status']) => {
  const taskId = e.dataTransfer?.getData('text/plain') || draggedTaskId.value
  if (taskId) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task && task.status !== status) {
      task.status = status
    }
  }
  draggedTaskId.value = null
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-950 p-6 md:p-8 font-sans">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 pl-1">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Project Tasks</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Manage your development workflow.</p>
      </div>

      <div class="flex flex-col md:flex-row gap-6 items-start overflow-x-auto pb-8">
        <!-- Columns -->
        <div 
          v-for="col in columns" 
          :key="col.id"
          class="flex-1 w-full md:min-w-[320px] md:w-[320px] lg:w-auto shrink-0 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col transition-colors duration-200"
          :class="[col.color]"
          @dragover.prevent
          @dragenter.prevent
          @drop="onDrop($event, col.id as Task['status'])"
        >
          <!-- Column Header -->
          <div class="p-4 border-b border-slate-200/60 dark:border-slate-700/60 flex justify-between items-center bg-white/40 dark:bg-slate-900/40 rounded-t-2xl backdrop-blur-sm">
            <h2 class="font-semibold text-slate-800 dark:text-slate-200 text-sm tracking-wide uppercase">{{ col.title }}</h2>
            <span class="bg-white dark:bg-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-400 shadow-sm border border-slate-200 dark:border-slate-700">
              {{ tasks.filter(t => t.status === col.id).length }}
            </span>
          </div>

          <!-- Column Tasks -->
          <div class="p-4 flex-1 flex flex-col gap-3 min-h-[500px]">
            <TaskCard
              v-for="task in tasks.filter(t => t.status === col.id)"
              :key="task.id"
              :task="task"
              :column-title="col.title"
              @dragstart="onDragStart"
            />
            
            <!-- Empty state area for dropping -->
            <div 
              v-if="tasks.filter(t => t.status === col.id).length === 0"
              class="h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm gap-2"
            >
              <UIcon name="i-lucide-inbox" class="w-5 h-5 opacity-50" />
              <span>Drop task here</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
