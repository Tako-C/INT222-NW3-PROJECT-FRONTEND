<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "@/stores/store";
import modalNotification from "@/components/modals/modalNotification.vue";
import { login } from "@/libs/fetchs"
import {
  LockClosedIcon,
  UserIcon,
  EyeSlashIcon,
  EyeIcon
} from "@heroicons/vue/24/solid";

const router = useRouter();
const Store = useStore();
const usernameCount = ref("");
const passwordCount = ref("");
const showPassword = ref(false);
const up_check = ref(false);

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

function switchToTaskBoard() {
  router.push(`/board`);
}

function closeNotificationModal() {
  Store.errorLoginStatus = false;
  Store.errorToken = false;
  usernameCount.value = "";
  passwordCount.value = "";
}

async function usernameAndpasswordCheck() {
  const result = await login(usernameCount.value, passwordCount.value);
  if (result) {
    Store.errorLoginStatus = false;
    switchToTaskBoard();
  } else {
    Store.errorLoginStatus = true;
  }
}

watch([usernameCount, passwordCount], ([username, password]) => {
  if (username.length > 0 && password.length > 0) {
    up_check.value = true;
  } else {
    up_check.value = false;
  }
});
</script>

<template>
  <modalNotification
    :errorLoginStatus="Store.errorLoginStatus"
    @closemodal="closeNotificationModal"
    v-show="Store.errorLoginStatus"
    class="z-30"
  />
  <modalNotification
    :errorToken="Store.errorToken"
    @closemodal="closeNotificationModal"
    v-show="Store.errorToken"
    class="z-30"
  />

  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class="absolute inset-0 bg-black opacity-60">
      <img
        src="/images/bg-login.jpg"
        alt="Background"
        class="w-full h-full object-cover"
      />
    </div>
    <div class="relative bg-white w-full max-w-md mx-4 rounded-lg shadow-2xl p-8 space-y-8">
      <h1 class="text-4xl lg:text-5xl text-center font-bold text-gray-800">
        LOGIN
      </h1>
      <p class="text-center text-gray-600">
        Please enter your username and password
      </p>
      <div class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="username"
              v-model="usernameCount"
              maxlength="50"
              class="itbkk-username block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter Your Username"
            />
          </div>
          <p class="mt-1 text-xs text-gray-500" :class="{ 'text-red-500': usernameCount.length === 50 }">
            {{ usernameCount.length }} / 50
          </p>
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="passwordCount"
              maxlength="14"
              class="itbkk-password block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter Your Password"
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="focus:outline-none focus:text-gray-600 hover:text-gray-600"
              >
                <EyeIcon v-if="showPassword" class="h-5 w-5 text-gray-400" aria-hidden="true" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" aria-hidden="true" />
              </button>
            </div>
          </div>
          <p class="mt-1 text-xs text-gray-500" :class="{ 'text-red-500': passwordCount.length === 14 }">
            {{ passwordCount.length }} / 14
          </p>
        </div>
      </div>
      <div>
        <button
          @click="usernameAndpasswordCheck()"
          :disabled="!up_check"
          class="itbkk-button-signin w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sign In
        </button>
      </div>
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">OR</span>
        </div>
      </div>
      <div class="text-center">
        <button
          @click="switchToTaskBoard()"
          class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Guest User
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.button {
  background-color: #04aa6d;
  border: none;
  color: white;
  padding: 10px 50px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  transition-duration: 0.4s;
  cursor: pointer;
}

.buttonOK {
  background-color: white;
  color: black;
  border: 2px solid #04aa6d;
}

.buttonOK:hover {
  background-color: #04aa6d;
  color: white;
}

.buttonDisabled {
  background-color: #ccc;
  color: #666;
  border: 2px solid #ccc;
  cursor: not-allowed;
}
</style>
