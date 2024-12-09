<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter, onBeforeRouteUpdate } from "vue-router";
import { useStore } from "@/stores/store.js";
import {
  getAllBoard,
  getDataByBoard,
  removeData,
  clearCookies,
} from "@/libs/fetchs.js";
import Cookies from "js-cookie";
import modalNotification from "@/components/modals/modalNotification.vue";
import modalstatusDelete from "@/components/statuses/removeStatus.vue";
import modalTransfer from "@/components/modals/modalTransfer.vue";
import {
  getAuthToken,
  checkAuthToken,
  checkUserInAuthToken,
  checkrequestNewToken,
} from "@/libs/authToken.js";
import sidebarV2 from "../boards/sidebarV2.vue";
import {
  ArrowUturnLeftIcon,
  ChevronDoubleRightIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/vue/24/solid";

const Store = useStore();
const router = useRouter();
const route = useRoute();
const boardId = ref(route.params.id);
const isStatusDropdownOpen = ref(false);
const isTaskDropdownOpen = ref(false);
const username = ref(Cookies.get("name"));
const boardName = ref("");
const removeName = ref("");
const removeId = ref("");

const openConfirmed = ref(false);
const transferModal = ref(false);
const errorDeleteStatus = ref(false);
const successDeleteStatus = ref(false);
let userLogin = Cookies.get("oid");
let boardSideBarPersonal = ref([]);
let boardSideBarCollab = ref([]);
let boardSideBarPublic = ref([]);
let PersonalBoard = ref([]);
let OtherBoard = ref([]);
let acceptBoard = [];
let boardIsmycollab = ref(false)

watch(
    boardId,
    async (newBoardId) => {
        if (newBoardId) {
            await fetchData()
        }
    },
    { immediate: true }
)


onMounted(() => {
  // fetchData()
  checkrequestNewToken(router);
});

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
  // const userCollab =
  //   Store.boards.boards.find((uCollab) => uCollab.boardId === boardId.value) ||
  //   Store.boards.collaborate.find(
  //     (uCollab) => uCollab.boardId === boardId.value
  //   );

  // if (checkOwner()) {
  //   return true;
  // } else {
  //   if (userCollab) {
  //     if (userCollab.accessRight == "read") {
  //       console.log("read");
  //       return false;
  //     }
  //     if (userCollab.accessRight == "write") {
  //       console.log("write");
  //       return true;
  //     } else {
  //       console.log("Erroe permition");
  //       return false;
  //     }
  //   } else {
  //     return false;
  //   }
  // }
}
async function getMyCollab() {
  let AllCollabInCurrentBoard = []
  AllCollabInCurrentBoard =  await getDataByBoard(`${boardId.value}/collabs`);
  console.log(AllCollabInCurrentBoard);
  
  let myCollabData = AllCollabInCurrentBoard.collaborators.find((collab)=> collab.oid === userLogin)
  console.log(myCollabData);

  if (myCollabData.status == "ACCEPTED") {
      if (myCollabData.accessRight == "write") {
          boardIsmycollab.value = true
      } else {
           boardIsmycollab.value = false
      }

  } else{
     boardIsmycollab.value = false
  }
  
  
  
}
async function fetchData() {
  const endpoint = `${boardId.value}/statuses`;
  let resStatus = await getDataByBoard(endpoint);
  let resTasks = await getDataByBoard(`${boardId.value}/tasks`);
  let resBoards = await getAllBoard("boards");

  Store.boards = resBoards;
  Store.statuses = resStatus;
  Store.tasks = resTasks;
  Store.collaborate = resBoards.collaborate;
  // Store.collaborate = resBoards.collaborate
  // console.log(Store.collaborate)
  console.log(Store.collaborate);
  PersonalBoard.value = []
  OtherBoard.value = []

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
  getBoardName()
  getMyCollab()
  switch (resStatus.status) {
    case 401:
      router.push({ name: "login" });
      Store.errorToken = true;
      break;
    case 400:
      // console.log("400 error")
      errorPermission();
      break;
    case 404:
      Store.errortext404 = "The Status does not exist";
      Store.errorPage404 = true;
      // console.log("404 error")
      errorPermission();
      break;
    case 403:
      Store.errorPage403 = true;
      // console.log("403 error")
      errorPermission();
      break;
    default:
      break;
  }

  Store.collaborate.forEach((collab) => {
    if (collab.status === "ACCEPTED") {
      acceptBoard.push(collab);
    }
  });
  extractGroupBoard();
}

function extractGroupBoard() {
  console.log(Store.boards);

  
  boardSideBarPersonal.value.push(...PersonalBoard.value);
  boardSideBarPublic.value.push(...OtherBoard.value);
  boardSideBarCollab.value.push(...acceptBoard);
  console.log(boardSideBarPublic.value);
  //   console.log(PersonalBoard.value);
  //   console.log(OtherBoard.value);
}
// =======================================================================================================================

// ======================= Remove function ===============================================================================

async function removeStatus() {
  openConfirmed.value = false;

  const checkTaskUseStatus = Store.tasks.filter(
    (task) => task.statusName === removeName.value
  );

  if (removeName.value === "No Status" || removeName.value === "Done") {
    Store.errorDeleteNoStatus = true;
    // console.log(removeName.value)
    openStatuses(route.params.id);
    return;
  }
  if (checkTaskUseStatus.length === 0) {
    Store.statuses = Store.statuses.filter(
      (status) => status.statusId !== removeId.value
    );

    const result = await removeData(
      `boards/${route.params.id}/statuses/${removeId.value}`
    );
    // console.log(result);

    if (checkOwner() && checkAuthToken()) {
      if (result.status === 401) {
        router.push({ name: "login" });
        Store.errorToken = true;
      }
      if (result.status === 404) {
        errorDeleteStatus.value = true;
      } else {
        successDeleteStatus.value = true;
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
  } else {
    transferModal.value = true;
  }
  openConfirmed.value = false;
}

async function removeStatusTransfer(data) {
  const { removeStatus, transferStatus } = data;
  const transferStatusId = Store.statuses.find(
    (status) => status.name === transferStatus
  ).statusId;

  // ลบข้อมูลสถานะที่ถูกโอนย้าย
  let removedStatus = await removeData(
    `boards/${route.params.id}/statuses/${removeId.value}/${transferStatusId}`
  );

  // อัปเดตสถานะของ tasks
  const tasksToTransfer = Store.tasks.filter(
    (task) => task.statusName === removeStatus
  );

  if (tasksToTransfer.length > 0) {
    for (const task of tasksToTransfer) {
      task.statusName = transferStatus;
    }
  }
  Store.statuses = Store.statuses.filter(
    (status) => status.statusId !== removeId.value
  );
  transferModal.value = false;

  if (checkOwner() && checkAuthToken()) {
    if (removedStatus.status === 401) {
      router.push({ name: "login" });
      Store.errorToken = true;
    }
    if (removedStatus.status === 404) {
      errorDeleteStatus.value = true;
    } else {
      transferModal.value = false;
    }
  } else {
    if (removedStatus.status === 403) {
      Store.errorPage403 = true;
      errorPermission();
    }
    if (removedStatus.status === 401) {
      Store.errorPage401 = true;
      errorPermission();
    }
  }
}

// ================= Open/Close Page Function ===========================================================================

function goBack() {
  router.push({ name: "BoardTask" });
}

function openCreateStatus() {
  router.push({ name: "createStatus" });
}

function openStatuses(id) {
  router.push({ name: "Status", params: { id } });
  boardId.value = id;
}

function openStatusDetail(statusId, statusName) {
  if (statusName === "No Status" || statusName === "Done") {
    Store.errorEditDefaultStatus = true;
  } else {
    router.push({
      name: "editStatus",
      params: { id: boardId.value, statusId: statusId },
    });
  }
}

function openConfirmModal(id, name) {
  openConfirmed.value = true;
  removeName.value = name;
  removeId.value = id;
}

function closeNotificationModal() {
  Store.successAddStatus = false;
  Store.successUpdateStatus = false;
  Store.errorUpdateStatus = false;
  Store.errorNotfoundStatus = false;
  successDeleteStatus.value = false;
  errorDeleteStatus.value = false;
  Store.successUpdateTask = false;
  Store.errorUpdateTask = false;
  openConfirmed.value = false;
  transferModal.value = false;
  Store.errorDeleteNoStatus = false;
  Store.errorEditDefaultStatus = false;
  removeId.value = "";
  removeName.value = "";
}

function errorPermission() {
  router.push({ name: "notFound" });
}

// =======================================================================================================================

// ====================== Orther Fucntion ================================================================================

function getBoardName() {
  const board =
    Store.boards.boards.find((board) => board.boardId === boardId.value) ||
    Store.boards.collaborate.find((board) => board.boardId === boardId.value);
  if (board) {
    boardName.value = board.board_name;
  }
}

function findUsageStatus(name) {
  let usageCount = 0;
  for (const task of Store.tasks) {
    if (task.statusName == name) {
      usageCount++;
    }
  }
  return usageCount;
}

// =======================================================================================================================

function checkVariable() {
  if (
    Store.successAddStatus == true ||
    Store.successUpdateStatus == true ||
    Store.errorUpdateStatus == true ||
    Store.errorNotfoundStatus == true ||
    successDeleteStatus.value === true ||
    errorDeleteStatus.value === true ||
    Store.errorDeleteNoStatus == true ||
    Store.errorEditDefaultStatus == true
  ) {
    return true;
  }
  return false;
}
</script>

<template>
  <modalNotification
    :successDeleteStatus="successDeleteStatus"
    :errorDeleteStatus="errorDeleteStatus"
    @closemodal="closeNotificationModal()"
    v-show="checkVariable()"
    class="z-30"
  />
  <modalstatusDelete
    v-show="openConfirmed"
    :statusName="removeName"
    @closemodal="closeNotificationModal()"
    @confirmed="removeStatus()"
    class="z-40"
  />
  <modalTransfer
    :statusName="removeName"
    v-show="transferModal"
    @closemodal="closeNotificationModal()"
    @confirmed="removeStatusTransfer($event), (successDeleteStatus = true)"
  >
  </modalTransfer>

  <div class="class name : itbkk-modal-task w-screen bg-white h-screen flex">
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
      <!-- Topic -->
      <!-- respon -->
      <div
        class="flex justify-between text-white text-xs sm:text-sm md:text-sm lg:text-lg"
      >
        <div
          class="text-xs sm:text-lg md:text-2xl font-bold text-black flex w-auto ml-2 lg:ml-16 mt-10"
        >
          <h1>{{ checkAuthToken() ? username : "Login" }}</h1>
          <div class="flex items-center justify-center">
            <ChevronDoubleRightIcon class="size-7" />
          </div>
          <h1>{{ boardName }}</h1>
          <div class="flex items-center justify-center">
            <ChevronDoubleRightIcon class="size-7" />
          </div>

          <p>Statuses Lists</p>
        </div>
        <button
          class="itbkk-button-add mt-5 flex md:text-white items-center justify-center h-14 md:w-40 rounded-xl tooltip tooltip-left"
          :data-tip="
            boardIsmycollab || checkOwner()
              ? 'Create your status.'
              : 'You do not have permission to use this feature.'
          "
          @click=" boardIsmycollab || checkOwner() ? openCreateStatus() : ''"
            :class="{
              'bg-orange-500': boardIsmycollab || checkOwner(),
              'bg-gray-400': !boardIsmycollab && !checkOwner() ,
              'cursor-not-allowed': !checkOwner() && !boardIsmycollab,
              'cursor-pointer': checkOwner() || boardIsmycollab,
            }"          
        >
          <PlusIcon class="size-7" />
          <p
            class="pl-2 hidden md:block"         
          >
            Create Status
          </p>
        </button>
      </div>

      <div class="flex flex-col mt-10 ml-2 lg:ml-16 w-full lg:w-5/6">
        <!-- Table Header -->
        <div class="bg-gray-100 p-4 rounded-t-lg shadow-md">
          <div class="grid grid-cols-4 gap-4 text-xs md:text-sm lg:text-xl">
            <h3 class="font-bold">ID</h3>
            <h3 class="font-bold">Name</h3>
            <h3 class="font-bold">Description</h3>
            <h3 class="font-bold">Usage</h3>
          </div>
        </div>
        <!-- Table Body -->
        <div
          v-for="(status, index) in Store.statuses"
          :key="index"
          class="itbkk-item bg-white rounded-b-lg shadow-md mb-2 text-xs sm:text-sm md:text-sm lg:text-lg"
        >
          <div class="grid grid-cols-4 gap-4 p-4">
            <p @click="openStatusDetail(status.statusId, status.name)">
              {{ index + 1 }}({{ status.statusId }})
            </p>
            <p
              class="itbkk-status-name itbkk-button-edit break-words"
              @click="openStatusDetail(status.statusId, status.name)"
            >
              {{ status.name }}
            </p>
            <p
              @click="openStatusDetail(status.statusId, status.name)"
              class="break-words"
              :class="{
                'italic text-gray-400': !status.description,
                'itbkk-assignees': !status.description,
              }"
            >
              {{
                !status.description
                  ? "No description provided"
                  : status.description
              }}
            </p>
            <div class="flex justify-between">
              <p>({{ findUsageStatus(status.name) }})</p>
              <div
                class="itbkk-button-delete tooltip tooltip-top"
                :class="{
                  'cursor-not-allowed': !checkAuthToken(),
                  'cursor-pointer': checkAuthToken(),
                }"
                :disabled="!checkAuthToken()"
                :data-tip="
                  checkAuthToken()
                    ? 'Delete your status.'
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
                  :disabled="!checkAuthToken()"
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
        v-show="Store.statuses.length === 0"
        class="w-full flex justify-center mt-16"
      >
        <tr>
          <td class="text-center" colspan="6">Don't Have Status ?</td>
        </tr>
      </tbody>
    </main>
  </div>
  <router-view />
</template>

<style scoped></style>
