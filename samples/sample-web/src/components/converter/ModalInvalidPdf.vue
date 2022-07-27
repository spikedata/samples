<template>
  <TransitionRoot as="template" :show="open">
    <Dialog
      as="div"
      auto-reopen="true"
      class="fixed z-10 inset-0 overflow-y-auto"
      @close="open = false"
      @keyup.enter="click(2)"
      @keyup.esc="click(2)"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <DialogOverlay class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 translate-y-0 sm:scale-100"
          leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div
            class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6"
          >
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <ExclamationIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <DialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900"> Invalid PDF </DialogTitle>
              <div class="mt-4">
                <p class="text-sm text-gray-800"> This file does not appear to be a valid pdf: </p>
                <p class="mt-2 text-sm text-blue-600"> {{ filePath }} </p>
                <p class="mt-4 text-sm text-gray-800"
                  >Contact
                  <a href="mailto:support@spikedata.co.za" class="text-primary hover:text-primary-600">
                    support@spikedata.co.za
                  </a>
                  if you believe that this is a valid pdf.</p
                >
              </div>
            </div>
            <div class="flex space-x-2 mt-5 sm:mt-6">
              <button
                type="button"
                class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                @click="click(2)"
              >
                skip this file
              </button>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { Dialog, DialogOverlay, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
import { CheckIcon, ExclamationIcon } from "@heroicons/vue/outline";
import { computed, ref } from "vue";
import * as promiseCallback from "../../lib/promiseCallback.js";

const open = ref(false);
const filePath = ref("");

defineExpose({
  show,
});
let signal; // promiseCallback

async function show(fp) {
  filePath.value = fp;
  open.value = true;
  signal = promiseCallback.create();
  return await signal;
}

function click(i) {
  signal.resolve({
    result: i,
  });
  open.value = false;
}
</script>
