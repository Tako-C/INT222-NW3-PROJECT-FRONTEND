<script setup>
import { ref, onMounted, watch, computed, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "@/stores/store.js";
import {
  getAllBoard,
  getDataByBoard,
  removeData,
  PatchData,
} from "@/libs/fetchs.js";
import Cookies from "js-cookie";
import modalNotification from "@/components/modals/modalNotification.vue";
import modalconfirmed from "@/components/modals/modalConfirmed.vue";
import {
  getAuthToken,
  checkUserInAuthToken,
  checkAuthToken,
  checkrequestNewToken,
} from "@/libs/authToken.js";
import boardSlidebar from "./boardSlidebar.vue";
import sidebarV2 from "./sidebarV2.vue";

const Store = useStore();
const router = useRouter();
const route = useRoute();
const loadpage = ref(route.params);
const boardId = ref(route.params.id);
const isStatusDropdownOpen = ref(false);
const isTaskDropdownOpen = ref(false);
const boardName = ref("");
const errorDelete = ref(false);
const successDelete = ref(false);
const openConfirmed = ref(false);
const taskTitle = ref("");
const taskID = ref("");
const username = ref(Cookies.get("name"));
let boardSideBarPersonal = ref([]);
let boardSideBarCollab = ref([]);
let boardSideBarPublic = ref([]);
let PersonalBoard = ref([]);
let OtherBoard = ref([]);
let acceptBoard = [];

const sortStatus = ref(0);
const newFilterString = ref("");
const filterList = ref([]);
const showStatusList = ref(false);
let userLogin = Cookies.get("oid");

const isBoardPage = computed(() => route.path.startsWith("/board"));
const isStatusPage = computed(() =>
  route.path.startsWith(`/board/${boardId.value}/status`)
);

let boardnow = ref({});
let visibilityBoard = ref({});
let openConfirmedvisibility = ref(false);
import BoardVisibilityConfirmation from "./boardVisibilityConfirmation.vue";

// function checkFirstStatuses() {
//     console.log(Store.statuses.length)
//     let firstStatuses = Store.statuses[0]
//     console.log(firstStatuses);

//     openStatuses(boardId.value)

// }

// ต้องทำเพราะ cypress  ====================================================================================================

// function loopBoardVisibility() {
//     for (const board of Store.boards) {
//         if (board.boardId == boardId.value) {
//             boardnow.value = board
//         }
//     }
// }

async function fetchData() {
  let endpoint = `${boardId.value}/tasks`;
  console.log(endpoint);

  if (filterList.value.length > 0) {
    endpoint = `${
      boardId.value
    }/tasks?sortBy=statusName&FilterStatuses=${filterList.value
      .map((status) => status.trim())
      .join("&FilterStatuses=")}`;
  }
  let resBoards = await getAllBoard("boards");
  let resTasks = await getDataByBoard(endpoint);
  let resStatuses = await getDataByBoard(`${boardId.value}/statuses`);

  console.log(resTasks);
  // console.log(resStatuses);
  // console.log(resBoards);

  if (resTasks.status === 401) {
    router.push({ name: "login" });
    Store.errorToken = true;
  }
  if (resTasks.status === 403) {
    Store.errorPage403 = true;
    errorPermition();
  }
  if (resTasks.status === 404) {
    Store.errortext404 = "The Tasks does not exist";
    Store.errorPage404 = true;
    errorPermition();
  } else {
    Store.tasks = resTasks;
    Store.statuses = resStatuses;
    Store.boards = resBoards;
    Store.collaborate = resBoards.collaborate;
    // console.log(Store.tasks);
    // console.log(Store.boards);
    // console.log(Store.collaborate);
  }

  // Store.collaborate.forEach((collab) => {
  //   if (collab.status === "ACCEPTED") {
  //     acceptBoard.push(collab);
  //   }
  // });
  loopBoardVisibility();
  extractGroupBoard();
}

function toggleSort() {
  sortStatus.value = (sortStatus.value + 1) % 3;

  if (sortStatus.value === 1) {
    Store.tasks.sort((a, b) => a.statusName.localeCompare(b.statusName));
  } else if (sortStatus.value === 2) {
    Store.tasks
      .sort((a, b) => a.statusName.localeCompare(b.statusName))
      .reverse();
  } else {
    Store.tasks.sort((a, b) => a.id - b.id);
  }
}

function filteredStatuses() {
  return Store.statuses.filter((status) =>
    status.name.toLowerCase().includes(newFilterString.value.toLowerCase())
  );
}

function addFilter() {
  const trimmedFilter = newFilterString.value.trim();
  if (trimmedFilter && !filterList.value.includes(trimmedFilter)) {
    filterList.value.push(trimmedFilter);
    newFilterString.value = "";
    fetchData();
    showStatusList.value = false;
    // Optional: Reset sort status if needed
    // sortStatus.value = 1;
  } else {
    window.alert(`${trimmedFilter} is already in the filter list.`);
    showStatusList.value = false;
  }
}

function removeFilter(index) {
  filterList.value.splice(index, 1);
  fetchData();
}

function removeAllFilter() {
  filterList.value = [];
  fetchData();
}

function loopBoardVisibility() {
  const foundBoard =
    Store.boards.boards.find((board) => board.boardId === boardId.value) ||
    Store.boards.collaborate.find((board) => board.boardId === boardId.value);
  if (foundBoard) {
    if (foundBoard.visibility === "public") {
      foundBoard.isCheck = true;
    }
    if (foundBoard.visibility === "private") {
      foundBoard.isCheck = false;
    }
    boardnow.value = foundBoard;
    // console.log(boardnow.value)
  }

  // console.log(Store.boards);
}

function openConfirmVisibilitymodal() {
  if (checkAuthToken) {
    visibilityBoard.value = boardnow.value;
    // console.log(boardnow.value.visibility)

    openConfirmedvisibility.value = true;
  } else {
    errorPermition();
  }
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
    if (result.status === 401) {
      Store.errorPage401 = true;
      errorPermition();
    }
  }
  closeNotificationModal();
}
async function changeVisibility() {
  let indexToUpdate = -1;

  // Find the board by ID
  let board =
    Store.boards.boards.find(
      (b) => b.boardId === visibilityBoard.value.boardId
    ) ||
    Store.boards.collaborate.find(
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
  openConfirmed.value = false;
}

function openBoards() {
  router.push({ name: "Board" });
}

function goBack() {
  router.push({name: "Board"});
}

function openCreateTask() {
  router.push({ name: "createTask" });
}

function openBoardDetailModal(id) {
  router.push({ name: "BoardTask", params: { id } });
  // Update the boardId ref to trigger data fetch
  boardId.value = id;
}

function openStatuses(boardId) {
  router.push({ name: "Status", params: { id: boardId } });
}

function openCollaborator(boardId) {
  router.push({ name: "collab", params: { id: boardId } });
}

function toggleStatusDropdown() {
  isStatusDropdownOpen.value = !isStatusDropdownOpen.value;
  // checkFirstStatuses()
}

function toggleTaskDropdown() {
  isTaskDropdownOpen.value = !isTaskDropdownOpen.value;
}

function getBoardName() {
  const board =
    Store.boards.boards.find((b) => b.boardId === boardId.value) ||
    Store.boards.collaborate.find((b) => b.boardId === boardId.value);

  if (board) {
    // console.log(board)
    boardName.value = board.board_name;
  } else {
    // console.log('ไม่พบบอร์ด')
    boardName.value = "";
  }
}

function openTaskDetail(taskId) {
  router.push({
    name: "editTask",
    params: { id: boardId.value, taskId: taskId },
  });
}

async function removeTask() {
  openConfirmed.value = false;
  let removedTask = await removeData(
    `boards/${route.params.id}/tasks/${taskID.value}`
  );

  if (checkOwner() && checkAuthToken()) {
    if (removedTask.status === 401) {
      router.push({ name: "login" });
      Store.errorToken = true;
    }
    if (removedTask.status === 404) {
      console.log("result :", removedTask.status);
      errorDelete.value = true;
    } else {
      Store.tasks = Store.tasks.filter((task) => task.id !== taskID.value);
      successDelete.value = true;
      // console.log(successDelete.value)
    }
  } else {
    if (removedTask.status === 403) {
      Store.errorPage403 = true;
      errorPermition();
    }
    if (removedTask.status === 401) {
      Store.errorPage401 = true;
      errorPermition();
    }
  }
  fetchData();
  closeNotificationModal();
}

function closeNotificationModal() {
  errorDelete.value = false;
  successDelete.value = false;
  Store.successUpdateTask = false;
  Store.errorUpdateTask = false;
  Store.successAddTask = false;
  openConfirmed.value = false;
  taskTitle.value = "";
  taskID.value = "";
  Store.errorPage403 = false;
  Store.errorPage404 = false;

  // fetchData()
  // เพิ่มจากcypress
  openConfirmedvisibility.value = false;
  Store.errorPrivate404 = false;
  Store.errorPrivate404Content = "";

  console.log(Store.boards);
  console.log(visibilityBoard.value);

  let board =
    Store.boards.boards.find(
      (b) => b.boardId === visibilityBoard.value.boardId
    ) ||
    Store.boards.collaborate.find(
      (b) => b.boardId === visibilityBoard.value.boardId
    );

  console.log(board);
  if (board) {
    if (board.visibility === "public") {
      boardnow.isCheck = true;
    } else {
      boardnow.isCheck = false;
    }
  } else {
    boardnow.isCheck = false;
  }
  fetchData();
}

function checkVariable() {
  if (
    Store.successAddTask == true ||
    Store.errorUpdateTask == true ||
    Store.successUpdateTask == true ||
    errorDelete.value === true ||
    successDelete.value === true
  ) {
    return true;
  }
  return false;
}

function openConfirmModal(id, title) {
  // console.log("open delete");
  // console.log(checkOwner());

  openConfirmed.value = true;
  taskTitle.value = title;
  taskID.value = id;
}

async function logOut() {
  router.push({ name: "login" });
}
function errorPermition() {
  router.push({ name: "notFound" });
}

function checkOwner() {
  const foundBoard =
    Store.boards.boards.find((board) => board.boardId === boardId.value) ||
    Store.boards.collaborate.find((board) => board.boardId === boardId.value);
  if (foundBoard) {
    const userInboard = foundBoard.owner.oid;
    return checkUserInAuthToken(userInboard, userLogin);
  } else {
    // console.log(Store.boards);
    Store.errorPage404 = true;
    Store.errortext404 = "The Status does not exist";
    router.push({ name: "notFound" });
    // }
  }
}

function userCollab() {
  const userCollab =
    Store.boards.boards.find((uCollab) => uCollab.boardId === boardId.value) ||
    Store.boards.collaborate.find(
      (uCollab) => uCollab.boardId === boardId.value
    );

  if (checkOwner()) {
    return true;
  } else {
    if (userCollab) {
      if (userCollab.accessRight == "read") {
        console.log("read");
        return false;
      }
      if (userCollab.accessRight == "write") {
        console.log("write");
        return true;
      } else {
        console.log("Erroe permition");
        return false;
      }
    } else {
      return false;
    }
  }
}

function extractGroupBoard() {
  boardSideBarPersonal.value = [];
  boardSideBarPublic.value = [];
  boardSideBarCollab.value = [];
  console.log(Store.boards.boards);
  PersonalBoard.value = Store.boards.boards.filter(
    (board) => board.owner.oid === userLogin
  );
  OtherBoard.value = Store.boards.boards.filter(
    (board) => board.owner.oid != userLogin
  );

  let CollabBoard = Store.collaborate.filter(
    (collab) => collab.status == "ACCEPTED"
  );
  console.log(CollabBoard);

  boardSideBarPersonal.value.push(...PersonalBoard.value);
  boardSideBarPublic.value.push(...OtherBoard.value);
  boardSideBarCollab.value.push(...CollabBoard);
  console.log(boardSideBarPublic.value);
  console.log(PersonalBoard.value);
  //   console.log(OtherBoard.value);
}
console.log("boom");

watch(
  () => route.params,
  async (newBoardId) => {
    boardId.value = route.params.id;
    console.log(newBoardId);

    if (newBoardId) {
      await fetchData();
      getBoardName();
      loopBoardVisibility();

      // checkTokenLogin()
    }
  },
  { immediate: true }
);

// watchEffect( async()=> {
//     console.log(route.params.id)
//     boardId.value = route.params.id
//     await fetchData()
//             getBoardName()
//             loopBoardVisibility()
// }
// )

onMounted(() => {
  checkrequestNewToken(router);
  fetchData();
});
</script>

<template>
  <modalNotification
    :errorDelete="errorDelete"
    :successDelete="successDelete"
    @closemodal="closeNotificationModal()"
    v-show="checkVariable()"
    class="z-30"
  />
  <modalconfirmed
    v-show="openConfirmed"
    :taskTitle="taskTitle"
    @closemodal="closeNotificationModal()"
    @confirmed="removeTask()"
    class="z-40"
  />
  <BoardVisibilityConfirmation
    :changevisibility="visibilityBoard"
    v-show="openConfirmedvisibility"
    @closemodal="closeNotificationModal()"
    @confirmed="updateVisibility()"
    class="z-40"
  />
  <div class="w-screen bg-white h-screen flex">
    <sidebarV2
      :boardsPersonal="boardSideBarPersonal"
      :boardsCollab="boardSideBarCollab"
      :boardsPublic="boardSideBarPublic"
    />
                    <!-- back button -->
                    <div
                class="fixed right-0 bottom-0 mt-3 flex bg-orange-400 items-center justify-center h-10 w-10 md:h-14 md:w-20 rounded-xl cursor-pointer"
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
                        d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                    />
                </svg>

                <p class="pl-2 hidden md:block" @click="goBack()">Back</p>
            </div>

    <!-- Table สำหรับแสดงข้อมูลของ board -->
    <main class="h-full w-full overflow-y-scroll">
      <!--TOPIC-->
      <!-- respon -->
      <div
        class="flex justify-between text-white text-xs sm:text-sm md:text-sm lg:text-lg"
      >
        <div
          class="text-xs sm:text-lg md:text-2xl font-bold text-black flex w-auto ml-2 lg:ml-16 mt-10"
        >
          <h1>{{ checkAuthToken() ? `${username}` : "Public Board" }}</h1>
          <div class="flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
              />
            </svg>
          </div>
          <h1>{{ boardName }}</h1>
          <div class="flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
              />
            </svg>
          </div>
          <p>Tasks Lists</p>
        </div>
        <button
          class="itbkk-button-add mt-5 flex text-orange-400 md:text-white md:bg-orange-400 items-center justify-center h-14 md:w-40 rounded-xl tooltip tooltip-left"
          @click="userCollab() || checkOwner() ? openCreateTask() : ''"
          :data-tip="
            checkAuthToken()
              ? 'Create your task.'
              : 'You do not have permission to use this feature.'
          "
          :disabled="!checkAuthToken()"
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
          <p class="pl-2 hidden md:block">Create Task</p>
        </button>
      </div>
      <!-- respon -->
      <div
        class="flex flex-col items-center sm:flex-col lg:flex-row "
      >
        <!--Search Box-->
        <div class="flex items-center">
          <div>
            <div
              class="flex items-center justify-between input input-bordered w-auto h-10 ml-2 lg:ml-16 mt-5"
            >
              <input
                @input="showStatusList = !showStatusList"
                type="text"
                placeholder="Search Filter something . . ."
                v-model="newFilterString"
                @keyup.enter="addFilter"
                class="itbkk-status-filter w-auto text-sm lg:text-lg"
              />
              <img
                src="https://www.svgrepo.com/show/46113/magnifying-glass.svg"
                alt=""
                class="ml-2 cursor-pointer w-4 h-4"
                @click="addFilter"
              />
            </div>
            <div
              class="fixed z-10 bg-white rounded-lg p-2"
              v-show="showStatusList"
            >
              <div v-for="(status, index) in filteredStatuses()" :key="index">
                <p
                  @click="addFilter((newFilterString = status.name))"
                  class="hover:bg-slate-200 p-2"
                >
                  {{ status.name }}
                </p>
              </div>
            </div>
          </div>
          <p class="p-4 mt-5 text-sm lg:text-lg">Filter Status By :</p>
          <div
            v-show="filterList.length === 0"
            class="italic text-gray-400 mt-5 text-sm lg:text-lg" 
          >
            No filter yet . . .
          </div>
          <div
            v-show="filterList.length > 0"
            v-for="(filter, index) in filterList"
            :key="index"
            class="flex justify-center items-center rounded-3xl bg-slate-100 w-auto mt-5 ml-2 p-2"
          >
            <p class="itbkk-filter-item">{{ filter }}</p>
            <img
              src="https://www.svgrepo.com/show/21045/delete-button.svg"
              alt="Delete"
              class="itbkk-filter-item-clear ml-2 cursor-pointer w-3 h-3"
              @click="removeFilter(index)"
            />
          </div>
          <div
            v-show="filterList.length > 0"
            @click="removeAllFilter()"
            class="itbkk-filter-item-clear"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6 cursor-pointer text-red-500 mt-5 ml-2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
        </div>
        <div class="flex">
          <!-- Visibility -->
          <!-- <div class="itbkk-board-visibility flex mt-8 ">
                            <input
                                type="checkbox"
                                class=" toggle tooltip tooltip-right "
                                :class="{
                                    'cursor-not-allowed ':
                                        !checkAuthToken()
                                }"
                                :data-tip="
                                    checkAuthToken()
                                        ? 'change Visibility Board'
                                        : 'You do not have permission to use this feature.'
                                "
                                :disabled="!checkAuthToken()"
                                v-model="boardnow.isCheck"
                                @change="openConfirmVisibilitymodal()"
                                
                            />
                            <p class="pl-3">{{ boardnow.visibility }}</p>
                        </div> -->

          <!--Sort-->
          <!-- respon -->
          <div
            class="itbkk-status-sort cursor-pointer pt-1 flex items-center md:ml-[12%] lg:ml-[20%] mr-[12%] mt-3 text-xs md:text-sm lg:text-lg"
            @click="toggleSort"
          >
            <template v-if="sortStatus === 0">
              <div class="flex">
                <span class="w-20">Sort DEF</span>
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
                    d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
                  />
                </svg>
              </div>
            </template>
            <template v-else-if="sortStatus === 1">
              <div class="flex">
                <span class="w-20">Sort ACS</span>
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
                    d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12"
                  />
                </svg>
              </div>
            </template>
            <template v-else>
              <div class="flex">
                <span class="w-20">Sort DCS</span>
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
                    d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25"
                  />
                </svg>
              </div>
            </template>
            <button
              class="ml-2 bg-sky-200 rounded-lg p-2 itbkk-manage-status"
              @click="openStatuses(boardId)"
            >
              Manage Status
            </button>
            <button
              class="ml-2 bg-yellow-200 rounded-lg p-2 itbkk-manage-collaborator"
              @click="openCollaborator(boardId)"
            >
              Manage Collaborator
            </button>
          </div>
        </div>
      </div>

      <!--Table-->
      <div class="flex flex-col mt-5 ml-2 lg:ml-16 w-full lg:w-4/5 ">
        <!-- Table Header -->
        <div class="bg-gray-100 p-4 rounded-t-lg shadow-md">
          <!-- respon -->
          <div class="grid grid-cols-4 gap-4 text-xs md:text-sm lg:text-xl">
            <h3 class="font-bold">ID</h3>
            <h3 class="font-bold">Title</h3>
            <h3 class="font-bold">Assignees</h3>
            <h3 class="font-bold">Status</h3>
          </div>
        </div>
        <!-- Table Body -->
        <!-- respon -->
        <div
          v-for="(task, index) in Store.tasks"
          :key="index"
          class="bg-white rounded-b-lg shadow-md mb-2 text-xs sm:text-sm md:text-sm lg:text-lg"
          :class="{
            'itbkk-modal-task itbkk-item': route.path.endsWith('/task'),
          }"
        >
          <div
            class="grid grid-cols-4 gap-4 p-4"
            :class="{
              'itbkk-status': !route.params.taskId,
            }"
          >
            <div class="itbkk-button-action">
              <div
                class="itbkk-button-edit"
                :class="{ disabled: !checkAuthToken() }"
                @click="openTaskDetail(task.id)"
              >
                {{ index + 1 }}({{ task.id }})
              </div>
            </div>
            <div
              class="itbkk-title break-words"
              @click="openTaskDetail(task.id)"
            >
              {{ task.title }}
            </div>
            <span
              class="itbkk-assignees break-words"
              :class="{
                'italic text-gray-400': !task.assignees,
                'itbkk-assignees': !route.params.id,
              }"
            >
              {{ !task.assignees ? "Unassigned" : task.assignees }}</span
            >
            <div
              class="flex justify-between"
              :class="{
                'itbkk-status': route.path.endsWith('/task'),
              }"
            >
              <p @click="openTaskDetail(task.id)">
                {{ task.statusName }}
              </p>
              <div
                class="itbkk-button-delete tooltip tooltip-top"
                :class="{
                  'cursor-not-allowed': !checkAuthToken(),
                  'cursor-pointer': checkAuthToken(),
                }"
                :disabled="!checkAuthToken()"
                :data-tip="
                  checkAuthToken()
                    ? 'Delete your task.'
                    : 'You do not have permission to use this feature.'
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  @click="
                    checkAuthToken() && userCollab()
                      ? openConfirmModal(task.id, task.title)
                      : ''
                  "
                  class="size-6 text-red-500"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <tbody
        v-show="Store.tasks.length === 0"
        class="w-full flex justify-center mt-16"
      >
        <tr>
          <td class="text-center" colspan="6">Don't Have Task ??</td>
        </tr>
      </tbody>
    </main>
  </div>
  <router-view />
</template>

<style scoped></style>
