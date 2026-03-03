<template>
    <NoAdminPage>
      <BaseLayaoutContent>
        <div class="flex justify-center items-center py-10 min-h-screen">
            <ResetForm />
        </div>
        {{ route.query }}
      </BaseLayaoutContent>
    </NoAdminPage>
</template>

<script setup lang="ts">
import ResetForm from '~/components/ResetForm.vue';

const route = useRoute();
if (!("error" in route.query) && !("token" in route.query)) {
  throw createError({
    status: 404,
    statusText: 'Page non trouver',
  })  
}

</script>