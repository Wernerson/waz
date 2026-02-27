<script setup lang="ts">
import { api } from '@@/convex/_generated/api'

const emit = defineEmits(['success', 'close'])

const state = reactive({
  title: '',
  description: '',
  category: '',
  owner: '',
})

interface SelectedFile {
  file: File
  storageId?: string
  status: 'pending' | 'uploading' | 'done' | 'error'
}

const selectedFiles = ref<SelectedFile[]>([])

const fixedCategories = ['Grüezi', 'Rückblick', 'Serie']
const items = ref<string[]>([])

const categoryItems = computed(() => {
  return [...fixedCategories, ...items.value]
})

const onCreateCategory = (item: string) => {
  items.value.push(item)
  state.category = item
}

const { mutate: createLead } = useConvexMutation(api.leads.createLead)
const { mutate: generateUploadUrl } = useConvexMutation(api.files.generateUploadUrl)

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files) return

  const files = Array.from(target.files)
  files.forEach(file => {
    selectedFiles.value.push({
      file,
      status: 'pending'
    })
  })
  
  // Reset input
  target.value = ''
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const uploadFiles = async () => {
  const uploads = selectedFiles.value.map(async (item) => {
    if (item.status === 'done') return
    
    item.status = 'uploading'
    try {
      const postUrl = await generateUploadUrl({})
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": item.file.type },
        body: item.file,
      });
      const { storageId } = await result.json();
      item.storageId = storageId
      item.status = 'done'
    } catch (error) {
      console.error('File upload failed:', error)
      item.status = 'error'
    }
  })
  
  await Promise.all(uploads)
}

const onSubmit = async () => {
  if (!state.title) return

  try {
    await uploadFiles()
    
    const attachments = selectedFiles.value
      .filter(f => f.status === 'done' && f.storageId)
      .map(f => ({
        storageId: f.storageId as any,
        name: f.file.name,
        contentType: f.file.type,
        size: f.file.size
      }))

    await createLead({
      title: state.title,
      description: state.description || undefined,
      category: state.category || undefined,
      owner: state.owner || undefined,
      attachments: attachments as any
    })

    emit('success')
  } catch (error) {
    console.error('Failed to create lead:', error)
  }
}
</script>

<template>
  <UForm
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <UFormField
      label="Title"
      name="title"
      required
      class="w-full"
    >
      <UInput
        v-model="state.title"
        placeholder="Lead title"
        class="w-full font-bold text-lg"
        size="lg"
        autofocus
      />
    </UFormField>

    <UFormField
      label="Description"
      name="description"
      class="w-full"
    >
      <UTextarea
        v-model="state.description"
        placeholder="Lead description"
        class="w-full"
        :rows="4"
        size="md"
      />
    </UFormField>

    <div class="flex flex-col gap-4">
      <h3 class="text-sm font-medium text-slate-700 dark:text-slate-300">
        Attachments
      </h3>

      <div
        v-if="selectedFiles.length > 0"
        class="space-y-2 mb-2"
      >
        <div
          v-for="(item, index) in selectedFiles"
          :key="index"
          class="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group"
        >
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="w-10 h-10 rounded bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 flex-shrink-0">
              <UIcon
                v-if="item.status === 'uploading'"
                name="i-lucide-loader-2"
                class="w-5 h-5 animate-spin text-primary"
              />
              <UIcon
                v-else-if="item.status === 'done'"
                name="i-lucide-check-circle-2"
                class="w-5 h-5 text-green-500"
              />
              <UIcon
                v-else-if="item.status === 'error'"
                name="i-lucide-alert-circle"
                class="w-5 h-5 text-red-500"
              />
              <UIcon
                v-else
                name="i-lucide-file"
                class="w-5 h-5 text-slate-400"
              />
            </div>
            <div class="flex flex-col overflow-hidden">
              <span class="text-sm font-medium text-slate-900 dark:text-white truncate">
                {{ item.file.name }}
              </span>
              <span class="text-xs text-slate-500">
                {{ (item.file.size / 1024 / 1024).toFixed(2) }} MB
              </span>
            </div>
          </div>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="xs"
            class="opacity-0 group-hover:opacity-100 transition-opacity"
            @click="removeFile(index)"
          />
        </div>
      </div>

      <div class="relative">
        <input
          id="file-upload"
          type="file"
          multiple
          class="hidden"
          @change="onFileChange"
        >
        <label
          for="file-upload"
          class="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all cursor-pointer group"
        >
          <div class="flex items-center gap-2 text-slate-500 group-hover:text-primary transition-colors">
            <UIcon
              name="i-lucide-paperclip"
              class="w-5 h-5"
            />
            <span class="text-sm font-medium">Add Attachments</span>
          </div>
          <span class="text-xs text-slate-400 mt-1">Upload relevant documents or images</span>
        </label>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 pt-4">
      <UFormField
        label="Category"
        name="category"
      >
        <UInputMenu
          v-model="state.category"
          :items="categoryItems"
          placeholder="Select category"
          open-on-focus
          class="w-full"
          create-item
          size="md"
          @create="onCreateCategory"
        />
      </UFormField>

      <UFormField
        label="Owner"
        name="owner"
      >
        <UInput
          v-model="state.owner"
          placeholder="Lead owner"
          class="w-full"
          size="md"
        />
      </UFormField>
    </div>

    <div class="flex justify-end gap-3 pt-6">
      <UButton
        type="button"
        label="Cancel"
        color="neutral"
        variant="ghost"
        @click="emit('close')"
      />
      <UButton
        type="submit"
        label="Create Lead"
        color="primary"
        size="lg"
        class="px-8 shadow-lg shadow-primary/20"
      />
    </div>
  </UForm>
</template>

