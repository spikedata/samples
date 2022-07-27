<template>
  <div class="bg-gray-200 w-screen h-screen">
    <div class="p-6 max-w-5xl m-auto bg-white flex flex-col space-y-6">
      <h1 class="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
        Upload a pdf
      </h1>
      <div class="text-sm">
        note: this demo uses <span class="underline font-bold">/pdftest</span> which only loads the 1st 10 transactions
      </div>
      <div> </div>
      <div id="myGrid" style="w-full; height: 600px" class="ag-theme-alpine"></div>
    </div>
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
