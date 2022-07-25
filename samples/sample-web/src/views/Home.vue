<template>
  <!--
  <MyDialog>
    <DialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900">Slot title</DialogTitle>
    <div class="mt-2">
      <p class="text-sm text-gray-500">Slot content</p>
    </div>
  </MyDialog>
  -->

  <!-- auto-vertical -->

  <div class="bg-gray-200 w-screen h-screen p-2 flex flex-col space-y-6">
    <div class="flex space-x-2">
      <h2 class="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
        Categorise
      </h2>
    </div>

    <div id="myGrid" style="width: 800px; height: 600px" class="ag-theme-alpine"></div>
  </div>
</template>

<script setup>
import EXAMPLES from "@spike/api-statements/examples/gen/index.js";
import * as MainGrid from "@/components/mainGrid";
import { onMounted } from "vue";

onMounted(() => {
  MainGrid.init("#myGrid", EXAMPLES["pdf/success/bank-statement-normal"].result.data.transactions);
});
</script>
