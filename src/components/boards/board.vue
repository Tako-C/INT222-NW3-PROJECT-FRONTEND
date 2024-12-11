<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "@/stores/store.js";
import { PatchData, getAllBoard, removeData } from "@/libs/fetchs.js";

import {
  checkUserInAuthToken,
  checkAuthToken,
  checkrequestNewToken,
} from "@/libs/authToken.js"

import Cookies from "js-cookie"
import BoardVisibilityConfirmation from "@/components/boards/boardVisibilityConfirmation.vue"
import modalNotification from "@/components/modals/modalNotification.vue"
import boardCollabLeave from "@/components/boards/modalConfirmedLeaveCollab.vue"
import sidebarV2 from "./sidebarV2.vue"
import {
  UserGroupIcon,
  PlusCircleIcon,
  BellAlertIcon,
} from "@heroicons/vue/24/solid"

const Store = useStore()
const router = useRouter()
const route = useRoute()
// checkLoginUser
const loadpage = ref(route.params)


const username = ref(Cookies.get("name"));
const openConfirmedChangeVisibility = ref(false)
let visibilityBoard = ref({})
let userLogin = Cookies.get("oid")
let CollabLeave = ref({})
let boardSideBarPersonal = ref([])
let boardSideBarCollab = ref([])
let boardSideBarPublic = ref([])
const openConfirmedLeaveCollab = ref(false)

function getImageUrl(index) {
  return `/images/${(index % 5) + 1}.png`
}

let PersonalBoard = ref([])
let OtherBoard = ref([])
let acceptBoard = []
let pendingBoard = []

function assignVisibility(visibility) {
  if (visibility === "public") {
    return true;
  } else {
    return false;
  }
}
async function fetchData() {
  let dataRaw = await getAllBoard("boards")

  for (let i = 0; i < dataRaw.boards.length; i++) {
    dataRaw.boards[i].isCheck = assignVisibility(dataRaw.boards[i].visibility);
    if (dataRaw.boards[i].owner.oid === userLogin) {
      PersonalBoard.value.push(dataRaw.boards[i])
    }

    if (
      dataRaw.boards[i].owner.oid !== userLogin &&
      dataRaw.boards[i].visibility === "public"
    ) {
      OtherBoard.value.push(dataRaw.boards[i])
    }
  }

  for (let i = 0; i < dataRaw.collaborate.length; i++) {
    if (dataRaw.collaborate[i].visibility === "public") {
      dataRaw.collaborate[i].isCheck = assignVisibility(
        dataRaw.collaborate[i].visibility
      );
      OtherBoard.value.push(dataRaw.collaborate[i])
    }
  }
  Store.collaborate = dataRaw.collaborate
  Store.collaborate.forEach((collab) => {
    if (collab.status === "ACCEPTED") {
      acceptBoard.push(collab);
    } else if (collab.status === "PENDING") {
      pendingBoard.push(collab);
    }
  });

  extractGroupBoard();
}

function openBoardTaskModal(boardId) {
  router.push({ name: "BoardTask", params: { id: boardId } })
}
function openBoardDetailModal(boardId) {
  router.push({ name: "BoardDetail", params: { id: boardId } })
}
function openCreateBoard(boardId) {
  if (!checkAuthToken) {
    errorPermission();
  } else {
    router.push({ name: "createBoard", params: { id: boardId } });
  }
}

function errorPermission() {
  router.push({ name: "notFound" });
}

async function updateVisibility() {
  checkrequestNewToken(router)

  if (visibilityBoard.value.isCheck == true) {
    visibilityBoard.value.visibility = "public";
  } else {
    visibilityBoard.value.visibility = "private";
  }

  let result = await PatchData(`boards/${visibilityBoard.value.boardId}`, {
    visibility: visibilityBoard.value.visibility,
  });

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
      errorPermission();
    }
  }
}

async function changeVisibility() {
  let indexToUpdate = -1;

  // Find the board by ID
  let board = PersonalBoard.value.find(
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
    openConfirmedChangeVisibility.value = true;
    // openConfirmed.value = true
  } else {
    Store.errorPage403 = true;
    errorPermission();
  }
}

function openConfirmLeaveCollabModal(boardcollab) {
  const foundBoard = Store.collaborate.find(
    (board) => board.boardId === boardcollab.boardId
  );

  if (checkAuthToken()) {
    CollabLeave = boardcollab;
    openConfirmedLeaveCollab.value = true;
  } else {
    // errorPermission()
  }
}

function openInvitation() {
  router.push({ name: "collabInvite" });
}

async function leaveConfirm() {
  let collabOid;
  let collabBoard = await getAllBoard(`boards/${CollabLeave.boardId}/collabs`);

  if (collabBoard.status === 401) {
    router.push({ name: "login" });
    Store.errorToken = true;
  }
  if (collabBoard.status === 403) {
    Store.errorPage403 = true;
    errorPermission();
  }
  if (collabBoard.status === 404) {
    Store.errortext404 = "The Tasks does not exist";
    Store.errorPage404 = true;
    errorPermission();
  } else {
    for (let i = 0; i < collabBoard.collaborators.length; i++) {
      if (userLogin === collabBoard.collaborators[i].oid) {
        collabOid = collabBoard.collaborators[i].oid;
        acceptBoard = acceptBoard.filter(
          (info) => info.boardId != collabBoard.collaborators[i].boardsId
        );
      }
    }

    let leaveCollab = await removeData(
      `boards/${CollabLeave.boardId}/collabs/${collabOid}`
    );
  }
  //   fetchData();
  closeNotificationModal();
}

function closeNotificationModal() {
  openConfirmedChangeVisibility.value = false;
  openConfirmedLeaveCollab.value = false;
  Store.errorPrivate404 = false;
  Store.errorPrivate404Content = "";

  let board = PersonalBoard.value.find(
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
}

function checkVariable() {
  if (Store.errorPrivate404 == true) {
    return true;
  }
  return false;
}
function extractGroupBoard() {
  PersonalBoard.value.sort(
    (a, b) => new Date(a.createdOn) - new Date(b.createdOn)
  );
  OtherBoard.value.sort(
    (a, b) => new Date(a.createdOn) - new Date(b.createdOn)
  );
  boardSideBarPersonal.value.push(...PersonalBoard.value);
  boardSideBarPublic.value.push(...OtherBoard.value);
  boardSideBarCollab.value.push(...acceptBoard);
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

  <div class="class name : itbkk-modal-task w-screen bg-white h-screen flex">
    <!-- Table สำหรับแสดงข้อมูลของ board -->
    <sidebarV2
      :boardsPersonal="boardSideBarPersonal"
      :boardsCollab="boardSideBarCollab"
      :boardsPublic="boardSideBarPublic"
    />
    <main class="w-full h-auto overflow-y-auto flex flex-col">
      <div name="PersonalBoard" v-show="checkAuthToken()">
        <div class="flex justify-between text-white">
          <h1 class="text-3xl font-bold text-black ml-2 mt-10 mb-6">
            {{
              checkAuthToken() ? `${username} Personal Board` : "Public Board"
            }}
          </h1>
        </div>
        <button
          class="itbkk-button-create right-0 ml-3 flex bg-orange-300 items-center justify-center h-10 w-40 rounded-xl tooltip tooltip-left border-orange-500"
          :data-tip="
            checkAuthToken()
              ? 'Create your board.'
              : 'You do not have permission to use this feature.'
          "
          :disabled="!checkAuthToken()"
          @click="openCreateBoard()"
        >
          <PlusCircleIcon class="size-7" />
          <p class="pl-2">Create Board</p>
        </button>
        <div class="flex-grow p-2 overflow-y-auto">
          <div class="overflow-x-auto flex-grow p-4 border mb-8">
            <div class="flex gap-4 flex-nowwrap sm:flex-row">
              <!-- เพิ่ม flex-wrap และ justify-center -->

              <!-- Personal Board -->
              <div
                v-for="(board, index) in PersonalBoard"
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <div name="OtherBoard">
        <div class="flex justify-between text-white">
          <h1 class="text-3xl font-bold text-black ml-2 mt-10 mb-6">
            Public Board
          </h1>
        </div>
        <div class="flex-grow p-2 overflow-y-auto">
          <div class="overflow-x-auto flex-grow p-4 border mb-8">
            <tbody
              v-show="OtherBoard.length === 0"
              class="bg-white rounded-lg p-6 w-full flex flex-col items-center"
            >
              <tr>
                <td class="text-center" colspan="6">
                  Don't Have Public Board ?
                </td>
              </tr>
            </tbody>
            <div class="flex gap-4 flex-nowwrap">
              <!-- เพิ่ม flex-wrap และ justify-center -->

              <!-- OterBoars -->
              <div
                v-for="(board, index) in OtherBoard"
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- collab row -->
      <h1
        v-show="Store.collaborate.length > 0"
        class="itbkk-collab-board text-3xl font-bold text-black ml-2 mt-10 mb-6"
      >
        Collab Boards
      </h1>
      <div
        v-show="checkAuthToken() && Store.collaborate.length > 0"
        class="flex-grow p-4 border ml-2"
      >
        <div class="flex gap-4 flex-nowwrap">
          <div
            v-for="(boardcollab, index) in acceptBoard"
            :key="index"
            class="bg-white rounded-lg shadow flex flex-col items-center"
          >
            <div
              class="p-6 min-w-[250px] max-w-[250px] flex flex-col items-center"
              @click="openBoardTaskModal(boardcollab.boardId)"
            >
              <div class="mb-4">
                <UserGroupIcon class="size-20 text-blue-300" />
              </div>
              <p class="itbkk-board-name text-lg font-bold">
                {{ boardcollab.board_name }}
              </p>
              <p class="itbkk-owner-name pt-2">
                Owner : {{ boardcollab.owner.name }}
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
        <tbody
          v-show="acceptBoard.length === 0 && checkAuthToken()"
          class="bg-white rounded-lg p-6 w-full flex flex-col items-center"
        >
          <tr>
            <td class="text-center" colspan="6">
              Don't Have collaborate Board ?
            </td>
          </tr>
        </tbody>
      </div>

      <!-- Invite row -->
      <div v-show="pendingBoard.length > 0">
        <h1
          v-show="checkAuthToken()"
          class="itbkk-collab-board text-3xl font-bold text-black ml-2 mt-10 mb-6"
        >
          Invite Collab Boards
        </h1>
        <div class="overflow-x-auto flex-grow p-4 border ml-2">
          <div class="flex gap-4 flex-nowwrap">
            <!-- เพิ่ม flex-wrap และ justify-center -->
            <div
              v-for="(boardcollab, index) in pendingBoard"
              :key="index"
              v-show="boardcollab.status === 'PENDING'"
              class="bg-white rounded-lg shadow flex flex-col items-center"
            >
              <div
                class="p-6 min-w-[250px] max-w-[250px] flex flex-col items-center"
                @click="openInvitation()"
              >
                <div class="mb-4">
                  <BellAlertIcon class="size-20 text-yellow-400" />
                </div>
                <p class="itbkk-board-name text-lg font-bold">
                  Board : {{ boardcollab.board_name }}
                </p>
                <p class="itbkk-access-right pt-2">
                  Access Right : {{ boardcollab.accessRight }}
                </p>
                <p class="itbkk-owner-name pt-2">
                  From : {{ boardcollab.owner.name }}
                </p>
              </div>
              <button
                class="itbkk-leave-board flex justify-center w-3/5 rounded-2xl mt-3 text-red-500 hover:text-white border border-red-500 hover:bg-red-500 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                @click="openInvitation()"
              >
                Info
              </button>
            </div>
          </div>
        </div>
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
.sign-out:hover {
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
