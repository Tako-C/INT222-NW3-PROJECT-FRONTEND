<script setup>
import { useStore } from "@/stores/store.js"
import { ref } from "vue"
import { useRouter } from "vue-router"

const Store = useStore()
const router = useRouter()

// Set up reactive refs for error codes
let error401 = ref(Store.errorPage401)
let error403 = ref(Store.errorPage403)
let error404 = ref(Store.errorPage404)
let error409 = ref(Store.errorPage409)
let errortext404 = ref(Store.errortext404)
let ErrorCode = ref('');
let errorText = ''

if (error403.value === true) {
    ErrorCode.value = "403"
    errorText = 'Access denied, you do not have permission to view this page.'
} else if (error404.value === true) {
    ErrorCode.value = "404"
    // errorText = 'Access denied, you do not have permission to view this page.'
    errorText = errortext404
} else if (error401.value === true) {
    ErrorCode.value = "401"
} else{
  errorText = 'There is a problem. Please try again later.'
}

function openBoards() {
    router.push({ name: "Board" })
}
</script>


<template>
    <div class="w-screen h-screen bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 flex flex-col justify-center items-center">
      <!-- Error Card -->
      <div class="card w-96 bg-white shadow-xl rounded-lg">
        <div class="card-body items-center text-center">
          <!-- SVG Icon -->
          <svg class="w-16 h-16 text-red-600 mb-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636a9 9 0 11-12.728 0M12 9v3m0 4h.01"></path>
          </svg>
          <!-- Error Code -->
          <p class="text-6xl font-extrabold text-red-700">{{ ErrorCode }}</p>
          <p class="text-red-600 font-semibold mt-2 text-lg">ERROR !!!</p>
          <p class="text-gray-600 mt-2">{{ errorText }}</p>
          <!-- Retry Button -->
          <div class="card-actions mt-6">
            <button class="btn btn-outline btn-primary hover:bg-primary hover:text-white" @click="openBoards()">
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
<style scoped></style>
