<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ArrowRightCircleIcon,
  ArrowLeftCircleIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  ChevronDownIcon,
  UserIcon,
  UserGroupIcon,
  SquaresPlusIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/vue/24/solid";
import { checkAuthToken } from "@/libs/authToken.js";
import { clearCookies } from "@/libs/fetchs.js";
import Cookies from "js-cookie";

const props = defineProps({
  boardsPersonal: {
    type: Array,
  },
  boardsCollab: {
    type: Array,
  },
  boardsPublic: {
    type: Array,
  },
});

const isLoggedIn = computed(() => checkAuthToken());
const router = useRouter();
const route = useRoute();
const isBoardPage = computed(() => route.path.startsWith("/board"));
const isCollabPage = computed(() => route.path.startsWith("/collab"));
const username = ref(Cookies.get("name"));

const isCollabDropdownOpen = ref(false);
const isPersonalDropdownOpen = ref(false);
const isPublicDropdownOpen = ref(false);

function openBoards() {
  router.push({ name: "Board" });
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

const isExtend = ref(true);
function handleExtend(value) {
  isExtend.value = value;
}
async function logOut() {
  clearCookies();
  router.push({ name: "login" });
}
function handleAuthAction() {
  if (!isLoggedIn.value) {
    router.push({ name: "login" });
  }
}
</script>

<template>
  <div class="h-screen flex">
    <div
      class="relative flex flex-col transition-all duration-300 ease-in-out bg-white shadow-lg"
      :class="isExtend ? 'w-64' : 'w-16'"
      @mouseenter="() => handleExtend(true)"
      @mouseleave="() => handleExtend(false)"
    >
      <!-- Logo and Title -->
      <div class="flex items-center p-4 bg-orange-100">
        <SquaresPlusIcon class="h-8 w-8 text-orange-500 flex-shrink-0" />
        <h3
          class="ml-2 text-xl font-bold text-orange-800 transition-opacity duration-300"
          :class="{ 'opacity-0': !isExtend }"
        >
          Kradan Kanban
        </h3>
      </div>

      <!-- Board Sections -->
      <div class="flex-grow overflow-y-auto">
        <div class="flex flex-col space-y-2 p-4">
          <!-- PersonalBoard Section -->
          <div
            class="w-full p-3 flex items-center justify-between cursor-pointer rounded-md bg-orange-400"
            @click="togglePersonalDropdown()"
          >
            <div class="flex items-center">
              <ClipboardDocumentIcon class="h-5 w-5 text-white" />
              <p class="pl-3 text-white" :class="{ 'opacity-0': !isExtend }">Personal Board</p>
            </div>
            <ChevronDownIcon class="h-5 w-5 text-white" :class="{ 'opacity-0': !isExtend }" />
          </div>

          <!-- Dropdown for PersonalBoard -->
          <div
            v-show="isPersonalDropdownOpen && isExtend"
            class="w-full pl-4 border border-gray-300 bg-white rounded-md shadow-lg max-h-32 overflow-y-auto"
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
            class="w-full p-3 flex items-center justify-between cursor-pointer rounded-md bg-orange-400"
            @click="toggleCollabDropdown()"
          >
            <div class="flex items-center">
              <UserGroupIcon class="h-5 w-5 text-white" />
              <p class="pl-3 text-white" :class="{ 'opacity-0': !isExtend }">Collaborator Board</p>
            </div>
            <ChevronDownIcon class="h-5 w-5 text-white" :class="{ 'opacity-0': !isExtend }" />
          </div>

          <!-- Dropdown for CollabBoards -->
          <div
            v-show="isCollabDropdownOpen && isExtend"
            class="w-full pl-4 border border-gray-300 bg-white rounded-md shadow-lg max-h-32 overflow-y-auto"
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
            class="w-full p-3 flex items-center justify-between cursor-pointer rounded-md bg-orange-400"
            @click="togglePublicDropdown()"
          >
            <div class="flex items-center">
              <EyeIcon class="h-5 w-5 text-white" />
              <p class="pl-3 text-white" :class="{ 'opacity-0': !isExtend }">Public Board</p>
            </div>
            <ChevronDownIcon class="h-5 w-5 text-white" :class="{ 'opacity-0': !isExtend }" />
          </div>

          <!-- Dropdown for PublicBoards -->
          <div
            v-show="isPublicDropdownOpen && isExtend"
            class="w-full pl-4 border border-gray-300 bg-white rounded-md shadow-lg max-h-32 overflow-y-auto"
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
      </div>

      <!-- Login/Logout Button -->
      <div class="p-4 mt-auto">
        <button
          @click="isLoggedIn ? logOut() : handleAuthAction()"
          class="btn w-full text-white transition-all ease-in-out relative overflow-hidden group"
          :class="[
            isExtend ? 'btn-info hover:bg-primary-focus' : 'btn-info hover:bg-primary/20',
            { 'justify-start': isExtend, 'justify-center': !isExtend }
          ]"
        >
          <div
            class="flex items-center justify-center w-full h-full absolute top-0 left-0 transition-all duration-300 ease-in-out"
            :class="isLoggedIn && isExtend ? 'group-hover:-top-full' : ''"
          >
            <UserIcon class="h-5 w-5" :class="{ 'mr-2': isExtend }" />
            <span v-if="isExtend" class="font-medium">
              {{ isLoggedIn ? username : "Login" }}
            </span>
          </div>
          <div
            v-if="isLoggedIn && isExtend"
            class="flex items-center justify-center w-full h-full absolute top-full left-0 transition-all duration-300 ease-in-out group-hover:top-0"
          >
            <ArrowLeftOnRectangleIcon class="h-5 w-5 mr-2" />
            <span class="font-medium">Logout</span>
          </div>
        </button>
      </div>

      <!-- Extend/Collapse Toggle -->
      <button 
        @click="handleExtend(!isExtend)"
        class="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-orange-200 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-transform duration-200 hover:scale-110"
      >
        <component :is="isExtend ? ArrowLeftCircleIcon : ArrowRightCircleIcon" class="h-10 w-10 text-orange-600" />
      </button>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto">
      <router-view />
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
