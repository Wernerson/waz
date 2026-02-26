<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Nuxt Starter Template'
const description = 'A production-ready starter template powered by Nuxt UI. Build beautiful, accessible, and performant applications in minutes, not hours.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image'
})

const { isOpen, close } = useNewLeadModal()

const onModalSuccess = () => {
  close()
  // Optionally navigate to leads if not there
  const router = useRouter()
  if (router.currentRoute.value.path !== '/leads') {
    router.push('/leads')
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
          <AppLogo class="w-auto h-6 shrink-0" />
        </NuxtLink>

        <TemplateMenu />

        <UNavigationMenu
          :items="[{ label: 'Leads', to: '/leads' }]"
          variant="ghost"
        />
      </template>

      <template #right>
        <UColorModeButton />

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
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator icon="i-simple-icons-nuxtdotjs" />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Built with Nuxt UI • © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/nuxt-ui-templates/starter"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </UApp>
</template>
