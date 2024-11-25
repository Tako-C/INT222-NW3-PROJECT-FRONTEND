<script setup>
import { ref, onMounted, watch, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useStore } from "@/stores/store.js"
import { getDataByBoard,getAllBoard,PatchData, removeData, accept} from "@/libs/fetchs.js"
import Cookies from "js-cookie"
import { checkAuthToken,checkUserInAuthToken,checkrequestNewToken} from '@/libs/authToken.js'
import modalNotification from "@/components/modals/modalNotification.vue"
import boardCollabChangeAccessRight from "@/components/collab/modalCollabChangeAccessRight.vue"
import boardCollabRemove from "@/components/collab/modalConfirmedDeleteCollab.vue"
import modalAcceptInvite from "./modalAcceptInvite.vue"
 
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
let userToken = ref()
const boardName = ref("")
const openConfirmedAccessRight = ref(false)
const openConfirmedRemove = ref(false)
let openAcceptInvitation = ref(false)
let resultAllBoard = {}
let CollabDetail = ref({})
let CollabRemove = ref({})

 
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

let invite = ref()
async function fetchData() {
    let endpoint = "boards"
    let resultColab = await getAllBoard(`boards/${boardId.value}/collabs`)
        let resStatuses = await getDataByBoard(`${boardId.value}/statuses`)
        // let resBoards = await getAllBoard(endpoint)
        resultAllBoard = await getAllBoard(endpoint)
        console.log(resultColab);
        console.log(resultAllBoard);
        
        
        Store.collaborate = resultColab.collaborators
        Store.boards = resultAllBoard
        Store.statuses = resStatuses
        // console.log(resultAllBoard)
        // console.log(Store.statuses)
        console.log(Store.boards)
        console.log(Store.collaborate)

        for (let i = 0; i < Store.collaborate.length; i++) {
            console.log(Store.collaborate[i].token)
            if(userLogin === Store.collaborate[i].oid){
                userToken.value = Store.collaborate[i].token
            }
            
        }
        

            
        invite.value = Store.boards.collaborate.map(collab => ({
            ...collab
        })) 


        console.log(invite.value)
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
    router.go(-1);
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
    openAcceptInvitation = false
    Store.errorPage409 = false
    fetchData()
    
}
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

async function removeCollabUser() {
    console.log('remove collab')
    // let collabBoard = await removeData(`boards/${CollabRemove.value.boardsId}/collabs/${CollabRemove.value.oid}`)

    // closeNotificationModal()
    console.log(CollabRemove.value);
    
    if (checkAuthToken()) {
        let collabBoard = await removeData(`boards/${CollabRemove.value.boardsId}/collabs/${CollabRemove.value.oid}`)
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

let infoInvite = ref({})
let information = ref({})
function modalAccept(info) {
    // checkrequestNewToken(router)
    infoInvite.value = info
    information.value = {
        boardId: infoInvite.value.boardId,
        token: userToken.value
    }

    // console.log(information.value)
    // console.log(infoInvite.value)
    openAcceptInvitation = true
}

async function acceptInvite(){
    checkrequestNewToken(router)
    console.log(Store.errorToken)
    // console.log(checkrequestNewToken())
    console.log(checkAuthToken)

    // if(checkAuthToken) {
        let resultRemove = await accept(`boards/${infoInvite.value.boardId}/collabs/invitations/accept?token=${userToken.value}`)
        console.log(resultRemove)
         // console.log(infoInvite.value.boardId, userToken)
    // closeNotificationModal()
    // router.push({ name: "BoardTask", params: { id: infoInvite.value.boardId } });         
    // } else {
    //     console.Console.log("Mai dai")
    // }    

}
async function declineInvite(){
    // checkrequestNewToken(router)

    if(checkAuthToken) {
    console.log(infoInvite.value.boardId)
    console.log(userToken.value)
    let resultRemove = await accept(`boards/${infoInvite.value.boardId}/collabs/invitations/decline?token=${userToken.value}`)
    // console.log(resultRemove)
    } else {
        console.log("Mai dai")
    }

    // closeNotificationModal()
    // router.push({ name: "Board"});
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
    checkrequestNewToken(router)
    fetchData()

    
})
</script>
<template>
<div class=" w-screen bg-white h-screen flex">
    <modalNotification
        @closemodal="closeNotificationModal()"
        v-show="checkVariable()"
        class="z-30"
    />
    <boardCollabRemove
        v-show="openConfirmedRemove"
        :removeCollab ="CollabRemove"
        @closemodal="closeNotificationModal()"
        @confirmed="removeCollabUser()"
        class="z-40"
    />
      <modalAcceptInvite
        :Invitation="infoInvite"
        v-show="openAcceptInvitation"
        @closemodal="declineInvite()"
        @confirmed="acceptInvite()"
        class="z-40"
    />
        <header
            name="header"
            class="top-0 z-10 h-full w-[20%] border-orange-400 bg-white shadow-lg flex flex-col items-center justify-between px-6 text-white rounded-r-3xl"
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
                            :d="
                                isTaskDropdownOpen
                                    ? 'M6 15l6-6 6 6'
                                    : 'M6 9l6 6 6-6'
                            "
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
                            @click="openBoardTasks(board.boardId)"
                        >
                            {{ board.board_name }}
                        </li>
                    </ul>
                </div>
 
                <!-- Statuses Section -->
                <div
                    class=" w-60 p-5 flex items-center justify-between cursor-pointer"
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
                            :d="
                                isStatusDropdownOpen
                                    ? 'M6 15l6-6 6 6'
                                    : 'M6 9l6 6 6-6'
                            "
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
 
            <div class="bg-orange-400 p-2 flex my-14 justify-between w-3/4 cursor-pointer">
                <div class="flex items-center space-x-2 p-1">
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
                <p class="itbkk-fullname text-sm font-medium p-1">
                    {{ checkAuthToken() ? username : "Login" }}
                </p>
                <div class="itbkk-sign-out flex items-center justify-center right-0" @click="logOut()">
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
 
            <!-- back button -->
            <div
                class="fixed right-0 bottom-0 mt-3 flex bg-orange-400 items-center justify-center h-14 w-20 rounded-xl cursor-pointer"
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
 
                <p class="pl-2" @click="goBack()">Back</p>
            </div>
        </header>
 
        <!-- Table สำหรับแสดงข้อมูลของ board -->
        <main class="h-full w-full overflow-y-scroll">
            <!--TOPIC-->
            <div class="flex justify-between text-white">
                <div
                    class="text-2xl font-bold text-black flex w-auto ml-16 mt-10"
                >
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
 
            <div class="flex justify-between">
                        
            </div>
            <!--Table-->
            <div class=" flex flex-col mt-5 ml-16 w-5/6">
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
                <div v-for="(invitation, index) in invite"
                :key="index"
                class="flex flex-col"
                >
                    <div class="grid grid-cols-6 gap-5 mt-5" @click="modalAccept(invitation)">
                        <p class="itbkk-item flex justify-center">{{ index+1 }}</p>
                        <p class="itbkk-name flex justify-center">{{ invitation.owner?.name }}</p>
                        <p class="itbkk-email flex justify-center col-span-2">{{ invitation.board_name }}</p>
                        <!-- <p class="itbkk-access-right flex justify-center" @click="openConfirmAccessRightModal(collab)">{{ collab.accessRight }}</p> -->
                        
                        <!-- <select v-model="collab.accessRight" class="itbkk-access-right h-8 rounded-lg border-2 pl-2" 
                        :disabled="handleAccessRightChange()"
                        @change="checkOwner() && checkAuthToken() ? openConfirmAccessRightModal(collab) : ''">
                            <option  v-for="right in accessRightList" :key="right" :value="right">
                                {{ right }}
                            </option>
                        </select> -->
                        <p class="itbkk-email flex justify-center">{{ invitation.accessRight }}</p>
                        <h3 class="font-bold flex justify-center">{{ invitation }}</h3>

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