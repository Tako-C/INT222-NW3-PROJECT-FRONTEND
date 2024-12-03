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
import boardCollabChangeAccessRight from "@/components/collab/modalCollabChangeAccessRight.vue";
import boardCollabRemove from "@/components/collab/modalConfirmedDeleteCollab.vue";
import modalAcceptInvite from "./modalAcceptInvite.vue";
import boardSlidebar from "../boards/boardSlidebar.vue";
import sidebarV2 from "../boards/sidebarV2.vue";

const Store = useStore();
const router = useRouter();
const route = useRoute();
const isBoardPage = computed(() => route.path.startsWith("/board"));
const isStatusPage = computed(() =>
  route.path.startsWith(`/board/${boardId.value}/status`)
);
const username = ref(Cookies.get("name"));
const isTaskDropdownOpen = ref(false);
const isStatusDropdownOpen = ref(false);
const boardId = ref(route.params.id);
let userLogin = Cookies.get("oid");
let userToken = ref();
const boardName = ref("");
const openConfirmedAccessRight = ref(false);
const openConfirmedRemove = ref(false);
let openAcceptInvitation = ref(false);
let resultAllBoard = {};
let CollabDetail = ref({});
let CollabRemove = ref({});
let boardSideBarPersonal = ref([])
let boardSideBarCollab = ref([])
let boardSideBarPublic = ref([])
let PersonalBoard = ref([]);
let OtherBoard = ref([]);
let acceptBoard = [];
let pendingBoard = [];
// function checkOwner() {
//   const boardsArray = Array.isArray(Store.boards) ? Store.boards : [];
//   const collaborateArray = Array.isArray(Store.collaborate)
//     ? Store.collaborate
//     : [];

//   const foundBoard =
//     boardsArray.find((board) => board.boardId === boardId.value) ||
//     collaborateArray.find((board) => board.boardId === boardId.value);
//   //   console.log(Store.boards)

//   if (foundBoard) {
//     const userInboard = foundBoard.owner.oid;
//     return checkUserInAuthToken(userInboard, userLogin);
//   }
//   return false;
// }

let invite = ref();
async function fetchData() {
  let endpoint = "boards";
  let resBoards = await getAllBoard("boards")

  Store.boards = resBoards.boards
  Store.collaborate = resBoards.collaborate

  Store.collaborate.forEach((collab) => {
      if (collab.status === "ACCEPTED") {
        acceptBoard.push(collab);
      }else if (collab.status === "PENDING") {
        pendingBoard.push(collab);
        console.log(pendingBoard)
      }
    });
    extractGroupBoard()
//   let resultColab = await getAllBoard(`boards/${boardId.value}/collabs`);
//   let resStatuses = await getDataByBoard(`${boardId.value}/statuses`);
  // let resBoards = await getAllBoard(endpoint)
  // resultAllBoard = await getAllBoard(endpoint);
//   console.log(resultColab);
  // console.log(resultAllBoard);

//   Store.collaborate = resultColab.collaborators;
  // Store.collaborate = resultAllBoard.collaborate;
  // console.log(Store.collaborate)
//   Store.statuses = resStatuses;
  // console.log(resultAllBoard)
  // console.log(Store.statuses)
//   console.log(Store.boards);
//   console.log(Store.collaborate);

// ตรวจสอบว่ามีค่าเริ่มต้นให้ invite.value หรือไม่
//   for (let i = 0; i < Store.collaborate.length; i++) {
//     console.log(Store.collaborate[i].token);
//     if (userLogin === Store.collaborate[i].oid) {
//       userToken.value = Store.collaborate[i].token;
//       console.log(userToken);
//       console.log(userLogin);
//     }
//   }

//   for (let i = 0; i < Store.collaborate.length; i++) {
//     console.log(Store.collaborate);
//     if (Store.collaborate[i].oid === userLogin) {
//       console.log(Store.collaborate[i].accessRight);
//       invite.value = Store.boards.collaborate.map((collab) => {
//         if (collab.boardId === boardId.value) {
//           return { ...collab, accessRight: Store.collaborate[i].accessRight };
//         }
//         return collab;
//       }).filter(collab => (
//       collab.boardId === boardId.value
//   ))
//     }
//   }
// invite.value = Store.boards.collaborate.map(collab => ({
//     ...collab
// }));

//   console.log(invite.value.accessRight);
  // invite.value = Store.boards.collaborate.filter(collab => collab.boardId === boardId.value).map(collab => ({
  //     ...collab
  // }))

//   console.log(invite.value);
  // if (!resultAllBoard.collaborate) {
  // }else{
  //     checkPublicCollab(resultAllBoard.collaborate)
  // }

//   switch (resultColab.status) {
//     case 401:
//       router.push({ name: "login" });
//       Store.errorToken = true;
//       break;
//     case 400:
//       // console.log("400 error")
//       errorPermition();
//       break;
//     case 404:
//       Store.errortext404 = "The Colabulate does not exist";
//       Store.errorPage404 = true;
//       console.log("404 error");
//       errorPermition();
//       break;
//     case 403:
//       Store.errorPage403 = true;
//       // console.log("403 error")
//       errorPermition();
//       break;
//     default:
//       break;
//   }
}
function extractGroupBoard() {
    console.log(Store.boards)
  PersonalBoard.value = Store.boards.filter(
    (board) => board.owner.oid === userLogin
  );
  OtherBoard.value = Store.boards.filter(
    (board) => board.owner.oid != userLogin
  );
  boardSideBarPersonal.value.push(...PersonalBoard.value)
  boardSideBarPublic.value.push(...OtherBoard.value)
  boardSideBarCollab.value.push(...acceptBoard)
  console.log(boardSideBarPublic.value)
  //   console.log(PersonalBoard.value);
  //   console.log(OtherBoard.value);
}
function getBoardName() {
  const board =
    resultAllBoard.boards.find((b) => b.boardId === boardId.value) ||
    resultAllBoard.collaborate.find((b) => b.boardId === boardId.value);
  if (board) {
    // console.log(board)
    boardName.value = board.board_name;
  } else {
    console.log("ไม่พบบอร์ด");
    boardName.value = "";
  }
  // console.log(board)
  // console.log(resultAllBoard)
}

function errorPermition() {
  router.push({ name: "notFound" });
}

function toggleTaskDropdown() {
  isTaskDropdownOpen.value = !isTaskDropdownOpen.value;
}

function toggleStatusDropdown() {
  isStatusDropdownOpen.value = !isStatusDropdownOpen.value;
  // checkFirstStatuses()
}

function openBoardTasks(id) {
  router.push({ name: "BoardTask", params: { id } });
  // Update the boardId ref to trigger data fetch
  boardId.value = id;
}

function openBoards() {
  router.push({ name: "Board" });
}
function goBack() {
  router.go(-1);
}
async function logOut() {
  router.push({ name: "login" });
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
  openAcceptInvitation = false;
  Store.errorPage409 = false;
  fetchData();
}

async function removeCollabUser() {
  console.log("remove collab");
  // let collabBoard = await removeData(`boards/${CollabRemove.value.boardsId}/collabs/${CollabRemove.value.oid}`)

  // closeNotificationModal()
  console.log(CollabRemove.value);

  if (checkAuthToken()) {
    let collabBoard = await removeData(
      `boards/${CollabRemove.value.boardsId}/collabs/${CollabRemove.value.oid}`
    );
    if (checkUserInAuthToken(userLogin, CollabRemove.value.oid)) {
      if (collabBoard.status === 401) {
        router.push({ name: "login" });
        Store.errorToken = true;
      }
      if (collabBoard.status === 404) {
        errorPermition();
        Store.errorPage404 = true;
      }
      closeNotificationModal();
    } else {
      if (collabBoard.status === 403) {
        Store.errorPage403 = true;
        errorPermition();
      }

      closeNotificationModal();
    }
  }
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

let infoInvite = ref({});

async function modalAccept(info) {
  checkrequestNewToken(router)
  infoInvite.value = info;
  console.log(infoInvite.value)
  getToken(info.boardId)
  

  infoInvite.value = {...info,
    boardId: infoInvite.value.boardId,
    token: null,
  };


  console.log(infoInvite.value)
  openAcceptInvitation = true;
}

async function getToken(id) {
    let resultColab = await getAllBoard(`boards/${id}/collabs`);
    console.log(resultColab.collaborators)
    for (let i = 0; i < resultColab.collaborators.length; i++) {
        
        if(resultColab.collaborators[i].oid === userLogin) {
            // console.log(userLogin)
            // console.log(resultColab.collaborators[i])
            infoInvite.value.token = resultColab.collaborators[i].token,
            console.log(infoInvite.value)
        }
   
    }
}

async function acceptInvite() {
  checkrequestNewToken(router);
  console.log(Store.errorToken);
  console.log(checkAuthToken);

  if(checkAuthToken) {
  let resultRemove = await accept(
    `boards/${infoInvite.value.boardId}/collabs/invitations/accept?token=${infoInvite.value.token}`
  );
  console.log(resultRemove);
  console.log(infoInvite.value.boardId, infoInvite.value.token)
  // closeNotificationModal()
  router.push({ name: "BoardTask", params: { id: infoInvite.value.boardId } });
  } else {
      console.Console.log("Mai dai")
  }
}
async function declineInvite() {
  checkrequestNewToken(router)

  if (checkAuthToken) {
    console.log(infoInvite.value.boardId);
    console.log(userToken.value);
    let resultRemove = await accept(
      `boards/${infoInvite.value.boardId}/collabs/invitations/decline?token=${infoInvite.value.token}`
    );
    // console.log(resultRemove)
  } else {
    console.log("Mai dai");
  }

  // closeNotificationModal()
  // router.push({ name: "Board"});
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
  checkrequestNewToken(router)
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
      @closemodal="declineInvite(),checkrequestNewToken(route)"
      @confirmed="acceptInvite(),checkrequestNewToken(route)"
      class="z-40"
    />
    <sidebarV2 
      class="w-1/4 bg-gray-200 h-full"
      :boardsPersonal="boardSideBarPersonal"
      :boardsCollab="boardSideBarCollab"
      :boardsPublic="boardSideBarPublic"
      />

    <!-- Table สำหรับแสดงข้อมูลของ board -->
    <main class="h-full w-full overflow-y-scroll">
      <!--TOPIC-->
      <div class="flex justify-between text-white">
        <div class="text-2xl font-bold text-black flex w-auto ml-16 mt-10">
          <h1 class="itbkk-board-name">{{ username }}</h1>
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
            <!-- <p class="itbkk-access-right flex justify-center" @click="openConfirmAccessRightModal(collab)">{{ collab.accessRight }}</p> -->

            <!-- <select v-model="collab.accessRight" class="itbkk-access-right h-8 rounded-lg border-2 pl-2" 
                        :disabled="handleAccessRightChange()"
                        @change="checkOwner() && checkAuthToken() ? openConfirmAccessRightModal(collab) : ''">
                            <option  v-for="right in accessRightList" :key="right" :value="right">
                                {{ right }}
                            </option>
                        </select> -->
            <p class="itbkk-email flex justify-center">
              {{ invitation.accessRight }}
            </p>
            <h3 class="font-bold flex justify-center">
              {{ invitation.status }}
            </h3>
            {{ console.log(invitation) }}
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
