<script setup lang="ts">
import { api } from '@@/convex/_generated/api'

const emit = defineEmits(['success', 'close'])

const state = reactive({
  title: '',
  description: '',
  category: '',
  owner: ''
})

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

const onSubmit = async () => {
  if (!state.title) return

  try {
    await createLead({
      title: state.title,
      description: state.description || undefined,
      category: state.category || undefined,
      owner: state.owner || undefined
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

    <UFormField
      label="Category"
      name="category"
      class="w-full"
    >
      <UInputMenu
        v-model="state.category"
        :items="categoryItems"
        placeholder="Select or enter category"
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
      class="w-full"
    >
      <UInput
        v-model="state.owner"
        placeholder="Lead owner"
        class="w-full"
        size="md"
      />
    </UFormField>

    <div class="flex justify-end gap-3 pt-4">
      <UButton
        type="button"
        label="Cancel"
        color="neutral"
        variant="ghost"
        @click="emit('close')"
      />
      <UButton
        type="submit"
        label="Create"
        color="primary"
        size="lg"
        class="px-8"
      />
    </div>
  </UForm>
</template>
