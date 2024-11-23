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
const isStatusDropdownOpen = ref(false);
const isTaskDropdownOpen = ref(false);
const openConfirmedChangeVisibility = ref(false);
let visibilityBoard = ref({});
let userLogin = Cookies.get("oid");
let resultPrivatTest = ref({});
let CollabLeave = ref({});
const openConfirmedLeaveCollab = ref(false);

function getImageUrl(index) {
  //return `/nw3/images/bg-theme-${(index %5) +1}.jpg`
  // return `/images/bg-theme-${(index % 5) + 1}.jpg`
  return `/images/${(index % 5) + 1}.png`;
}

function checkFirstBoard() {
  // let boardFirst = []
  // for (const board of resultPrivatTest.value) {
  //     if (board.owner.oid == userLogin) {
  //         console.log(board.owner.oid ,userLogin)
  //         console.log(board)
  //         boardFirst.push({...board})
  //     } else{
  //     }
  // }
  // console.log(boardFirst.length);
  // if (boardFirst.length === 1) {
  //     console.log(boardFirst[0].boardId)
  //     openBoardTaskModal(boardFirst[0].boardId)
  // }
  // else{
  //     console.log("Not have board")
  // }
}

let statusInvite = ref([])
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
    // let resultColab = await getAllBoard(`boards/${resultCollab.boardId}/collabs`)

    // console.log(resultPrivateRaw)

    resultCollab = resultPrivateRaw.collaborate;
    resultPrivate = resultPrivateRaw.boards;
    resultPublic = resultPublicRaw.boards;

    console.log(resultPrivate);
    console.log(resultCollab);
    console.log(resultPublicRaw);

    for (let i = 0; i < resultCollab.length; i++) {
    // เรียกข้อมูล collaborators
    let resultColab = await getAllBoard(`boards/${resultCollab[i].boardId}/collabs`);
    console.log(resultColab.collaborators);

    // ดึงค่า collaborators จาก object
    const collaborators = Object.values(resultColab.collaborators);

    // Loop ผ่าน collaborators
    for (let j = 0; j < collaborators.length; j++) {
        const collaborator = collaborators[j];

        // ตรวจสอบเงื่อนไข เช่น oid
        if (collaborator.oid === userLogin) {
            console.log("User found:", collaborator);
            statusInvite.value.push({
                boardId: resultCollab[i].boardId,
                ...collaborator, // เพิ่มข้อมูล collaborator
            });
        } else {
            // console.log("Other user:", collaborator);
        }
    }

    // แสดงผลจำนวน collaborators
    // console.log("Total collaborators:", collaborators.length);
    console.log(statusInvite.value)
}

resultCollab.forEach(collab => {
    // ใช้ .find() เพื่อค้นหา boardId ที่ตรงใน statusInvite
    const matchingStatus = statusInvite.value.find(invite => invite.boardId === collab.boardId);

    // ถ้าพบ matchingStatus ให้เพิ่ม key status
    collab.status = matchingStatus ? matchingStatus.status : "not-found";
});

console.log("Updated resultCollab:", resultCollab);

    
    // for (const board of resultCollab) {
    //   let resultColab = await getAllBoard(`boards/${board.boardId}/collabs`);

    //   // รวม collaborators ทั้งหมดในอาร์เรย์แบนราบ
    //   allBoard = resultColab.collaborators;

    //   // ค้นหา collaborator ที่มี oid ตรงกับ userLogin
    //   const matchingCollab = allBoard.find(
    //     (collab) => collab.oid === userLogin
    //   );
    //   if (matchingCollab) {
    //     collabInvite.push(matchingCollab);
    //   }

    //   console.log(collabInvite);
    // }

    // จำเป็น
    resultPrivatTest.value = resultPrivate;
    //

    resultPrivate.forEach((privateBoard) => {
      resultPublic = resultPublic.filter(
        (publicBoard) => publicBoard.owner.oid !== privateBoard.owner.oid
      );
      finalResult = [...resultPrivate, ...resultPublic];
      // console.log(finalResult)
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
    Store.collaborate = resultCollab.sort(
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
  checkFirstBoard();
  // console.log(Store.boards);
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
function toggleStatusDropdown() {
  isStatusDropdownOpen.value = !isStatusDropdownOpen.value;
}
function toggleTaskDropdown() {
  isTaskDropdownOpen.value = !isTaskDropdownOpen.value;
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

  checkFirstBoard();
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
      class="top-0 h-full w-[25%] border-orange-400 bg-white shadow-lg flex flex-col items-center justify-between px-6 text-white rounded-r-3xl"
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

      <div class="flex flex-col">
        <!-- Board Section -->
        <div
          class="w-60 p-5 flex items-center justify-between cursor-pointer"
          :class="['rounded-md', { 'bg-orange-400': isBoardPage }]"
          @click="toggleTaskDropdown()"
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
              Board
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
              :d="isTaskDropdownOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'"
            />
          </svg>
        </div>

        <!-- Dropdown for boards -->
        <div
          v-show="isTaskDropdownOpen"
          class="w-60 mt-2 pl-4 border border-gray-300 bg-white rounded-md shadow-lg max-h-20 overflow-y-auto"
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

        <!-- Statuses Section -->
        <div
          class="w-60 p-5 flex items-center justify-between cursor-pointer"
          :class="['rounded-md', { 'bg-orange-400': isStatusPage }]"
          @click="toggleStatusDropdown()"
        >
          <div class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              :stroke="isStatusPage ? 'white' : 'gray'"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z"
              />
            </svg>
            <p
              class="pl-3"
              :class="{
                'text-white': isStatusPage,
                'text-slate-400': !isStatusPage,
              }"
            >
              Statuses
            </p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            :stroke="isStatusPage ? 'white' : 'gray'"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              :d="isStatusDropdownOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'"
            />
          </svg>
        </div>

        <!-- Dropdown for statuses -->
        <div
          v-show="isStatusDropdownOpen"
          class="w-60 mt-2 pl-4 border border-gray-300 bg-white rounded-md shadow-lg max-h-20 overflow-y-auto"
        >
          <ul>
            <li
              v-for="(board, index) in Store.boards"
              :key="index"
              class="py-2 text-slate-400 hover:text-black cursor-pointer"
              @click="openStatuses(board.boardId)"
            >
              {{ board.board_name }}
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

    <!-- Table สำหรับแสดงข้อมูลของ board -->
    <main class="w-full h-screen overflow-y-auto flex flex-col">
      <div class="flex justify-between text-white">
        <h1 class="text-3xl font-bold text-black ml-10 mt-10">
          {{ checkAuthToken() ? `${username} Personal Board` : "Public Board" }}
        </h1>
        <button
          class="itbkk-button-create right-0 mt-3 flex bg-orange-400 items-center justify-center h-14 w-40 rounded-xl tooltip tooltip-left"
          :data-tip="
            checkAuthToken()
              ? 'Create your board.'
              : 'You do not have permission to use this feature.'
          "
          :disabled="!checkAuthToken()"
          @click="openCreateBoard()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <p class="pl-2">Create Board</p>
          <!-- {{ visibilityBoard.value }} -->
        </button>
      </div>

      <div class="flex-grow p-8 overflow-y-auto">
        <!-- Personal boards -->
        <div class="overflow-x-auto flex-grow p-4 border mb-8">
          <div class="flex gap-4 flex-nowwrap">
            <!-- เพิ่ม flex-wrap และ justify-center -->
            <div
              v-for="(board, index) in Store.boards"
              :key="index"
              class="bg-white rounded-lg shadow p-6 min-w-[250px] max-w-[250px] flex flex-col"
            >
              <div class="flex justify-between">
                <div
                  class="relative w-1/4 h-[60%] bg-orange-300 rounded-xl p-1"
                >
                  No: {{ index + 1 }}
                </div>
                <div class="">
                  <div class="itbkk-board-visibility">
                    <input
                      type="checkbox"
                      class="toggle tooltip tooltip-right"
                      :class="{
                        'cursor-not-allowed ':
                          !checkAuthToken() ||
                          !checkUserInAuthToken(board.owner?.oid, userLogin),
                      }"
                      :data-tip="
                        checkAuthToken() &&
                        checkUserInAuthToken(board.owner?.oid, userLogin)
                          ? 'change Visibility Board'
                          : 'You do not have permission to use this feature.'
                      "
                      v-model="board.isCheck"
                      @change="openConfirmModal(board)"
                    />
                  </div>
                  <div class="">
                    <p>{{ board.visibility }}</p>
                  </div>
                </div>
              </div>
              {{ board.board }}

              <div class="mb-4">
                <img
                  :src="getImageUrl(index)"
                  alt="bg-board"
                  class="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <h3 class="text-lg font-bold mb-2">
                {{ board.board_name }}
              </h3>
              <p>Owner : {{ board.owner?.name }}</p>
              <div class="flex justify-around mt-4">
                <button
                  class="bg-green-500 border text-xs border-slate-400 p-2 rounded-md text-white"
                  @click="openBoardDetailModal(board.boardId)"
                >
                  Board Detail
                </button>
                <button
                  class="bg-green-500 border text-xs border-slate-400 p-2 rounded-md text-white"
                  @click="openBoardTaskModal(board.boardId)"
                >
                  Board Tasks
                </button>
              </div>
              <!-- {{
                                checkUserInAuthToken(board.owner.oid, userLogin)
                            }} -->
            </div>
          </div>
        </div>

        <!-- collab row -->
        <h1
          v-show="checkAuthToken()"
          class="itbkk-collab-board text-3xl font-bold text-black ml-2 mt-10 mb-6"
        >
          Collab Boards
        </h1>
        <div
          v-show="checkAuthToken() && Store.collaborate.length > 0"
          class="overflow-x-auto flex-grow p-4 border"
        >
          <div class="flex gap-4 flex-nowwrap">
            <!-- เพิ่ม flex-wrap และ justify-center -->
            <div
              v-for="(boardcollab, index) in Store.collaborate" 
              :key="index"
              v-show="boardcollab.status === 'ACCEPTED'"
              class="bg-white rounded-lg shadow flex flex-col items-center"
            >
              <div
                class="p-6 min-w-[250px] max-w-[250px] flex flex-col items-center"
                @click="openBoardTaskModal(boardcollab.boardId)"
              >
                <div class="mb-4">
                  <!-- <img
                                    :src="getImageUrl(index)"
                                    alt="bg-board"
                                    class="w-full h-full object-cover rounded-2xl"
                                /> -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-20 stroke-blue-400"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                    />
                  </svg>
                </div>
                <!-- <p class="itbkk-collab-item pt-2">No : {{ index + 1 }}</p> -->
                <p class="itbkk-board-name text-lg font-bold">
                  {{ boardcollab.board_name }}
                </p>
                <p class="itbkk-owner-name pt-2">
                  Owner : {{ boardcollab.owner?.name }}
                </p>
                <p class="itbkk-access-right pt-2">
                  Access Right : {{ boardcollab.accessRight }}
                </p>

              </div>
              <button
                class="itbkk-leave-board flex justify-center w-3/5 rounded-2xl mt-3 text-red-500 hover:text-white border border-red-500 hover:bg-red-500 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                @click="openConfirmLeaveCollabModal(boardcollab)"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
        <tbody
          v-show="Store.collaborate.length === 0 && checkAuthToken()"
          class="bg-white rounded-lg shadow p-6 w-full flex flex-col items-center"
        >
          <tr>
            <td class="text-center" colspan="6">
              Don't Have collaborate Board ?
            </td>
          </tr>
        </tbody>

        <!-- Invite row -->
        <h1
          v-show="checkAuthToken()"
          class="itbkk-collab-board text-3xl font-bold text-black ml-2 mt-10 mb-6"
        >
          Invite Collab Boards
        </h1>
        <div
          v-show="checkAuthToken() && Store.collaborate.length > 0"
          class="overflow-x-auto flex-grow p-4 border"
        >
          <div class="flex gap-4 flex-nowwrap">
            <!-- เพิ่ม flex-wrap และ justify-center -->
            <div
              v-for="(boardcollab, index) in Store.collaborate"
              :key="index"
              v-show="boardcollab.status === 'PENDING'"
              class="bg-white rounded-lg shadow flex flex-col items-center"
            >
              <div
                class="p-6 min-w-[250px] max-w-[250px] flex flex-col items-center"
                @click="openInvitation(boardcollab)"
              >
                <div class="mb-4">
                  <!-- <img
                                    :src="getImageUrl(index)"
                                    alt="bg-board"
                                    class="w-full h-full object-cover rounded-2xl"
                                /> -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-20 stroke-blue-400"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                    />
                  </svg>
                </div>
                <p class="itbkk-board-name text-lg font-bold">
                  Board : {{ boardcollab.board_name }}
                </p>
                <p class="itbkk-access-right pt-2">
                  Access Right : {{ boardcollab.accessRight }}
                </p>
                <p class="itbkk-owner-name pt-2">
                  From : {{ boardcollab.owner?.name }}
                </p>
              </div>
              <button
                class="itbkk-leave-board flex justify-center w-3/5 rounded-2xl mt-3 text-red-500 hover:text-white border border-red-500 hover:bg-red-500 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                @click="openInvitation(boardcollab)"
              >
                Info
              </button>
            </div>
          </div>
        </div>
        <tbody
          v-show="Store.collaborate.length === 0 && checkAuthToken()"
          class="bg-white rounded-lg shadow p-6 w-full flex flex-col items-center"
        >
          <tr>
            <td class="text-center" colspan="6">
              Don't Have Invited collaborate Board ?
            </td>
          </tr>
        </tbody>
      </div>
    </main>
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
