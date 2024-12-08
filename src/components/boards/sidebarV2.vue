<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowRightCircleIcon,ArrowLeftCircleIcon, ClipboardDocumentIcon, EyeIcon, ChevronDownIcon, UserIcon, UserGroupIcon, SquaresPlusIcon, ArrowLeftStartOnRectangleIcon } from '@heroicons/vue/24/solid'
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

const isExtend = ref(true)
function handleExtend(value) {
  isExtend.value = value
}
async function logOut() {
  clearCookies();
  router.push({ name: "login" });
}
</script>

<template>
<div>
  <div class="class name : itbkk-modal-task  flex" @mouseenter="() => handleExtend(true)" @mouseleave="() => handleExtend(false)" >
    <div v-if="!isExtend" class="bg-[#FFFBDA] h-screen flex items-center rounded-r-2xl mr-2">
      <ArrowRightCircleIcon class="size-10 text-[#FFBB70] m-2" />
    </div>
    <div
      v-if="isExtend"
      name="header"
      class="top-0 h-screen w-[100%] border-orange-400 bg-white shadow-lg flex items-center justify-start  pl-6 text-white"
    >
    <div class="flex flex-col items-center ">
      <div class="flex">
        
        <div
          class="flex flex-col items-start justify-start first-letter:mx-auto space-x-4 pt-5"
        >
        <SquaresPlusIcon class="size-7 text-orange-400"/>
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
            <ClipboardDocumentIcon class="size-7"/>
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
          <ChevronDownIcon class="size-5"/>
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
            <UserGroupIcon class="size-7"/>
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
          <ChevronDownIcon class="size-5"/>
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
            <EyeIcon class="size-7"/>
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
          <ChevronDownIcon class="size-5"/>
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
          <UserIcon class="size-5"/>
        </div>
        <p class="itbkk-fullname text-sm font-medium p-2">
          {{ checkAuthToken() ? username : "Login" }}
        </p>
        <div
          class="flex items-center justify-center right-0"
          v-show="checkAuthToken()"
        >
        <ArrowLeftStartOnRectangleIcon class="size-5"/>
        </div>
      </div>
    </div>
    <div class="bg-[#FFFBDA] w-10 h-screen flex items-center rounded-r-2xl ml-4" @click="handleExtend(false)">
      <ArrowLeftCircleIcon class="size-10 text-[#FFBB70] m-2" />
    </div>
  </div>
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
