<script setup lang="ts">
export interface Task {
  id: string
  text: string
  status: 'todo' | 'in-progress' | 'done'
}

defineProps<{
  task: Task
  columnTitle: string
}>()
</script>

<template>
  <div
    class="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-600/50 group hover:-translate-y-0.5"
  >
    <div class="flex flex-col gap-3">
      <span
        class="inline-flex px-2 py-0.5 rounded text-[10px] font-medium w-fit tracking-wider uppercase"
        :class="{
          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400': task.status === 'todo',
          'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400': task.status === 'in-progress',
          'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400': task.status === 'done'
        }"
      >
        {{ columnTitle }}
      </span>

      <p class="text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
        {{ task.text }}
      </p>

      <!-- Footer of the card -->
      <div class="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <UIcon
          name="i-lucide-grip-horizontal"
          class="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 w-4 h-4 transition-colors"
        />
        <div class="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[11px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          T-{{ task.id }}
        </div>
      </div>
    </div>
  </div>
</template>
