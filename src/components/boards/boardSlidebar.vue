<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "@/stores/store.js";
import {
  clearCookies,
  PatchData,
  getAllBoard,
  getAllBoardByPublic,
  removeData,
} from "@/libs/fetchs.js";

import {
  checkUserInAuthToken,
  checkAuthToken,
  checkrequestNewToken,
} from "@/libs/authToken.js";

import Cookies from "js-cookie";
import BoardVisibilityConfirmation from "@/components/boards/boardVisibilityConfirmation.vue";
import modalNotification from "@/components/modals/modalNotification.vue";
import boardCollabLeave from "@/components/boards/modalConfirmedLeaveCollab.vue";
import modalAcceptInvite from "../invite/modalAcceptInvite.vue";

const Store = useStore();
const router = useRouter();
const route = useRoute();
// checkLoginUser
const loadpage = ref(route.params);
// let TokenLogin = ref(false)

const username = ref(Cookies.get("name"));
const isBoardPage = computed(() => route.path.startsWith("/board"));
const isStatusPage = computed(() => route.path.endsWith("/status"));
const isCollabDropdownOpen = ref(false);
const isPersonalDropdownOpen = ref(false);
const isPublicDropdownOpen = ref(false);
const openConfirmedChangeVisibility = ref(false);
let visibilityBoard = ref({});
let userLogin = Cookies.get("oid");
let CollabLeave = ref({});
const openConfirmedLeaveCollab = ref(false);
let AllListBoardTaskBar = ref([]);

function getImageUrl(index) {
  //return `/nw3/images/bg-theme-${(index %5) +1}.jpg`
  // return `/images/bg-theme-${(index % 5) + 1}.jpg`
  return `/images/${(index % 5) + 1}.png`;
}

let statusInvite = ref([]);
let PersonalBoard = ref([]);
let OtherBoard = ref([]);

async function fetchData() {
  let endpoint = "boards";
  let finalResult = [];
  let resultCollab = [];
  let resultPrivate = [];
  let resultPublic = [];
  let resultPublicRaw = {};
  //   let allBoard = [];
  //   let collabInvite = [];

  if (checkAuthToken()) {
    let resultPrivateRaw = await getAllBoard(endpoint);
    let resultPublicRaw = await getAllBoardByPublic(endpoint);

    resultCollab = resultPrivateRaw.collaborate;
    resultPrivate = resultPrivateRaw.boards;
    resultPublic = resultPublicRaw.boards;
    let collaborators = [];

    console.log(resultPrivate);
    console.log(resultCollab);
    console.log(resultPublicRaw);

    for (let i = 0; i < resultCollab.length; i++) {
      let resultColab = await getAllBoard(
        `boards/${resultCollab[i].boardsId}/collabs`
      );
      console.log(
        "Collaborators for Board ID",
        resultCollab[i].boardsId,
        ":",
        resultColab
      );

      // Add collaborators for the current board to the array
      collaborators.push({
        boardId: resultCollab[i].boardsId,
        boardName: resultColab.boardName,
        collaborators: resultColab.collaborators,
        owner: resultColab.owner.name,
      });
    }
    console.log(collaborators);

    for (let i = 0; i < collaborators.length; i++) {
      const collaboratorList = collaborators[i].collaborators;

      if (!Array.isArray(collaboratorList)) {
        console.warn(
          "Collaborators for board",
          collaborators[i].boardId,
          "is not an array!"
        );
        continue;
      }

      for (let j = 0; j < collaboratorList.length; j++) {
        const collaborator = collaboratorList[j];
        console.log("Checking Collaborator:", collaborator);

        if (collaborator.name === username.value) {
          console.log("User found:", collaborator);
          statusInvite.value.push({
            boardId: collaborators[i].boardId,
            boardName: collaborators[i].boardName,
            ...collaborator,
            boardOwner: collaborators[i].owner,
          });
        } else {
          console.log("Other user:", collaborator);
        }
      }
    }
    console.log("Final Status Invite:", statusInvite.value);

    resultPrivate.forEach((privateBoard) => {
      resultPublic = resultPublic.filter(
        (publicBoard) => publicBoard.owner.oid !== privateBoard.owner.oid
      );
      finalResult = [...resultPrivate, ...resultPublic];
      console.log(finalResult);
    });
  } else {
    resultPublicRaw = await getAllBoard(endpoint);
    finalResult = resultPublicRaw.boards;
    // console.log(finalResult)
  }

  Store.boards = finalResult.sort(
    (a, b) => new Date(a.createdOn) - new Date(b.createdOn)
  );
  // console.log(Store.boards);
  // Store.collaborate = resultCollab

  if (!resultCollab) {
    // console.log(Store.boards);
  } else {
    Store.collaborate = statusInvite.value.sort(
      (a, b) => new Date(a.createdOn) - new Date(b.createdOn)
    );

    console.log(Store.collaborate);
  }

  for (const board of Store.boards) {
    if (board.visibility === "public") {
      board.isCheck = true;
    } else {
      board.isCheck = false;
    }
  }
  console.log(Store.boards);
  Store.boards.sort((a, b) => new Date(a.createdOn) - new Date(b.createdOn));
  console.log(Store.boards);
  //   checkFirstBoard();
  // console.log(Store.boards);
  extractGroupBoard();
}

function openBoardTaskModal(boardId) {
  router.push({ name: "BoardTask", params: { id: boardId } });
}
function openStatuses(boardId) {
  router.push({ name: "Status", params: { id: boardId } });
}
function openBoardDetailModal(boardId) {
  router.push({ name: "BoardDetail", params: { id: boardId } });
}
function openCreateBoard(boardId) {
  // console.log(checkAuthToken())

  if (!checkAuthToken) {
    errorPermition();
  } else {
    router.push({ name: "createBoard", params: { id: boardId } });
  }
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

async function logOut() {
  clearCookies();
  router.push({ name: "login" });
}

function errorPermition() {
  router.push({ name: "notFound" });
}

async function updateVisibility() {
  checkrequestNewToken(router);

  if (visibilityBoard.value.isCheck == true) {
    visibilityBoard.value.visibility = "public";
  } else {
    visibilityBoard.value.visibility = "private";
  }

  let result = await PatchData(`boards/${visibilityBoard.value.boardId}`, {
    visibility: visibilityBoard.value.visibility,
  });
  // console.log(visibilityBoard.value)

  if (
    checkAuthToken() &&
    checkUserInAuthToken(visibilityBoard.value.owner.oid, userLogin)
  ) {
    if (result.status === 401) {
      router.push({ name: "login" });
      Store.errorToken = true;
    } else {
      changeVisibility();
    }
  } else {
    if (result.status === 403) {
      Store.errorPage403 = true;
      errorPermition();
    }
  }
}

async function changeVisibility() {
  let indexToUpdate = -1;

  // Find the board by ID
  let board = Store.boards.find(
    (b) => b.boardId === visibilityBoard.value.boardId
  );
  board.visibility = visibilityBoard.value.visibility;
  for (let i = 0; i < Store.boards.length; i++) {
    if (Store.boards[i].boardId === board.boardId) {
      indexToUpdate = i;
      // break;
    }
  }
  if (indexToUpdate !== -1) {
    Store.boards[indexToUpdate].visibility = board.visibility;
  }
  openConfirmedChangeVisibility.value = false;
}

function openConfirmModal(board) {
  if (checkAuthToken() && checkUserInAuthToken(board.owner.oid, userLogin)) {
    visibilityBoard.value = board;
    // console.log(visibilityBoard.value.isCheck);
    openConfirmedChangeVisibility.value = true;
    // openConfirmed.value = true
  } else {
    Store.errorPage403 = true;
    errorPermition();
  }
}

function openConfirmLeaveCollabModal(boardcollab) {
  console.log(boardcollab);
  const foundBoard = Store.collaborate.find(
    (board) => board.boardId === boardcollab.boardId
  );
  console.log(foundBoard);

  if (checkAuthToken()) {
    CollabLeave = boardcollab;
    openConfirmedLeaveCollab.value = true;
  } else {
    // errorPermition()
  }
}

function openInvitation(boardcollab) {
  console.log(boardcollab.boardId);
  router.push({ name: "collabInvite", params: { id: boardcollab.boardId } });
  //   const foundBoard = Store.collaborate.find(
  //     (board) => board.boardId === boardcollab.boardId
  //   );
  //   console.log(foundBoard);

  //   if (checkAuthToken()) {
  //     CollabLeave = boardcollab;
  //     openConfirmedLeaveCollab.value = true;
  //   } else {
  //     errorPermition()
  //   }
}

async function leaveConfirm() {
  console.log("leaveConfirm");

  let collabOid;
  let collabBoard = await getAllBoard(`boards/${CollabLeave.boardId}/collabs`);
  for (let i = 0; i < collabBoard.collaborators.length; i++) {
    console.log(userLogin);
    console.log(collabBoard.collaborators[i]);
    if (userLogin === collabBoard.collaborators[i].oid) {
      console.log(collabBoard.collaborators[i]);
      collabOid = collabBoard.collaborators[i].oid;
    }
  }

  let leaveCollab = await removeData(
    `boards/${CollabLeave.boardId}/collabs/${collabOid}`
  );

  // console.log(leaveCollab)
  fetchData();
  closeNotificationModal();
}

function closeNotificationModal() {
  openConfirmedChangeVisibility.value = false;
  openConfirmedLeaveCollab.value = false;
  Store.errorPrivate404 = false;
  Store.errorPrivate404Content = "";

  let board = Store.boards.find(
    (b) => b.boardId === visibilityBoard.value.boardId
  );
  if (board) {
    if (visibilityBoard.value.visibility === "public") {
      board.isCheck = true;
    } else {
      board.isCheck = false;
    }
  } else {
  }

  //   checkFirstBoard();
  // fetchData()
}

// function checkOwner(userInboard) {
//   return checkUserInAuthToken(userInboard,userLogin)

// }

function checkVariable() {
  if (Store.errorPrivate404 == true) {
    return true;
  }
  return false;
}
function extractGroupBoard() {
  PersonalBoard.value = Store.boards.filter(
    (board) => board.owner.oid === userLogin
  );
  OtherBoard.value = Store.boards.filter(
    (board) => board.owner.oid != userLogin
  );
  console.log(PersonalBoard.value);
  console.log(OtherBoard.value);
}

onMounted(() => {
  checkrequestNewToken(router);
  fetchData();
  // checkFirstBoard()
});
watch(
  loadpage,
  async (newloadpage) => {
    if (newloadpage) {
      // checkAuthToken()
    }
  },
  { immediate: true }
);
</script>

<template>
  <BoardVisibilityConfirmation
    :changevisibility="visibilityBoard"
    v-show="openConfirmedChangeVisibility"
    @closemodal="closeNotificationModal()"
    @confirmed="updateVisibility()"
    class="z-40"
  />
  <boardCollabLeave
    v-show="openConfirmedLeaveCollab"
    :leaveCollab="CollabLeave"
    @closemodal="closeNotificationModal()"
    @confirmed="leaveConfirm()"
    class="z-40"
  />
  <modalNotification
    @closemodal="closeNotificationModal()"
    v-show="checkVariable()"
    class="z-30"
  />
  <!-- <modalAcceptInvite
        :changevisibility="visibilityBoard"
        v-show="openConfirmedChangeVisibility"
        @closemodal="closeNotificationModal()"
        @confirmed="updateVisibility()"
        class="z-40"
    /> -->

  <div class="class name : itbkk-modal-task w-screen bg-white h-screen flex">
    <header
      name="header"
      class="top-0 h-full w-[25%] border-orange-400 bg-white shadow-lg flex flex-col items-center  px-6 text-white rounded-r-3xl"
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
              v-for="(board, index) in Store.boards"
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
              v-for="(board, index) in Store.boards"
              :key="index"
              class="py-2 text-slate-400 hover:text-black cursor-pointer"
              @click="openBoardTaskModal(board.boardId)"
            >
              {{ board.board_name }}
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
              v-for="(board, index) in Store.boards"
              :key="index"
              class="py-2 text-slate-400 hover:text-black cursor-pointer"
              @click="openBoardTaskModal(board.boardId)"
            >
              {{ board.board_name }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Login button -->
      <!-- <div
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
      </div> -->
    </header>

    <!-- Table สำหรับแสดงข้อมูลของ board -->
    <main class="w-full h-auto overflow-y-auto flex flex-col"></main>
    <router-view />
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
