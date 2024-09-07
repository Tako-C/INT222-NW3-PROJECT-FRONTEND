<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "@/stores/store";
import modalNotification from "@/components/modals/modalNotification.vue";
import { login } from "@/libs/fetchs";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";


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
  usernameCount.value = "";
  passwordCount.value = "";
}

async function usernameAndpasswordCheck() {
  const result = await login(usernameCount.value, passwordCount.value);
  if (result) {
    // Decode the JWT
    const token_raw = JSON.parse(result);  // Parse result into JSON before using
    const decodedToken = jwtDecode(token_raw.access_token);  // Decode access_token
    const now = Math.floor(Date.now() / 1000);
    const exp = decodedToken.exp;

    const cookieExpiresInSeconds = exp - now;
    const cookieExpiresInDays = cookieExpiresInSeconds / (60 * 60 * 24);

    Cookies.set("token", token_raw.access_token, { expires: cookieExpiresInDays });
    // Store the decoded claims in cookies
    Cookies.set("name", decodedToken.name, { expires: cookieExpiresInDays });
    Cookies.set("oid", decodedToken.oid, { expires: cookieExpiresInDays });
    Cookies.set("iss", decodedToken.iss, { expires: cookieExpiresInDays });
    Cookies.set("email", decodedToken.email, {expires: cookieExpiresInDays,});
    Cookies.set("role", decodedToken.role, { expires: cookieExpiresInDays });
    Cookies.set("iat", decodedToken.iat, { expires: cookieExpiresInDays });
    Cookies.set("exp", decodedToken.exp, { expires: cookieExpiresInDays });

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
  
  <div class="flex justify-center items-center min-h-screen">
    <div class="bg-black w-full h-full absolute opacity-60">
      <img src="/images/bg-login.jpg" alt="bg-board" class="w-full h-full object-cover rounded-2xl ">
    </div>
    <div class="fixed bg-white w-96 h-auto rounded-lg shadow-2xl p-8">
      <h1 class="text-5xl text-center font-bold text-gray-800 mb-4">LOGIN</h1>
      <p class="text-center text-gray-600 mb-8">
        Please enter your username and password
      </p>
      <div class="space-y-4">
        <div>
          <label class="block text-gray-700 font-semibold">Username:</label>
          <input
            v-model="usernameCount"
            maxlength="50"
            class="itbkk-username w-full p-2 mt-2 border rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Enter Your Username"
          />
          <span :class="{ 'text-red-500': usernameCount.length === 50 }">
            {{ usernameCount.length }} / 50
          </span>
        </div>
        <div>
          <label class="block text-gray-700 font-semibold">Password:</label>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="passwordCount"
              maxlength="14"
              class="itbkk-password w-full p-2 mt-2 border rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter Your Password"
            />
            <button
              type="button"
              @click="togglePasswordVisibility"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
            >
              <svg v-show="showPassword" 
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 mt-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>

              <svg v-show="!showPassword"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 mt-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>

            </button>
          </div>
          <span :class="{ 'text-red-500': passwordCount.length === 14 }">
            {{ passwordCount.length }} / 14
          </span>
        </div>
      </div>
      <div class="text-center mt-8">
        <button
          @click="usernameAndpasswordCheck()"
          :disabled="!up_check"
          class="itbkk-button-signin button"
          :class="[
            {
              buttonDisabled: !up_check,
              buttonOK: up_check,
              disabled: !up_check,
            },
          ]"
        >
          Sign In
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
