<script setup lang="ts">
interface Day {
  date: string
  count: number
}

const props = defineProps<{
  data: Day[]
}>()

const WEEKDAYS = ['Lun', 'Mer', 'Ven']
const MONTHS = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Juin',
  'Juil',
  'Août',
  'Sep',
  'Oct',
  'Nov',
  'Déc'
]

const max = computed(() => Math.max(1, ...props.data.map(d => d.count)))

// Color intensity (4 levels) based on count relative to max
function levelColor(count: number): string {
  if (count === 0) return '#161616'
  const ratio = count / max.value
  if (ratio > 0.66) return '#22c55e'
  if (ratio > 0.33) return '#16a34a'
  return '#166534'
}

// Group days into weeks (columns of 7). Pad the start so the first column
// aligns on Monday.
const weeks = computed(() => {
  const days = props.data
  if (!days.length) return [] as Day[][]

  const firstDate = new Date(days[0]!.date)
  // getDay: 0=Sun..6=Sat → shift so Monday=0
  const pad = (firstDate.getDay() + 6) % 7

  const padded: (Day | null)[] = [...Array(pad).fill(null), ...days]
  const cols: (Day | null)[][] = []
  for (let i = 0; i < padded.length; i += 7) {
    cols.push(padded.slice(i, i + 7))
  }
  return cols
})

// Month labels positioned at the week where each month starts
const monthLabels = computed(() => {
  const labels: { col: number, name: string }[] = []
  let lastMonth = -1
  weeks.value.forEach((week, col) => {
    const firstReal = week.find(d => d)
    if (!firstReal) return
    const m = new Date(firstReal.date).getMonth()
    if (m !== lastMonth) {
      labels.push({ col, name: MONTHS[m]! })
      lastMonth = m
    }
  })
  return labels
})

const total = computed(() => props.data.reduce((s, d) => s + d.count, 0))
</script>

<template>
  <div class="overflow-x-auto">
    <div class="inline-block min-w-full">
      <!-- Month labels -->
      <div class="flex gap-[3px] mb-1 ml-8">
        <div
          v-for="(week, col) in weeks"
          :key="col"
          class="w-[11px] text-[10px] text-zinc-500"
        >
          <span v-if="monthLabels.find(l => l.col === col)">
            {{ monthLabels.find(l => l.col === col)?.name }}
          </span>
        </div>
      </div>

      <div class="flex">
        <!-- Weekday labels -->
        <div class="flex flex-col gap-[3px] mr-1 w-7 shrink-0">
          <div
            v-for="(d, row) in 7"
            :key="row"
            class="h-[11px] text-[10px] text-zinc-500 leading-[11px]"
          >
            {{ row % 2 === 1 ? WEEKDAYS[(row - 1) / 2] : '' }}
          </div>
        </div>

        <!-- Grid -->
        <div class="flex gap-[3px]">
          <div
            v-for="(week, col) in weeks"
            :key="col"
            class="flex flex-col gap-[3px]"
          >
            <div
              v-for="(day, row) in week"
              :key="row"
              class="w-[11px] h-[11px]"
              :style="{ backgroundColor: day ? levelColor(day.count) : 'transparent' }"
              :title="
                day
                  ? `${day.count} publication(s) le ${new Date(day.date).toLocaleDateString('fr-FR')}`
                  : ''
              "
            />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between mt-2 ml-8 text-[10px] text-zinc-500">
        <span>{{ total }} publications sur la période</span>
        <div class="flex items-center gap-1">
          <span>Moins</span>
          <span
            class="w-[11px] h-[11px]"
            style="background-color: #161616"
          />
          <span
            class="w-[11px] h-[11px]"
            style="background-color: #166534"
          />
          <span
            class="w-[11px] h-[11px]"
            style="background-color: #16a34a"
          />
          <span
            class="w-[11px] h-[11px]"
            style="background-color: #22c55e"
          />
          <span>Plus</span>
        </div>
      </div>
    </div>
  </div>
</template>
