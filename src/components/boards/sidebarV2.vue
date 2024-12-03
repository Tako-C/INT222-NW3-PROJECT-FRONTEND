<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  checkUserInAuthToken,
  checkAuthToken,
  checkrequestNewToken,
} from "@/libs/authToken.js";
import {
  clearCookies,
  PatchData,
  getAllBoard,
  getAllBoardByPublic,
  removeData,
} from "@/libs/fetchs.js";
import Cookies from "js-cookie";

const props = defineProps({
  boardsPersonal:{
    type: Array},
  boardsCollab :{
    type: Array},
  boardsPublic : {
    type: Array
  }    
}
)

const router = useRouter();
const route = useRoute();
const isBoardPage = computed(() => route.path.startsWith("/board"));
const username = ref(Cookies.get("name"));

const isCollabDropdownOpen = ref(false);
const isPersonalDropdownOpen = ref(false);
const isPublicDropdownOpen = ref(false);


function openBoards() {
    router.push({ name: "Board" })
}
function toggleCollabDropdown() {
  isCollabDropdownOpen.value = !isCollabDropdownOpen.value;
}

function togglePersonalDropdown() {
  isPersonalDropdownOpen.value = !isPersonalDropdownOpen.value;
}

function togglePublicDropdown() {
  isPublicDropdownOpen.value = !isPublicDropdownOpen.value;
}
function openBoardTaskModal(boardId) {   
  router.push({ name: "BoardTask", params: { id: boardId } });
  
}

async function logOut() {
  clearCookies();
  router.push({ name: "login" });
}
</script>

<template>
<div>
  <div class="class name : itbkk-modal-task  flex">
    <header
      name="header"
      class="top-0 h-screen w-[100%] border-orange-400 bg-white shadow-lg flex flex-col items-center  px-6 text-white"
    >
      <div class="flex">
        <div
          class="flex flex-col items-start justify-start first-letter:mx-auto space-x-4 pt-5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#FFA500"
            class="size-6"
          >
            <path
              d="M6 3a3 3 0 0 0-3 3v2.25a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6ZM15.75 3a3 3 0 0 0-3 3v2.25a3 3 0 0 0 3 3H18a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3h-2.25ZM6 12.75a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3v-2.25a3 3 0 0 0-3-3H6ZM17.625 13.5a.75.75 0 0 0-1.5 0v2.625H13.5a.75.75 0 0 0 0 1.5h2.625v2.625a.75.75 0 0 0 1.5 0v-2.625h2.625a.75.75 0 0 0 0-1.5h-2.625V13.5Z"
            />
          </svg>
        </div>
        <div class="p-5">
          <h3
            class="text-xl font-bold font-serif titleShadow text-center text-black"
          >
            Kradan Kanban <br />Boards
          </h3>
        </div>
      </div>

      <div class="flex flex-col mt-10">
        <!-- PersonalBoard Section -->
        <div
          class="w-60 p-5 flex items-center justify-between cursor-pointer"
          :class="['rounded-md', { 'bg-orange-400': isBoardPage }]"
          @click="togglePersonalDropdown()"
        >
          <div class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              :stroke="isBoardPage ? 'white' : 'gray'"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
              />
            </svg>
            <p
              class="pl-3"
              :class="{
                'text-white': isBoardPage,
                'text-slate-400': !isBoardPage,
              }"
            >
              Personal Board
            </p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            :stroke="isBoardPage ? 'white' : 'gray'"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              :d="isPersonalDropdownOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'"
            />
          </svg>
        </div>

        <!-- Dropdown for PersonalBoard -->
        <div
          v-show="isPersonalDropdownOpen"
          class="w-60 mt-2 pl-4 border border-gray-300 bg-white rounded-md shadow-lg max-h-32 overflow-y-auto"
        >
          <ul>
            <li
              class="py-2 text-slate-400 hover:text-black cursor-pointer"
              @click="openBoards"
            >
              All
            </li>
            <li
              v-for="(board, index) in boardsPersonal"
              :key="index"
              class="py-2 text-slate-400 hover:text-black cursor-pointer"
              @click="openBoardTaskModal(board.boardId)"
            >
              {{ board.board_name }}
            </li>
          </ul>
        </div>

        <!-- CollabBoard Section -->
        <div
          class="w-60 p-5 flex items-center justify-between cursor-pointer mt-2"
          :class="['rounded-md', { 'bg-orange-400': isBoardPage }]"
          @click="toggleCollabDropdown()"
        >
          <div class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              :stroke="isBoardPage ? 'white' : 'gray'"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
              />
            </svg>
            <p
              class="pl-3"
              :class="{
                'text-white': isBoardPage,
                'text-slate-400': !isBoardPage,
              }"
            >
              Collaborator Board
            </p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            :stroke="isBoardPage ? 'white' : 'gray'"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              :d="isPersonalDropdownOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'"
            />
          </svg>
        </div>

        <!-- Dropdown for CollabBoards -->
        <div
          v-show="isCollabDropdownOpen"
          class="w-60 mt-2 pl-4 border border-gray-300 bg-white rounded-md shadow-lg max-h-32 overflow-y-auto"
        >
          <ul>
            <li
              class="py-2 text-slate-400 hover:text-black cursor-pointer"
              @click="openBoards"
            >
              All
            </li>
            <li
              v-for="(board, index) in boardsCollab"
              :key="index"
              class="py-2 text-slate-400 hover:text-black cursor-pointer"
              @click="openBoardTaskModal(board.boardId)"
            >
              {{ board.board_name }}({{ board.owner.name }})
            </li>
          </ul>
        </div>

        <!-- PublicBoard Section -->
        <div
          class="w-60 p-5 flex items-center justify-between cursor-pointer mt-2"
          :class="['rounded-md', { 'bg-orange-400': isBoardPage }]"
          @click="togglePublicDropdown()"
        >
          <div class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              :stroke="isBoardPage ? 'white' : 'gray'"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
              />
            </svg>
            <p
              class="pl-3"
              :class="{
                'text-white': isBoardPage,
                'text-slate-400': !isBoardPage,
              }"
            >
              Public Board
            </p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            :stroke="isBoardPage ? 'white' : 'gray'"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              :d="isPersonalDropdownOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'"
            />
          </svg>
        </div>

        <!-- Dropdown for PublicBoards -->
        <div
          v-show="isPublicDropdownOpen"
          class="w-60 mt-2 pl-4 border border-gray-300 bg-white rounded-md shadow-lg max-h-32 overflow-y-auto"
        >
          <ul>
            <li
              class="py-2 text-slate-400 hover:text-black cursor-pointer"
              @click="openBoards"
            >
              All
            </li>
            <li
              v-for="(board, index) in boardsPublic"
              :key="index"
              class="py-2 text-slate-400 hover:text-black cursor-pointer"
              @click="openBoardTaskModal(board.boardId)"
            >
              {{ board.board_name }}({{ board.owner.name }})
            </li>
          </ul>
        </div>
      </div>

      <!-- Login button -->
      <div
        class="itbkk-sign-out bg-orange-400 p-2 flex my-14 w-3/4 cursor-pointer"
        :class="{
          'justify-between sign-out': checkAuthToken(),
          'justify-center items-center': !checkAuthToken(),
        }"
        @click="logOut()"
      >
        <div class="flex items-center space-x-2 p-1" v-show="checkAuthToken()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </div>
        <p class="itbkk-fullname text-sm font-medium p-2">
          {{ checkAuthToken() ? username : "Login" }}
        </p>
        <div
          class="flex items-center justify-center right-0"
          v-show="checkAuthToken()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
            />
          </svg>
        </div>
      </div>
    </header>
        <!-- Main Content Section -->
      <div class="main-content">
      <router-view />
    </div>
  </div>
</div>

</template>

<style scoped>
.sign-out {
  position: relative;
  transition: all 0.2s ease;
}

/* Hover effect */
.sign-out:hover .itbkk-fullname,
.sign-out:hover svg {
  opacity: 0;
}

/* Display the Logout text */
.sign-out::after {
  content: "Logout";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 1rem;
  font-weight: bold;
  opacity: 0;
}

/* Show the Logout text on hover */
.sign-out:hover::after {
  opacity: 1;
}
</style>
