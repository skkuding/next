<script setup lang="ts">
import { ref } from 'vue'
import PaginationTable from './PaginationTable.vue'

const fields = [
  {
    key: 'name',
    label: 'Object'
  },
  { key: 'color', custom: true }
]

type itemType = {
  name: string
  color: string
}

// initial items
const items = [
  [
    { name: 'Apple', color: 'red' },
    { name: 'Banana', color: 'yellow' },
    { name: 'Car', color: 'blue' }
  ],
  [
    { name: 'Dog', color: 'brown' },
    { name: 'Elephant', color: 'gray' },
    { name: 'Fox', color: 'orange' }
  ],
  [
    { name: 'Grape', color: 'purple' },
    { name: 'Hamster', color: 'yellow' }
  ]
]

// new items of n pages
const nitems = ref(items)
const npage = ref(items.length)

// items in current page
const cur = ref(0)
const curitems = ref(nitems.value[0])

const filter = (keyword: string) => {
  let total = []
  let perPage = []
  for (const item of items) {
    for (const row of item) {
      if (perPage.length === 3) {
        total.push(perPage)
        perPage = []
      }
      if (row.name.includes(keyword) || row.color.includes(keyword))
        perPage.push(row)
    }
  }
  if (perPage.length > 0) total.push(perPage)

  nitems.value = total
  npage.value = nitems.value.length

  curitems.value = nitems.value[0]
  cur.value = 0
}

const changeItems = (page: number) => {
  cur.value = page - 1
  curitems.value = nitems.value[cur.value]
}

// show name when click the row
const selected = ref('')

const clickRow = (row: itemType) => {
  selected.value = row.name
}
</script>

<template>
  <Story>
    <PaginationTable
      :fields="fields"
      :items="curitems"
      placeholder="keywords"
      text="No data"
      :number-of-pages="npage"
      @search="filter"
      @change-page="changeItems"
      @row-clicked="clickRow"
    >
      <template #color="data">
        <div class="flex items-center">
          <div
            class="mr-2 h-5 w-5 rounded-full"
            :style="'background:' + data.row.color"
          ></div>
          {{ data.row.color }}
        </div>
      </template>
    </PaginationTable>

    <div class="mt-10">Click item : {{ selected }}</div>
  </Story>
</template>
