<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "@/stores/store.js";
import {
  getDataByBoard,
  getAllBoard,
  PatchData,
  removeData,
  accept,
} from "@/libs/fetchs.js";
import Cookies from "js-cookie";
import {
  checkAuthToken,
  checkUserInAuthToken,
  checkrequestNewToken,
} from "@/libs/authToken.js";
import modalNotification from "@/components/modals/modalNotification.vue";
import boardCollabRemove from "@/components/collab/modalConfirmedDeleteCollab.vue";
import modalAcceptInvite from "./modalAcceptInvite.vue";
import sidebarV2 from "../boards/sidebarV2.vue";
import {
  ArrowUturnLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/vue/24/solid";

const Store = useStore();
const router = useRouter();
const route = useRoute();
const username = ref(Cookies.get("name"));
const boardId = ref(route.params.id);
let userLogin = Cookies.get("oid");
let userToken = ref();
const boardName = ref("");
const openConfirmedAccessRight = ref(false);
const openConfirmedRemove = ref(false);
let openAcceptInvitation = ref(false);
let resultAllBoard = {};
let CollabRemove = ref({});
let boardSideBarPersonal = ref([]);
let boardSideBarCollab = ref([]);
let boardSideBarPublic = ref([]);
let PersonalBoard = ref([]);
let OtherBoard = ref([]);
let acceptBoard = [];
let pendingBoard = [];

async function fetchData() {
  const resBoards = await getAllBoard("boards");

  if (resBoards.status >= 400) {
    errorDetection(resBoards.status);
    return;
  }

  Store.boards = resBoards.boards;
  Store.collaborate = resBoards.collaborate;

  Store.collaborate.forEach((collab) => {
    if (collab.status === "ACCEPTED") {
      acceptBoard.push(collab);
    } else if (collab.status === "PENDING") {
      pendingBoard.push(collab);
    }
  });

  extractGroupBoard();
}

function extractGroupBoard() {
  PersonalBoard.value = Store.boards.filter(
    (board) => board.owner.oid === userLogin
  );
  OtherBoard.value = Store.boards.filter(
    (board) => board.owner.oid != userLogin
  );
  boardSideBarPersonal.value.push(...PersonalBoard.value);
  boardSideBarPublic.value.push(...OtherBoard.value);
  boardSideBarCollab.value.push(...acceptBoard);
}
function getBoardName() {
  const board =
    resultAllBoard.boards.find((b) => b.boardId === boardId.value) ||
    resultAllBoard.collaborate.find((b) => b.boardId === boardId.value);
  if (board) {
    boardName.value = board.board_name;
  } else {
    boardName.value = "";
  }
}

function errorPermission() {
  router.push({ name: "notFound" });
}
function goBack() {
  router.push({ name: "Board" });
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
  openAcceptInvitation = false;
  Store.errorPage409 = false;
  fetchData();
}

async function removeCollabUser() {
  if (checkAuthToken()) {
    const collabBoard = await removeData(
      `boards/${CollabRemove.value.boardsId}/collabs/${CollabRemove.value.oid}`
    );

    if (!collabBoard || collabBoard.status >= 400) {
      errorDetection(collabBoard?.status);
      return;
    }

    if (checkUserInAuthToken(userLogin, CollabRemove.value.oid)) {
      closeNotificationModal();
    } else {
      errorDetection(collabBoard.status);
    }
  }
}

let infoInvite = ref({});

async function modalAccept(info) {
  checkrequestNewToken(router);
  infoInvite.value = info;
  getToken(info.boardId);

  infoInvite.value = {
    ...info,
    boardId: infoInvite.value.boardId,
    token: null,
  };
  openAcceptInvitation = true;
}

async function getToken(id) {
  let resultColab = await getAllBoard(`boards/${id}/collabs`);
  for (let i = 0; i < resultColab.collaborators.length; i++) {
    if (resultColab.collaborators[i].oid === userLogin) {
      infoInvite.value.token = resultColab.collaborators[i].token;
    }
  }
}

async function acceptInvite() {
  checkrequestNewToken(router);
  if (checkAuthToken) {
    const resultRemove = await accept(
      `boards/${infoInvite.value.boardId}/collabs/invitations/accept?token=${infoInvite.value.token}`
    );

    if (!resultRemove || resultRemove.status >= 400) {
      errorDetection(resultRemove?.status);
      return;
    }
    router.push({
      name: "BoardTask",
      params: { id: infoInvite.value.boardId },
    });
  } else {
  }
}

async function declineInvite() {
  checkrequestNewToken(router);

  if (checkAuthToken) {
    let resultRemove = await accept(
      `boards/${infoInvite.value.boardId}/collabs/invitations/decline?token=${infoInvite.value.token}`
    );
  }

  // closeNotificationModal()
  router.push({ name: "Board" });
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
      console.log("404 error");
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
      // console.log(boardName.value);
    }
  },
  { immediate: true }
);
onMounted(() => {
  checkrequestNewToken(router);
  fetchData();
});
</script>
<template>
  <div class="w-screen bg-white h-screen flex">
    <modalNotification
      @closemodal="closeNotificationModal()"
      v-show="checkVariable()"
      class="z-30"
    />
    <boardCollabRemove
      v-show="openConfirmedRemove"
      :removeCollab="CollabRemove"
      @closemodal="closeNotificationModal()"
      @confirmed="removeCollabUser()"
      class="z-40"
    />
    <modalAcceptInvite
      :Invitation="infoInvite"
      v-show="openAcceptInvitation"
      @closemodal="declineInvite(), checkrequestNewToken(route)"
      @confirmed="acceptInvite(), checkrequestNewToken(route)"
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
      <div class="flex justify-between text-white">
        <div class="text-2xl font-bold text-black flex w-auto ml-16 mt-10">
          <h1 class="itbkk-board-name">{{ username }}</h1>
          <div class="flex items-center justify-center">
            <ChevronDoubleRightIcon class="size-7" />
          </div>
          <p>Invitations</p>
        </div>
      </div>

      <div class="flex justify-between"></div>
      <!--Table-->
      <div class="flex flex-col mt-5 ml-16 w-5/6">
        <!-- Table Header -->
        <div class="bg-gray-100 p-4 rounded-t-lg shadow-md">
          <div class="grid grid-cols-6 gap-5">
            <h3 class="font-bold flex justify-center">No</h3>
            <h3 class="font-bold flex justify-center">Name</h3>
            <h3 class="font-bold flex justify-center col-span-2">Board</h3>
            <h3 class="font-bold flex justify-center">Access Rigths</h3>
            <h3 class="font-bold flex justify-center">Status</h3>
          </div>
        </div>
        <!-- Table Body -->
        <div
          v-for="(invitation, index) in pendingBoard"
          :key="invitation.boardId"
          v-show="invitation.status === 'PENDING'"
          class="flex flex-col"
        >
          <div
            class="grid grid-cols-6 gap-5 mt-5"
            @click="modalAccept(invitation)"
          >
            <p class="itbkk-item flex justify-center">{{ index + 1 }}</p>
            <p class="itbkk-name flex justify-center">
              {{ invitation.owner.name }}
            </p>
            <p class="itbkk-email flex justify-center col-span-2">
              {{ invitation.board_name }}
            </p>
            <p class="itbkk-email flex justify-center">
              {{ invitation.accessRight }}
            </p>
            <h3 class="font-bold flex justify-center">
              {{ invitation.status }}
            </h3>
          </div>
        </div>
      </div>

      <tbody
        v-show="resultAllBoard.collaborate == 0"
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
