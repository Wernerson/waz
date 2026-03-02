<script setup lang="ts">
import { api } from "@@/convex/_generated/api"
import type { Id } from "@@/convex/_generated/dataModel"

const props = defineProps<{
  lead: { _id: string }
}>()

defineEmits<{
  close: []
}>()

// Use query to get the live lead data including comments
const { data: fullLead } = useConvexQuery(api.leads.get, { id: props.lead._id as Id<"leads"> })

const commentText = ref("")
const isSubmitting = ref(false)
const { mutate: addComment } = useConvexMutation(api.leads.addComment)

// Inline editing state
const { mutate: updateTitle } = useConvexMutation(api.leads.updateTitle)
const { mutate: updateDescription } = useConvexMutation(api.leads.updateDescription)
const { mutate: updateOwner } = useConvexMutation(api.leads.updateOwner)
const { mutate: updateCategory } = useConvexMutation(api.leads.updateCategory)
const { mutate: updateIssue } = useConvexMutation(api.leads.updateIssue)
const { mutate: addAttachment } = useConvexMutation(api.leads.addAttachment)
const { mutate: generateUploadUrl } = useConvexMutation(api.files.generateUploadUrl)

const editingField = ref<string | null>(null)
const tempValue = ref("")
const tempIssueYear = ref<number | undefined>(undefined)
const tempIssueNumber = ref<number | undefined>(undefined)

const fixedCategories = ["Grüezi", "Rückblick", "Serie"]
const customItems = ref<string[]>([])

const categoryItems = computed(() => {
  return [...fixedCategories, ...customItems.value]
})

const onCreateCategory = (item: string) => {
  customItems.value.push(item)
  tempValue.value = item
  saveField()
}

const startEditing = (field: string, value: any) => {
  editingField.value = field
  if (field === "issue") {
    tempIssueYear.value = value?.year
    tempIssueNumber.value = value?.number
  } else {
    tempValue.value = value || ""
  }
}

const isSavingField = ref(false)

const saveField = async () => {
  if (!editingField.value || !fullLead.value || isSavingField.value) return

  const field = editingField.value

  if (field === "category") {
    // Menu selection needs time to update the model before we close the field
    await new Promise(resolve => setTimeout(resolve, 300))
    if (!editingField.value) return
  }

  const value = tempValue.value
  const id = fullLead.value._id

  isSavingField.value = true
  editingField.value = null

  try {
    if (field === "title") {
      await updateTitle({ id, title: value })
    } else {
      // Optional fields: description, owner, category
      const cleanedValue = (value === null || value === "") ? undefined : value

      if (field === "description") {
        await updateDescription({ id, description: cleanedValue as string | undefined })
      } else if (field === "owner") {
        await updateOwner({ id, owner: cleanedValue as string | undefined })
      } else if (field === "category") {
        await updateCategory({ id, category: cleanedValue as string | undefined })
      } else if (field === "issue") {
        const issue = (tempIssueYear.value && tempIssueNumber.value)
          ? { year: Number(tempIssueYear.value), number: Number(tempIssueNumber.value) }
          : undefined
        await updateIssue({ id, issue })
      }
    }
  } catch (err) {
    console.error(`Failed to update ${field}:`, err)
  } finally {
    isSavingField.value = false
  }
}

const handleAddComment = async () => {
  if (!commentText.value.trim() || isSubmitting.value) return

  isSubmitting.value = true
  try {
    await addComment({
      leadId: props.lead._id as Id<"leads">,
      author: "You", // Hardcoded for now as there's no auth
      text: commentText.value.trim()
    })
    commentText.value = ""
  } catch (err) {
    console.error("Failed to add comment:", err)
  } finally {
    isSubmitting.value = false
  }
}

// File upload handling
const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

const triggerUpload = () => {
  fileInput.value?.click()
}

const onFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isUploading.value = true
  try {
    const uploadUrl = await generateUploadUrl({})

    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file
    })

    if (!result.ok) throw new Error("Upload failed")

    const { storageId } = await result.json()

    await addAttachment({
      leadId: props.lead._id as Id<"leads">,
      storageId,
      name: file.name,
      contentType: file.type,
      size: file.size
    })
  } catch (err) {
    console.error("Upload failed:", err)
  } finally {
    isUploading.value = false
    if (fileInput.value) fileInput.value.value = ""
  }
}
</script>

<template>
  <USlideover
    title="Lead Details"
    :close="{ onClick: () => $emit('close') }"
  >
    <template #body>
      <div
        v-if="fullLead"
        class="space-y-8 h-full flex flex-col"
      >
        <div class="flex-1 space-y-8">
          <div>
            <div class="flex items-center gap-2 mb-3">
              <UBadge
                v-if="fullLead.issue"
                color="neutral"
                variant="outline"
                size="md"
              >
                #{{ fullLead.issue.number }}/{{ fullLead.issue.year }}
              </UBadge>
              <UBadge
                :color="fullLead.state === 'Accepted' ? 'success' : 'primary'"
                variant="subtle"
                size="md"
              >
                {{ fullLead.state }}
              </UBadge>
            </div>

            <div
              v-if="editingField === 'title'"
              class="mb-1"
            >
              <UInput
                v-model="tempValue"
                size="xl"
                class="font-bold w-full"
                autofocus
                @blur="saveField"
                @keydown.enter="saveField"
              />
            </div>
            <h2
              v-else
              class="text-2xl font-bold text-slate-900 dark:text-white leading-tight cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1 rounded -m-1"
              @click="startEditing('title', fullLead.title || '')"
            >
              {{ fullLead.title }}
            </h2>
          </div>

          <div>
            <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
              Description
            </h3>
            <div v-if="editingField === 'description'">
              <UTextarea
                v-model="tempValue"
                autoresize
                autofocus
                class="w-full"
                @blur="saveField"
              />
            </div>
            <p
              v-else
              class="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1 rounded -m-1"
              @click="startEditing('description', fullLead.description || '')"
            >
              {{ fullLead.description || 'Add a description...' }}
            </p>
          </div>

          <div class="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div>
              <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                Category
              </h3>
              <div v-show="editingField === 'category'">
                <UInputMenu
                  v-model="tempValue"
                  :items="categoryItems"
                  placeholder="Select category"
                  open-on-focus
                  class="w-full"
                  create-item
                  size="md"
                  autofocus
                  :clear="true"
                  @create="onCreateCategory"
                  @blur="saveField"
                  @update:model-value="saveField"
                />
              </div>
              <div
                v-show="editingField !== 'category'"
                class="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1 rounded -m-1 inline-block"
                @click="startEditing('category', fullLead.category || '')"
              >
                <UBadge
                  v-if="fullLead.category"
                  color="primary"
                  variant="subtle"
                  size="md"
                >
                  {{ fullLead.category }}
                </UBadge>
                <span
                  v-else
                  class="text-slate-400 italic text-sm"
                >Select category...</span>
              </div>
            </div>

            <div>
              <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                Owner
              </h3>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <UIcon
                    name="i-lucide-user"
                    class="w-4 h-4 text-slate-500"
                  />
                </div>
                <div v-if="editingField === 'owner'">
                  <UInput
                    v-model="tempValue"
                    autofocus
                    @blur="saveField"
                    @keydown.enter="saveField"
                  />
                </div>
                <span
                  v-else
                  class="font-medium text-slate-900 dark:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1 rounded -m-1"
                  @click="startEditing('owner', fullLead.owner || '')"
                >
                  {{ fullLead.owner || 'Unassigned' }}
                </span>
              </div>
            </div>

            <div>
              <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                Issue
              </h3>
              <div
                v-if="editingField === 'issue'"
                class="flex items-center gap-1"
              >
                <UInput
                  v-model="tempIssueNumber"
                  type="number"
                  placeholder="No."
                  class="w-12"
                  size="xs"
                  @blur="saveField"
                  @keydown.enter="saveField"
                />
                <span class="text-slate-400">/</span>
                <UInput
                  v-model="tempIssueYear"
                  type="number"
                  placeholder="YYYY"
                  class="w-16"
                  size="xs"
                  @blur="saveField"
                  @keydown.enter="saveField"
                />
              </div>
              <div
                v-else
                class="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1 rounded -m-1 inline-block"
                @click="startEditing('issue', fullLead.issue)"
              >
                <span
                  v-if="fullLead.issue"
                  class="font-medium text-slate-900 dark:text-white"
                >
                  {{ fullLead.issue.number }}/{{ fullLead.issue.year }}
                </span>
                <span
                  v-else
                  class="text-slate-400 italic text-sm"
                >Set issue...</span>
              </div>
            </div>
          </div>

          <div class="pt-6 border-t border-slate-100 dark:border-slate-800">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Attachments ({{ fullLead.attachments?.length || 0 }})
              </h3>
              <UButton
                icon="i-lucide-upload"
                size="xs"
                variant="ghost"
                label="Upload"
                :loading="isUploading"
                @click="triggerUpload"
              />
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                @change="onFileChange"
              >
            </div>

            <div
              v-if="fullLead.attachments && fullLead.attachments.length > 0"
              class="space-y-2"
            >
              <a
                v-for="file in fullLead.attachments"
                :key="file.storageId"
                :href="file.url || '#'"
                target="_blank"
                class="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
              >
                <div class="flex items-center gap-3 overflow-hidden">
                  <UIcon
                    :name="file.contentType.startsWith('image/') ? 'i-lucide-image' : 'i-lucide-file-text'"
                    class="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors flex-shrink-0"
                  />
                  <div class="flex flex-col overflow-hidden">
                    <span class="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {{ file.name }}
                    </span>
                    <span class="text-xs text-slate-500">
                      {{ (file.size / 1024).toFixed(1) }} KB
                    </span>
                  </div>
                </div>
                <UIcon
                  name="i-lucide-external-link"
                  class="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </a>
            </div>
            <p
              v-else
              class="text-sm text-slate-400 italic py-2 text-center"
            >
              No attachments yet.
            </p>
          </div>

          <div class="pt-6 border-t border-slate-100 dark:border-slate-800">
            <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Comments
            </h3>

            <div class="space-y-4 mb-6">
              <div
                v-for="comment in fullLead.comments"
                :key="comment._id"
                class="flex gap-3"
              >
                <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span class="text-[10px] font-bold text-primary">{{ (comment.author?.[0] || 'U').toUpperCase() }}</span>
                </div>
                <div class="flex-1 space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ comment.author }}</span>
                    <span class="text-[10px] text-slate-400">{{ new Date(comment._creationTime).toLocaleString() }}</span>
                  </div>
                  <p class="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    {{ comment.text }}
                  </p>
                </div>
              </div>

              <div
                v-if="!fullLead.comments || fullLead.comments.length === 0"
                class="text-center py-6"
              >
                <p class="text-sm text-slate-400 italic">
                  No comments yet. Be the first to add one!
                </p>
              </div>
            </div>

            <div class="space-y-3">
              <UTextarea
                v-model="commentText"
                placeholder="Write a comment..."
                autoresize
                :rows="2"
                class="w-full"
                @keydown.enter.ctrl.prevent="handleAddComment"
              />
              <div class="flex justify-end">
                <UButton
                  label="Post Comment"
                  size="sm"
                  :loading="isSubmitting"
                  :disabled="!commentText.trim()"
                  @click="handleAddComment"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Moved Lead ID to the bottom of the body -->
        <div class="pt-8 mt-auto flex items-center gap-2 text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <UIcon
            name="i-lucide-hash"
            class="w-4 h-4"
          />
          <span class="text-[10px] font-mono tracking-tighter uppercase">Lead ID:</span>
          <span class="text-[10px] font-mono">{{ fullLead?._id }}</span>
        </div>
      </div>

      <div
        v-else
        class="flex items-center justify-center h-full"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin text-primary"
        />
      </div>
    </template>
  </USlideover>
</template>
