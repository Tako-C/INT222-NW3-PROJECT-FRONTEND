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
import sidebarV2 from "./sidebarV2.vue";
import {
  ArrowUturnLeftIcon,
  ChevronDoubleRightIcon,
  PlusIcon,
  MagnifyingGlassCircleIcon,
  TrashIcon,
  XCircleIcon,
  Bars3Icon,
  BarsArrowUpIcon,
  BarsArrowDownIcon,
} from "@heroicons/vue/24/solid";

const Store = useStore();
const router = useRouter();
const route = useRoute();
const boardId = ref(route.params.id);
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
let boardIsmycollab = ref(false)

const sortStatus = ref(0);
const newFilterString = ref("");
const filterList = ref([]);
const showStatusList = ref(false);
let userLogin = Cookies.get("oid");

let boardnow = ref({});
let visibilityBoard = ref({});
let openConfirmedvisibility = ref(false);
import BoardVisibilityConfirmation from "./boardVisibilityConfirmation.vue";

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

  for (let i = 0; i < resBoards.boards.length; i++) {
    if (resBoards.boards[i].owner.oid === userLogin) {
      PersonalBoard.value.push(resBoards.boards[i]);
    }

    if (
      resBoards.boards[i].owner.oid !== userLogin &&
      resBoards.boards[i].visibility === "public"
    ) {
      OtherBoard.value.push(resBoards.boards[i]);
    }
  }

  for (let i = 0; i < resBoards.collaborate.length; i++) {
    if (resBoards.collaborate[i].visibility === "public") {
        resBoards.collaborate[i].visibility
      OtherBoard.value.push(resBoards.collaborate[i]);
    }
  }
  if (resTasks.status === 401) {
    router.push({ name: "login" });
    Store.errorToken = true;
  }
  if (resTasks.status === 403) {
    Store.errorPage403 = true;
    errorPermission();
  }
  if (resTasks.status === 404) {
    Store.errortext404 = "The Board does not exist";
    Store.errorPage404 = true;
    errorPermission();
  } else {
    Store.tasks = resTasks;
    Store.statuses = resStatuses;
    Store.boards = resBoards;
    Store.collaborate = resBoards.collaborate;
  }
  loopBoardVisibility()
  extractGroupBoard()
  getMyCollab()
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
      errorPermission();
    }
    if (result.status === 401) {
      Store.errorPage401 = true;
      errorPermission();
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

function goBack() {
  router.push({ name: "Board" });
}

function openCreateTask() {
  router.push({ name: "createTask" });
}

function openStatuses(boardId) {
  router.push({ name: "Status", params: { id: boardId } });
}

function openCollaborator(boardId) {
  router.push({ name: "collab", params: { id: boardId } });
}

function getBoardName() {
  const board =
    Store.boards.boards.find((b) => b.boardId === boardId.value) ||
    Store.boards.collaborate.find((b) => b.boardId === boardId.value);

  if (board) {
    boardName.value = board.board_name;
  } else {
    boardName.value = "";
  }
}

async function getMyCollab() {
  let AllCollabInCurrentBoard = []
  AllCollabInCurrentBoard =  await getDataByBoard(`${boardId.value}/collabs`);
  console.log(AllCollabInCurrentBoard);
  
  let myCollabData = AllCollabInCurrentBoard.collaborators.find((collab)=> collab.oid === userLogin)
  console.log(myCollabData);
  if(!checkOwner) {
    if (myCollabData.status == "ACCEPTED") {
      if (myCollabData.accessRight == "write") {
          boardIsmycollab.value = true
      } else {
           boardIsmycollab.value = false
      }

  } else{
     boardIsmycollab.value = false
  }  
  } else {  
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
    }
  } else {
    if (removedTask.status === 403) {
      Store.errorPage403 = true;
      errorPermission();
    }
    if (removedTask.status === 401) {
      Store.errorPage401 = true;
      errorPermission();
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

  let board =
    Store.boards.boards.find(
      (b) => b.boardId === visibilityBoard.value.boardId
    ) ||
    Store.boards.collaborate.find(
      (b) => b.boardId === visibilityBoard.value.boardId
    );

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
  openConfirmed.value = true;
  taskTitle.value = title;
  taskID.value = id;
}

function errorPermission() {
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
    Store.errorPage404 = true;
    Store.errortext404 = "The Board does not exist";
    router.push({ name: "notFound" })
  }
}


function extractGroupBoard() {
  boardSideBarPersonal.value = [];
  boardSideBarPublic.value = [];
  boardSideBarCollab.value = [];

  let CollabBoard = Store.collaborate.filter(
    (collab) => collab.status == "ACCEPTED"
  );

  boardSideBarPersonal.value.push(...PersonalBoard.value);
  boardSideBarPublic.value.push(...OtherBoard.value);
  boardSideBarCollab.value.push(...CollabBoard);
}

watch(
  () => route.params,
  async (newBoardId) => {
    boardId.value = route.params.id;

    if (newBoardId) {
      await fetchData()
      getBoardName()
      loopBoardVisibility()

      // checkTokenLogin()
    }
  },
  { immediate: true }
);

onMounted(() => {
  checkrequestNewToken(router)
});
</script>

<template>
  <div class="w-screen bg-white h-screen flex">
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
    <sidebarV2
      :boardsPersonal="boardSideBarPersonal"
      :boardsCollab="boardSideBarCollab"
      :boardsPublic="boardSideBarPublic"
    />
    <!-- back button -->
    <div
      class="fixed right-0 bottom-0 mt-3 flex bg-orange-400 items-center justify-center h-10 w-10 md:h-14 md:w-20 rounded-xl cursor-pointer"
      @click="goBack()"
    >
      <ArrowUturnLeftIcon class="size-7 text-white" />
      <p class="pl-2 hidden md:block text-white">Back</p>
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
            <ChevronDoubleRightIcon class="size-7" />
          </div>
          <h1>{{ boardName }}</h1>
          <div class="flex items-center justify-center">
            <ChevronDoubleRightIcon class="size-7" />
          </div>
          <p>Tasks Lists</p>
        </div>
        <button
          class="itbkk-button-add mt-5 flex md:text-white items-center justify-center h-14 md:w-40 rounded-xl tooltip tooltip-left"
          :class="{
              'bg-orange-500': boardIsmycollab || checkOwner(),
              'bg-gray-400': !boardIsmycollab && !checkOwner() ,
              'cursor-not-allowed': !checkOwner() && !boardIsmycollab,
              'cursor-pointer': checkOwner() || boardIsmycollab,
            }"
          @click="checkOwner() || boardIsmycollab ? openCreateTask() : ''"
          :data-tip="
            boardIsmycollab || checkOwner()
              ? 'Create your task.'
              : 'You do not have permission to use this feature.'
          "
          :disabled="!checkAuthToken() && !boardIsmycollab"
          
        >
          <PlusIcon class="size-7" />
          <p class="pl-2 hidden md:block">Create Task</p>
        </button>
      </div>
      <!-- respon -->
      <div class="flex flex-col items-center sm:flex-col lg:flex-row">
        <!--Search Box-->
        <div class="flex items-center w-[60%]">
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
              <MagnifyingGlassCircleIcon
                class="size-8 cursor-pointer -mr-2 text-orange-400"
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
            <TrashIcon
              class="size-5 itbkk-filter-item-clear ml-2 cursor-pointer"
              @click="removeFilter(index)"
            />
          </div>
          <div
            v-show="filterList.length > 0"
            @click="removeAllFilter()"
            class="itbkk-filter-item-clear"
          >
            <XCircleIcon class="size-6 cursor-pointer text-red-500 mt-5 ml-2" />
          </div>
        </div>
        <div class="flex">
          <!-- respon -->
          <div
            class="itbkk-status-sort cursor-pointer pt-1 flex items-center  md:ml-[12%] lg:ml-[20%] mr-[12%] mt-3 text-xs md:text-sm lg:text-lg"
            @click="toggleSort"
          >
            <template v-if="sortStatus === 0">
              <div class="flex">
                <span class="w-20">Sort DEF</span>
                <Bars3Icon class="size-6" />
              </div>
            </template>
            <template v-else-if="sortStatus === 1">
              <div class="flex">
                <span class="w-20">Sort ACS</span>
                <BarsArrowUpIcon class="size-7" />
              </div>
            </template>
            <template v-else>
              <div class="flex">
                <span class="w-20">Sort DCS</span>
                <BarsArrowDownIcon class="size-7" />
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
      <div class="flex flex-col mt-5 ml-2 lg:ml-16 w-full lg:w-4/5">
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
                <TrashIcon
                  class="size-7"
                  :class="{
                    ' text-red-500': boardIsmycollab || checkOwner(),
                    'text-gray-400': !boardIsmycollab && !checkOwner() ,
                    'cursor-not-allowed': !checkOwner() && !boardIsmycollab,
                    'cursor-pointer': checkOwner() || boardIsmycollab,
                  }"
                  @click="
                    checkOwner() || boardIsmycollab
                      ? openConfirmModal(task.id, task.title)
                      : ''
                  "
                />
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
