<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "@/stores/store.js";
import {
  getDataByBoard,
  getAllBoard,
  PatchData,
  removeData,
} from "@/libs/fetchs.js";
import Cookies from "js-cookie";
import {
  checkAuthToken,
  checkUserInAuthToken,
  checkrequestNewToken,
} from "@/libs/authToken.js";
import modalNotification from "@/components/modals/modalNotification.vue";
import boardCollabChangeAccessRight from "@/components/collab/modalCollabChangeAccessRight.vue";
import boardCollabRemove from "@/components/collab/modalConfirmedDeleteCollab.vue";
import sidebarV2 from "./sidebarV2.vue";
import {
  ArrowUturnLeftIcon,
  ChevronDoubleRightIcon,
  PlusIcon,
} from "@heroicons/vue/24/solid";

const Store = useStore();
const router = useRouter();
const route = useRoute();
const boardId = ref(route.params.id);
let userLogin = Cookies.get("oid");
const boardName = ref("");
const openConfirmedAccessRight = ref(false);
const openConfirmedRemove = ref(false);
let resultAllBoard = {};
let CollabDetail = ref({});
let CollabRemove = ref({});
let accessRightList = ref(["read", "write"]);
let boardSideBarPersonal = ref([]);
let boardSideBarCollab = ref([]);
let boardSideBarPublic = ref([]);
let PersonalBoard = ref([]);
let OtherBoard = ref([]);
let acceptBoard = [];

function checkOwner() {
  const boardsArray = Array.isArray(Store.boards) ? Store.boards : [];
  const collaborateArray = Array.isArray(Store.collaborate)
    ? Store.collaborate
    : [];

  const foundBoard =
    boardsArray.find((board) => board.boardId === boardId.value) ||
    collaborateArray.find((board) => board.boardId === boardId.value);
  if (foundBoard) {
    const userInboard = foundBoard.owner.oid;
    return checkUserInAuthToken(userInboard, userLogin);
  }
  return false;
}

async function fetchData() {
  let endpoint = "boards";
  let resultColab = await getAllBoard(`boards/${boardId.value}/collabs`);
  let resStatuses = await getDataByBoard(`${boardId.value}/statuses`);
  resultAllBoard = await getAllBoard(endpoint);

  Store.collaborate = resultColab.collaborators;
  Store.boards = [...resultAllBoard.boards];
  Store.statuses = resStatuses;

  for (let i = 0; i < resultAllBoard.boards.length; i++) {
    if (resultAllBoard.boards[i].owner.oid === userLogin) {
      PersonalBoard.value.push(resultAllBoard.boards[i]);
    }
    if (
      resultAllBoard.boards[i].owner.oid !== userLogin &&
      resultAllBoard.boards[i].visibility === "public"
    ) {
      OtherBoard.value.push(resultAllBoard.boards[i]);
    }
  }
  for (let i = 0; i < resultAllBoard.collaborate.length; i++) {
    if (resultAllBoard.collaborate[i].visibility === "public") {
      OtherBoard.value.push(resultAllBoard.collaborate[i]);
    }
  }

  resultAllBoard.collaborate.forEach((collab) => {
    if (collab.status === "ACCEPTED") {
      acceptBoard.push(collab);
    }
  });

  errorDetection(resultColab.status);
  extractGroupBoard();
}

async function changeAccessRight() {
  let indexToUpdate = -1;
  for (let i = 0; i < Store.collaborate.length; i++) {
    if (Store.collaborate[i].boardsId === boardId.value) {
      indexToUpdate = i;
      // break;
    }
  }
  if (indexToUpdate !== -1) {
    Store.collaborate[indexToUpdate].accessRight =
      CollabDetail.value.accessRight;
  }
  closeNotificationModal();
}

async function patchAccessRight() {
  checkrequestNewToken(router);

  let result = await PatchData(
    `boards/${boardId.value}/collabs/invitations/${CollabDetail.value.oid}`,
    {
      accessRight: CollabDetail.value.accessRight,
    }
  );

  if (
    checkAuthToken() &&
    checkUserInAuthToken(CollabDetail.value.oid, userLogin)
  ) {
    errorDetection(result.status);
    if (result.status === 200) {
      changeAccessRight();
    }
  } else {
    errorDetection(result.status);
  }

  closeNotificationModal();
}

function getBoardName() {
  const board =
    resultAllBoard.boards.find((b) => b.boardId === boardId.value) ||
    resultAllBoard.collaborate.find((b) => b.boardId === boardId.value);
  if (board) {
    boardName.value = board.board_name;
  } else {
    console.log("ไม่พบบอร์ด");
    boardName.value = "";
  }
}

function errorPermission() {
  router.push({ name: "notFound" });
}
function goBack() {
  router.push({ name: "BoardTask" });
}
function openCreateCollabUser() {
  fetchData();
  router.push({ name: "createCollab", params: { id: boardId.value } });
}

function checkVariable() {
  if (Store.errorPage409 == true) {
    return true;
  }
  return false;
}
function closeNotificationModal() {
  openConfirmedAccessRight.value = false;
  openConfirmedRemove.value = false;
  Store.errorPage409 = false;
  fetchData();
}
function openConfirmAccessRightModal(collab) {
  const foundBoard = Store.boards.find(
    (board) => board.boardId === boardId.value
  );
  if (
    checkAuthToken() &&
    checkUserInAuthToken(foundBoard.owner.oid, userLogin)
  ) {
    CollabDetail.value = collab;
    openConfirmedAccessRight.value = true;
    // openConfirmed.value = true
  } else {
    // errorPermission()
  }
}

function openConfirmDeleteCollabModal(collab) {
  const foundBoard = Store.boards.find(
    (board) => board.boardId === boardId.value
  );
  if (
    checkAuthToken() &&
    checkUserInAuthToken(foundBoard.owner.oid, userLogin)
  ) {
    CollabRemove.value = collab;
    openConfirmedRemove.value = true;
    // openConfirmed.value = true
  } else {
    // errorPermission()
  }
}
async function removeCollabUser() {
  if (checkAuthToken()) {
    let collabBoard;

    if (CollabRemove.value.status === "PENDING") {
      collabBoard = await removeData(
        `boards/${CollabRemove.value.boardsId}/collabs/invitations/${CollabRemove.value.oid}`
      );
    } else if (CollabRemove.value.status === "ACCEPTED") {
      collabBoard = await removeData(
        `boards/${CollabRemove.value.boardsId}/collabs/${CollabRemove.value.oid}`
      );
    }
    errorDetection(collabBoard.status);
  }

  closeNotificationModal();
}

function handleAccessRightChange() {
  if (!checkOwner() || !checkAuthToken()) {
    return true;
  } else {
  }
}

function handleDeleteCollab() {
  if (!checkOwner() || !checkAuthToken()) {
    return true;
  } else {
  }
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

function errorDetection(status) {
  switch (status) {
    case 401:
      router.push({ name: "login" });
      Store.errorToken = true;
      break;
    case 400:
      // console.log("400 error")
      errorPermission();
      break;
    case 404:
      Store.errortext404 = "The Colabulate does not exist";
      Store.errorPage404 = true;
      // console.log("404 error");
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
}

watch(
  boardId,
  async (newBoardId) => {
    if (newBoardId) {
      await fetchData();
      getBoardName();
    }
  },
  { immediate: true }
);
onMounted(() => {
  // fetchData()
});
</script>
<template>
  <div class="w-screen bg-white h-screen flex">
    <modalNotification
      @closemodal="closeNotificationModal()"
      v-show="checkVariable()"
      class="z-30"
    />
    <boardCollabChangeAccessRight
      v-show="openConfirmedAccessRight"
      :changeAccessRight="CollabDetail"
      @closemodal="closeNotificationModal()"
      @confirmed="patchAccessRight()"
      class="z-40"
    />
    <boardCollabRemove
      v-show="openConfirmedRemove"
      :removeCollab="CollabRemove"
      @closemodal="closeNotificationModal()"
      @confirmed="removeCollabUser()"
      class="z-40"
    />
    <sidebarV2
      :boardsPersonal="boardSideBarPersonal"
      :boardsCollab="boardSideBarCollab"
      :boardsPublic="boardSideBarPublic"
    />
    <!-- back button -->
    <div
      class="fixed right-0 bottom-0 mt-3 flex bg-orange-400 items-center justify-center h-14 w-20 rounded-xl cursor-pointer"
      @click="goBack()"
    >
      <ArrowUturnLeftIcon class="size-7 text-white" />
      <p class="pl-2 text-white">Back</p>
    </div>

    <!-- Table สำหรับแสดงข้อมูลของ board -->
    <main class="h-full w-full overflow-y-scroll">
      <!--TOPIC-->
      <div
        class="flex justify-between text-white text-xs sm:text-sm md:text-sm lg:text-lg"
      >
        <div
          class="text-xs sm:text-lg md:text-2xl font-bold text-black flex w-auto ml-2 lg:ml-16 mt-10"
        >
          <h1 class="itbkk-board-name">{{ boardName }}</h1>
          <div class="flex items-center justify-center">
            <ChevronDoubleRightIcon class="size-7" />
          </div>
          <p>Collaborator</p>
        </div>
        <button
          class="itbkk-button-add right-0 mt-5 flex text-orange-400 md:text-white md:bg-orange-400 items-center justify-center h-14 md:w-40 rounded-xl tooltip tooltip-left"
          :data-tip="
            checkAuthToken() && checkOwner()
              ? 'Add user in Collaborate.'
              : 'You do not have permission to use this feature.'
          "
          @click="openCreateCollabUser"
          :disabled="!checkAuthToken() || !checkOwner()"
        >
          <PlusIcon class="size-7" />
          <p class="pl-2 hidden md:block">Add User</p>
        </button>
      </div>

      <div class="flex justify-between"></div>
      <!--Table-->
      <div class="flex flex-col mt-5 ml-2 lg:ml-16 w-full lg:w-5/6">
        <!-- Table Header -->
        <div class="bg-gray-100 p-4 rounded-t-lg shadow-md">
          <div class="grid grid-cols-7 gap-5 text-xs md:text-sm lg:text-xl">
            <h3 class="font-bold flex justify-center">No</h3>
            <h3 class="font-bold flex justify-center">Name</h3>
            <h3 class="font-bold flex justify-center col-span-2">Email</h3>
            <h3 class="font-bold flex justify-center">Access Rights</h3>
            <h3 class="font-bold flex justify-center">Action</h3>
            <h3 class="font-bold flex justify-center">Status</h3>
          </div>
        </div>
        <!-- Table Body -->
        <div
          v-for="(collab, index) in Store.collaborate"
          :key="index"
          class="flex flex-col"
        >
          <div class="grid grid-cols-7 gap-5 mt-5">
            <p class="itbkk-item flex justify-center">{{ index + 1 }}</p>
            <p class="itbkk-name flex justify-center">{{ collab.name }}</p>
            <p class="itbkk-email flex justify-center col-span-2">
              {{ collab.email }}
            </p>
            <!-- <p class="itbkk-access-right flex justify-center" @click="openConfirmAccessRightModal(collab)">{{ collab.accessRight }}</p> -->

            <select
              v-model="collab.accessRight"
              class="itbkk-access-right h-8 rounded-lg border-2 pl-2"
              :disabled="handleAccessRightChange()"
              @change="
                checkOwner() && checkAuthToken()
                  ? openConfirmAccessRightModal(collab)
                  : ''
              "
            >
              <option
                v-for="right in accessRightList"
                :key="right"
                :value="right"
              >
                {{ right }}
              </option>
            </select>

            <button
              class="itbkk-collab-remove flex justify-center w-3/5 text-[12px] rounded-2xl btn btn-error tooltip tooltip-top"
              :data-tip="
                checkAuthToken() && checkOwner()
                  ? 'remove user'
                  : 'You do not have permission to use this feature.'
              "
              :disabled="handleDeleteCollab()"
              @click="
                checkOwner() && checkAuthToken()
                  ? openConfirmDeleteCollabModal(collab)
                  : ''
              "
            >
              Remove
            </button>
            <h3 class="font-bold flex justify-center">{{ collab.status }}</h3>
          </div>
        </div>
      </div>

      <tbody
        v-show="Store.collaborate.length == 0"
        class="w-full flex justify-center mt-16"
      >
        {{
          Store.collaborate
        }}
        <tr>
          <td class="text-center" colspan="6">Don't Have collaborate ?</td>
        </tr>
      </tbody>
    </main>
  </div>
  <router-view />
</template>
<style scoped></style>
