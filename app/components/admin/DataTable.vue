<script setup>
const props = defineProps({
  columns: Array,
  rows: Array,
  loading: Boolean,
  total: Number,
  page: { type: Number, default: 1 }
})
const emit = defineEmits(['sort', 'page-change'])
const sortKey = ref('')
const sortDir = ref('asc')

function sortBy(key) {
  if (!key) return
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
  emit('sort', sortKey.value, sortDir.value)
}
</script>

<template>
  <div
    class="border-[0.1px] border-dashed border-dashcolor/50 overflow-hidden rounded-none"
  >
    <div
      v-if="loading"
      class="p-8 text-center text-zinc-500"
    >
      Chargement...
    </div>
    <table
      v-else
      class="w-full text-sm"
    >
      <thead
        class="border-b border-[0.1px] border-dashed border-dashcolor/50 bg-[#111]"
      >
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :class="col.sortable ? 'cursor-pointer hover:text-white' : ''"
            class="text-left px-4 py-3 font-medium text-zinc-500"
            @click="col.sortable ? sortBy(col.key) : null"
          >
            {{ col.label }}
            <UIcon
              v-if="col.sortable && sortKey === col.key"
              :name="
                sortDir === 'asc'
                  ? 'i-lucide-chevron-up'
                  : 'i-lucide-chevron-down'
              "
              class="w-3 h-3 inline ml-1"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.id"
          class="border-b border-[0.1px] border-dashed border-dashcolor/30 hover:bg-primary/5 transition"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3 text-white"
          >
            <slot
              :name="col.key"
              :row="row"
            >
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
        <tr v-if="!rows || rows.length === 0">
          <td
            :colspan="columns?.length"
            class="px-4 py-8 text-center text-zinc-500"
          >
            Aucune donnée
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Pagination -->
    <div
      v-if="total && total > 0"
      class="flex items-center justify-between px-4 py-3 border-t border-[0.1px] border-dashed border-dashcolor/30"
    >
      <span class="text-sm text-zinc-500">{{ total }} résultat{{ total > 1 ? "s" : "" }}</span>
      <div class="flex gap-2">
        <CUButton
          size="xs"
          label="Précédent"
          :disabled="page <= 1"
          @click="emit('page-change', page - 1)"
        />
        <span class="text-sm text-zinc-500 flex items-center px-2">{{
          page
        }}</span>
        <CUButton
          size="xs"
          label="Suivant"
          :disabled="page * 10 >= total"
          @click="emit('page-change', page + 1)"
        />
      </div>
    </div>
  </div>
</template>
