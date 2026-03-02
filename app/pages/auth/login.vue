<template>
    <NoAdminPage>
      <BaseLayaoutContent>
        <div class="flex justify-center items-center py-10 min-h-screen">
            <LoginForm />
        </div>
      </BaseLayaoutContent>
    </NoAdminPage>
</template>

<script setup lang="ts">
import LoginForm from '~/components/LoginForm.vue';
</script>