<script setup>
import { useStore } from "@/stores/store.js";
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from "@heroicons/vue/24/solid";

const Store = useStore();
const router = useRouter();

// Set up reactive refs for error codes
let error401 = ref(Store.errorPage401);
let error403 = ref(Store.errorPage403);
let error404 = ref(Store.errorPage404);
let error409 = ref(Store.errorPage409);
let errortext404 = ref(Store.errortext404);
let ErrorCode = ref("");
let errorText = ref("");

if (error403.value === true) {
  ErrorCode.value = "403";
  errorText.value =
    "Access denied, you do not have permission to view this page.";
} else if (error404.value === true) {
  ErrorCode.value = "404";
  errorText.value = errortext404.value;
} else if (error401.value === true) {
  ErrorCode.value = "401";
  errorText.value = "Unauthorized. Please log in to access this page.";
} else {
  ErrorCode.value = "500";
  errorText.value = "There is a problem. Please try again later.";
}

function openBoards() {
  router.push({ name: "Board" });
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8"
  >
    <div
      class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl transform transition-all hover:scale-105"
    >
      <div>
        <ExclamationTriangleIcon
          class="mx-auto h-24 w-24 text-red-600 animate-pulse"
        />
        <h2
          class="mt-6 text-center text-5xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600"
        >
          Error {{ ErrorCode }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Oops! Something went wrong.
        </p>
      </div>
      <div class="mt-8 space-y-6">
        <div class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error Details</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>
                  {{ errorText }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <button
            @click="openBoards"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <ArrowLeftIcon
                class="h-5 w-5 text-orange-500 group-hover:text-orange-400"
                aria-hidden="true"
              />
            </span>
            Go Back Home
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
