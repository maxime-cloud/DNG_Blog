<template>
    <NoAdminPage>
      <BaseLayaoutContent>
        <div class="flex justify-center items-center py-10 min-h-screen">
            <ForgotForm />
        </div>
      </BaseLayaoutContent>
    </NoAdminPage>
</template>

<script setup lang="ts">
import ForgotForm from '~/components/ForgotForm.vue';
</script>