<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" auto-reopen="true" class="fixed z-10 inset-0 overflow-y-auto" @close="open = false">
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
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckIcon class="h-6 w-6 text-green-600" aria-hidden="true" />
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <DialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900"> Password required </DialogTitle>
              <div class="mt-4">
                <p class="text-sm text-gray-800"> Please enter a password for the following file:</p>
                <p class="mt-2 text-sm text-blue-600"> {{ filePath }} </p>
                <!-- <input type="text" placeholder="password" v-model="password" /> -->
                <!-- <label for="passord" class="block text-sm font-medium text-gray-700">Password</label> -->
                <div class="mt-2 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    v-model="password"
                    name="password"
                    id="password"
                    placeholder="password"
                    class="block w-full pr-10 sm:text-sm rounded-md focus:outline-none"
                    :class="passwordClass"
                    aria-invalid="true"
                    aria-describedby="password-error"
                  />
                  <div
                    v-if="!passwordValid"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                  >
                    <ExclamationCircleIcon class="h-5 w-5 text-red-500" aria-hidden="true" />
                  </div>
                </div>
                <p v-if="passwordValid" class="mt-2 h-3 text-sm">
                  <!-- spacer -->
                </p>
                <p v-if="!passwordValid" class="mt-2 h-3 text-sm text-red-600" id="password-error">
                  Your password can't be empty.
                </p>
              </div>
            </div>
            <div class="flex space-x-2 mt-5 sm:mt-6">
              <button
                type="button"
                :disabled="!passwordValid"
                class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                @click="click(1)"
              >
                use password
              </button>
              <button
                type="button"
                class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm"
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
import { CheckIcon } from "@heroicons/vue/outline";
import { ExclamationCircleIcon } from "@heroicons/vue/solid";
import { computed, ref } from "vue";
import * as promiseCallback from "../../lib/promiseCallback.js";

const open = ref(false);
const filePath = ref("");

const password = ref("");
const passwordValid = computed(() => password.value?.length > 0);
const badPassword = "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500";
const goodPassword = "border-blue-300 text-blue-900 placeholder-blue-300 focus:ring-blue-500 focus:border-blue-500";
const passwordClass = computed(() => (passwordValid.value ? goodPassword : badPassword));

defineExpose({
  show,
});
let signal; // promiseCallback

async function show(fp) {
  filePath.value = fp;
  open.value = true;
  password.value = null;
  signal = promiseCallback.create();
  return await signal;
}

function click(i) {
  signal.resolve({
    result: i,
    password: password.value,
  });
  open.value = false;
}
</script>
