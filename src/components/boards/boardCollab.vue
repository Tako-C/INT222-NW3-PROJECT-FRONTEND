<script setup>
import { ref, onMounted, watch, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useStore } from "@/stores/store.js"
import { getDataByBoard,getAllBoard,PatchData, removeData} from "@/libs/fetchs.js"
import Cookies from "js-cookie"
import { checkAuthToken,checkUserInAuthToken,checkrequestNewToken} from '@/libs/authToken.js'
import modalNotification from "@/components/modals/modalNotification.vue"
import boardCollabChangeAccessRight from "@/components/collab/modalCollabChangeAccessRight.vue"
import boardCollabRemove from "@/components/collab/modalConfirmedDeleteCollab.vue"
import boardSlidebar from "./boardSlidebar.vue"
import sidebarV2 from "./sidebarV2.vue"
 
const Store = useStore()
const router = useRouter()
const route = useRoute()
const isBoardPage = computed(() => route.path.startsWith("/board"))
const isStatusPage = computed(() =>
    route.path.startsWith(`/board/${boardId.value}/status`)
)
const username = ref(Cookies.get("name"))
const isTaskDropdownOpen = ref(false)
const isStatusDropdownOpen = ref(false)
const boardId = ref(route.params.id)
let userLogin = Cookies.get("oid")
const boardName = ref("")
const openConfirmedAccessRight = ref(false)
const openConfirmedRemove = ref(false)
let resultAllBoard = {}
let CollabDetail = ref({})
let CollabRemove = ref({})
let accessRightList = ref(['read','write'])
let boardSideBarPersonal = ref([])
let boardSideBarCollab = ref([])
let boardSideBarPublic = ref([])
let PersonalBoard = ref([]);
let OtherBoard = ref([]);
let acceptBoard = [];

function checkPublicCollab(resultAllBoard) {
    // console.log(resultAllBoard)
    const foundBoardPublic = resultAllBoard.find((board) => board.boardId === boardId.value)
    // console.log(foundBoardPublic)
    // console.log(boardId.value)
    if (foundBoardPublic != undefined &&foundBoardPublic.visibility ==="private") {
        Store.errorPage403 = true
            errorPermition()
    }
}
 
function checkOwner() {
    const boardsArray = Array.isArray(Store.boards) ? Store.boards : [];
    const collaborateArray = Array.isArray(Store.collaborate) ? Store.collaborate : [];

    const foundBoard = boardsArray.find((board) => board.boardId === boardId.value) 
                   || collaborateArray.find((board) => board.boardId === boardId.value);
//   console.log(Store.boards)
  
  if (foundBoard) {
      const userInboard = foundBoard.owner.oid  
      return checkUserInAuthToken(userInboard, userLogin)
  }
  return false
}

async function fetchData() {
    let endpoint = "boards"
    let resultColab = await getAllBoard(`boards/${boardId.value}/collabs`)
        let resStatuses = await getDataByBoard(`${boardId.value}/statuses`)
        let resBoards = await getAllBoard(endpoint)
        resultAllBoard = await getAllBoard(endpoint)
        console.log(resultColab);
        
        Store.collaborate = resultColab.collaborators
        Store.boards = [...resBoards.boards]
        Store.statuses = resStatuses
        // console.log(resultAllBoard)
        // console.log(Store.statuses)
        console.log(Store.boards)
        console.log(Store.collaborate)
        console.log(resultColab)

        
        // if (!resultAllBoard.collaborate) {    
        // }else{
        //     checkPublicCollab(resultAllBoard.collaborate)
        // } 
  
        
        switch (resultColab.status) {
        case 401:
            router.push({ name: "login" })
            Store.errorToken = true
            break
        case 400:
            // console.log("400 error")
            errorPermition()
            break
        case 404:
            Store.errortext404 = 'The Colabulate does not exist'
            Store.errorPage404 = true
            console.log("404 error")
            errorPermition()
            break
        case 403:
            Store.errorPage403 = true
            // console.log("403 error")
            errorPermition()
            break
        default:
            
            break
        }
        resBoards.collaborate.forEach((collab) => {
      if (collab.status === "ACCEPTED") {
        acceptBoard.push(collab);
      }
    });
        extractGroupBoard()
}

async function changeAccessRicht() {
    let indexToUpdate = -1
    for (let i = 0; i < Store.collaborate.length; i++) {
        if (Store.collaborate[i].boardsId === boardId.value) {
            indexToUpdate = i
            // break;
        }
    }
    if (indexToUpdate !== -1) {
        Store.collaborate[indexToUpdate].accessRight = CollabDetail.value.accessRight
    }
    closeNotificationModal()
}


async function patchAccessRicht() {
    
    checkrequestNewToken(router)

    let result = await PatchData(`boards/${boardId.value}/collabs/invitations/${CollabDetail.value.oid}`, {
        accessRight: CollabDetail.value.accessRight,
    })
    // console.log(visibilityBoard.value)
    
    if (
        checkAuthToken() &&
        checkUserInAuthToken(CollabDetail.value.oid, userLogin)
    ) {
        if (result.status === 401) {
            router.push({ name: "login" })
            Store.errorToken = true
        }
        if (result.status === 404) {
            errorPermition()
            Store.errorPage404 = true
        } 
        else {
            changeAccessRicht()
        }
    } else {
        if (result.status === 403) {
            Store.errorPage403 = true
            errorPermition()
        }
    }
    closeNotificationModal()
}


function getBoardName() {
    const board = resultAllBoard.boards.find((b) => b.boardId === boardId.value) || 
                    resultAllBoard.collaborate.find((b) => b.boardId === boardId.value);
    if (board) {
        // console.log(board)
        boardName.value = board.board_name
    } else {
        console.log('ไม่พบบอร์ด')
        boardName.value = ''
    }
    // console.log(board)
    // console.log(resultAllBoard)
    
}


function errorPermition() {
    router.push({ name: "notFound" })
}

function toggleTaskDropdown() {
    isTaskDropdownOpen.value = !isTaskDropdownOpen.value
}

function toggleStatusDropdown() {
    isStatusDropdownOpen.value = !isStatusDropdownOpen.value
    // checkFirstStatuses()
}

function openBoardTasks(id) {
    router.push({ name: "BoardTask", params: { id } })
    // Update the boardId ref to trigger data fetch
    boardId.value = id
}

function openBoards() {
    router.push({ name: "Board" })
}
function goBack(){
    router.push({name: 'BoardTask'});
}
async function logOut(){
    router.push({ name:'login'})
}
function openCreateCollabUser() {
    fetchData()
    router.push({ name: "createCollab", params: { id: boardId.value } });

}

function checkVariable() {
    if (
        Store.errorPage409 == true ) {
        return true
    }
    return false
}
function closeNotificationModal() {
    openConfirmedAccessRight.value = false
    openConfirmedRemove.value = false
    Store.errorPage409 = false
    fetchData()
    
}

// XD update
function openConfirmAccessRightModal(collab) {
    const foundBoard = Store.boards.find((board) => board.boardId === boardId.value)
    // console.log(collab);
    // console.log(foundBoard);
        // console.log(userLogin);
    if (checkAuthToken() && checkUserInAuthToken(foundBoard.owner.oid, userLogin)) {    
        // console.log(visibilityBoard.value.isCheck);
        CollabDetail.value = collab
        openConfirmedAccessRight.value = true
        // openConfirmed.value = true   
    } else {
        // errorPermition()
    }
}

function openConfirmDeleteCollabModal(collab) {
    const foundBoard = Store.boards.find((board) => board.boardId === boardId.value)
    console.log(collab)
    // console.log(foundBoard);
        // console.log(userLogin);
    if (checkAuthToken() && checkUserInAuthToken(foundBoard.owner.oid, userLogin)) {    
        // console.log(visibilityBoard.value.isCheck);
        CollabRemove.value = collab
        openConfirmedRemove.value = true
        // openConfirmed.value = true   
    } else {
        // errorPermition()
    }
}

// XD remove
async function removeCollabUser() {
    console.log('remove collab')
    // let collabBoard = await removeData(`boards/${CollabRemove.value.boardsId}/collabs/${CollabRemove.value.oid}`)

    // closeNotificationModal()
    console.log(CollabRemove.value);
    
    if (checkAuthToken()) {
        let collabBoard = await removeData(`boards/${CollabRemove.value.boardsId}/collabs/invitations/${CollabRemove.value.oid}`)
        if (checkUserInAuthToken(userLogin, CollabRemove.value.oid)) { 
            
            if (collabBoard.status === 401) {
                router.push({ name: "login" })
                Store.errorToken = true
            }
            if (collabBoard.status === 404) {
                errorPermition()
                Store.errorPage404 = true
            } 
            closeNotificationModal()
        } else {     
                if(collabBoard.status === 403) {
                Store.errorPage403 = true
                errorPermition()
            }    
           
            closeNotificationModal()
        }
    }
}


function handleAccessRightChange() {    
    if (!checkOwner() || !checkAuthToken()) {
      return true
    } else{}
}

function handleDeleteCollab() {  
    if (!checkOwner() || !checkAuthToken()) {
      return true
    } else{}
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

watch(
    boardId,
    async (newBoardId) => {
        if (newBoardId) {
            await fetchData()
            getBoardName()
            // console.log(boardName.value);
            
        }
    },
    { immediate: true }
)
onMounted(() => {
    // fetchData()
    
})
</script>
<template>
<div class=" w-screen bg-white h-screen flex">
    <modalNotification
        @closemodal="closeNotificationModal()"
        v-show="checkVariable()"
        class="z-30"
    />
    <boardCollabChangeAccessRight
        v-show="openConfirmedAccessRight"
        :changeAccessRight="CollabDetail"
        @closemodal="closeNotificationModal()"
        @confirmed="patchAccessRicht()"
        class="z-40"
    />
    <boardCollabRemove
        v-show="openConfirmedRemove"
        :removeCollab ="CollabRemove"
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
            <div class="flex justify-between text-white text-xs sm:text-sm md:text-sm lg:text-lg">
                <div
                    class="text-xs sm:text-lg md:text-2xl font-bold text-black flex w-auto ml-2 lg:ml-16 mt-10"
                >
                <h1 class="itbkk-board-name">{{ boardName }}</h1>
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
                    <p>Collaborator</p>
                </div>
                <button
                    class="itbkk-button-add right-0 mt-5 flex text-orange-400 md:text-white md:bg-orange-400 items-center justify-center h-14 md:w-40 rounded-xl tooltip tooltip-left"
                    :data-tip="checkAuthToken() && checkOwner() ? 'Add user in Collaborate.' : 'You do not have permission to use this feature.'"          
                    @click="openCreateCollabUser"
                    :disabled="!checkAuthToken() || !checkOwner()"
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
                    <p class="pl-2 hidden md:block">Add User</p>
                </button>
            </div>
 
            <div class="flex justify-between">
                        
            </div>
            <!--Table-->
            <div class=" flex flex-col mt-5 ml-2 lg:ml-16 w-full lg:w-5/6">
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
                <div v-for="(collab, index) in Store.collaborate"
                :key="index"
                class="flex flex-col"
                >
                    <div class="grid grid-cols-7 gap-5 mt-5">
                        <p class="itbkk-item flex justify-center">{{ index+1 }}</p>
                        <p class="itbkk-name flex justify-center">{{ collab.name }}</p>
                        <p class="itbkk-email flex justify-center col-span-2">{{ collab.email }}</p>
                        <!-- <p class="itbkk-access-right flex justify-center" @click="openConfirmAccessRightModal(collab)">{{ collab.accessRight }}</p> -->
                        
                        <select v-model="collab.accessRight" class="itbkk-access-right h-8 rounded-lg border-2 pl-2" 
                        :disabled="handleAccessRightChange()"
                        @change="checkOwner() && checkAuthToken() ? openConfirmAccessRightModal(collab) : ''">
                            <option  v-for="right in accessRightList" :key="right" :value="right">
                                {{ right }}
                            </option>
                        </select>
                        
                        <button class="itbkk-collab-remove flex justify-center w-3/5 text-[12px] rounded-2xl btn btn-error tooltip tooltip-top"
                        :data-tip="checkAuthToken() && checkOwner() ? 'remove user' : 'You do not have permission to use this feature.'"    
                        :disabled="handleDeleteCollab()"
                        @click="checkOwner() && checkAuthToken() ? openConfirmDeleteCollabModal(collab) : ''"
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
            >{{ Store.collaborate }}
                <tr>
                    <td class="text-center" colspan="6">Don't Have collaborate ?</td>
                </tr>
            </tbody>
        </main>
    </div>
    <router-view />
</template>
<style scoped>
 
</style>