<script setup>
useHead({
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1" }
  ],
  link: [
    { rel: "icon", href: "/favicon.ico" }
  ],
  htmlAttrs: {
    lang: "en"
  }
})

const title = "WAZ - Zeitschrift für Wald"
const description = "WAZ - Zeitschrift für Wald"

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
})

const { isOpen, close } = useNewLeadModal()

const onModalSuccess = () => {
  close()
  // Optionally navigate to leads if not there
  const router = useRouter()
  if (router.currentRoute.value.path !== "/leads") {
    router.push("/leads")
  }
}

const onModalClose = () => {
  close()
}
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/">
          <img
            src="/logo.jpg"
            class="h-6 w-auto"
          >
        </NuxtLink>

        <UNavigationMenu
          :items="[{ label: 'Leads', to: '/leads' }]"
          variant="ghost"
        />
      </template>

      <template #right>
        <UModal
          v-model:open="isOpen"
          title="Create New Lead"
          description="Fill in the details below to create a new lead."
        >
          <UButton
            icon="i-lucide-plus"
            aria-label="New Lead"
            color="neutral"
            variant="ghost"
          />

          <template #content>
            <div class="p-6">
              <NewLeadForm
                @success="onModalSuccess"
                @close="onModalClose"
              />
            </div>
          </template>
        </UModal>

        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>
