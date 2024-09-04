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
    console.log("Login successful :", result);

    // Decode the JWT
    const decodedToken = jwtDecode(result);
    const now = Math.floor(Date.now() / 1000);
    const exp = decodedToken.exp;

    const cookieExpiresInSeconds = exp - now;
    const cookieExpiresInDays = cookieExpiresInSeconds / (60 * 60 * 24);


    const token_raw = JSON.parse(result)
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
    <div class="bg-black w-full h-full absolute opacity-20"></div>
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
              <svg
                v-if="showPassword"
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12h.01M19.5 12a7.5 7.5 0 00-15 0M9 12h.01m-4.2 0a11.937 11.937 0 012.701-6.601M12 18.5a11.937 11.937 0 006.601-2.701M15 12a3 3 0 00-6 0"
                />
              </svg>
              <svg
                v-else
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825c-1.95.9-4.125.9-6.075 0C4.2 17.475 2 14.625 2 12s2.2-5.475 5.8-6.825C10.875 4.275 13.125 4.275 16.2 5.175m3.75 3.825C20.325 8.775 22 10.5 22 12s-1.675 3.225-4.05 3.975m-5.7 2.1c-.975-.375-1.95-1.125-2.925-2.025m0-6.9c.975.9 1.95 1.65 2.925 2.025m-2.925-2.025c-.975.9-1.95 1.65-2.925 2.025M10.875 5.175a11.937 11.937 0 013.75 6.825c.375 1.95.375 3.975 0 5.925z"
                />
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
