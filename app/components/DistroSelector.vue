<template>
  <div class="flex items-center gap-2 flex-wrap">
    <CUButton
      v-for="distro in distros"
      :key="distro.id"
      :label="distro.label"
      :logo-name="distro.icon"
      logo-position="left"
      size="sm"
      class="transition-colors"
      :class="
        selected === distro.id ? 'bg-primary text-white border-primary/60' : ''
      "
      @click="select(distro.id)"
    />
  </div>
</template>

<script setup lang="ts">
const distros = [
  { id: "ubuntu", label: "Ubuntu", icon: "i-simple-icons-ubuntu" },
  { id: "fedora", label: "Fedora", icon: "i-simple-icons-fedora" },
  { id: "arch", label: "Arch", icon: "i-simple-icons-archlinux" },
] as const;

type DistroId = (typeof distros)[number]["id"];

const selected = useLocalStorage<DistroId>("selected-distro", "ubuntu");

provide("selected-distro", selected);

function select(id: DistroId) {
  selected.value = id;
}
</script>
