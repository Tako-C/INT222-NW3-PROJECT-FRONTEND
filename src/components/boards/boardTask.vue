<script setup>
import { ref, onMounted, watch, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useStore } from "@/stores/store.js"
import { getBoard, getTaskByBoard, removeData,updateBoard } from "@/libs/fetchs.js"
import Cookies from "js-cookie"
import modalNotification from "@/components/modals/modalNotification.vue"
import modalconfirmed from "@/components/modals/modalConfirmed.vue"
import { getAuthToken,checkUserInAuthToken,checkAuthToken,checkrequestNewToken } from '@/libs/authToken.js'

const Store = useStore()
const router = useRouter()
const route = useRoute()
const boardId = ref(route.params.id)
const isStatusDropdownOpen = ref(false)
const isTaskDropdownOpen = ref(false)
const boardName = ref("")
const errorDelete = ref(false)
const successDelete = ref(false)
const openConfirmed = ref(false)
const taskTitle = ref("")
const taskID = ref("")
const username = ref(Cookies.get("name"))

const sortStatus = ref(0)
const newFilterString = ref("")
const filterList = ref([])
const showStatusList = ref(false)
let userLogin = Cookies.get("oid")

const isBoardPage = computed(() => route.path.startsWith("/board"))
const isStatusPage = computed(() =>
    route.path.startsWith(`/board/${boardId.value}/status`)
)


// Watch for changes in boardId and fetch data accordingly
watch(
    boardId,
    async (newBoardId) => {
        if (newBoardId) {
            await fetchData()
            getBoardName()
            loopBoardVisibility()
            // checkTokenLogin()
        }
    },
    { immediate: true }
)
// function checkFirstStatuses() {
//     console.log(Store.statuses.length)
//     let firstStatuses = Store.statuses[0]
//     console.log(firstStatuses);
         
//     openStatuses(boardId.value)
    
    
// }

// ต้องทำเพราะ cypress  ====================================================================================================
let boardnow = ref({})
// function loopBoardVisibility() {
//     for (const board of Store.boards) {
//         if (board.boardId == boardId.value) {
//             boardnow.value = board
//         }
//     }
// }
function loopBoardVisibility() {
    const foundBoard = Store.boards.find((board) => board.boardId === boardId.value) 
    if (foundBoard) {
        boardnow.value = foundBoard;
        console.log(boardnow.value);
        
    } 
}
let visibilityBoard = ref({})
let openConfirmedvisibility = ref(false)
import BoardVisibilityConfirmation from "./boardVisibilityConfirmation.vue"

function openConfirmVisibilitymodal() {
    if (checkAuthToken) {
        visibilityBoard.value = boardnow.value
        console.log(boardnow.value.visibility)
        
        openConfirmedvisibility.value = true
        
    } else {
        errorPermition()
    }
}

async function updateVisibility() {
    checkrequestNewToken(router)
    if (visibilityBoard.value.isCheck === true) {
        visibilityBoard.value.visibility = "public"
    } else {
        visibilityBoard.value.visibility = "private"
    }

    let result = await updateBoard(`boards/${visibilityBoard.value.boardId}`, {
        visibility: visibilityBoard.value.visibility,
    })
    if (
        checkAuthToken() &&
        checkUserInAuthToken(visibilityBoard.value.owner.oid, userLogin)
    ) {
        if (result.status === 401) {
            router.push({ name: "login" })
            Store.errorToken = true
        } else {
            changeVisibility()
        }
    } else {
        if (result.status === 403) {
            Store.errorPage403 = true
            errorPermition()
        }
        if (result.status === 401) {
            Store.errorPage401 = true
            errorPermition()
        }
    }
}
async function changeVisibility() {
    let indexToUpdate = -1

    // Find the board by ID
    let board = Store.boards.find(
        (b) => b.boardId === visibilityBoard.value.boardId
    )
    board.visibility = visibilityBoard.value.visibility
    for (let i = 0; i < Store.boards.length; i++) {
        if (Store.boards[i].boardId === board.boardId) {
            indexToUpdate = i
            // break;
        }
    }
    if (indexToUpdate !== -1) {
        Store.boards[indexToUpdate].visibility = board.visibility
    }
    openConfirmed.value = false
}
// ====================================================================================================



async function fetchData() {

    let endpoint = `${boardId.value}/tasks`
    if (filterList.value.length > 0) {
        endpoint = `${
            boardId.value
        }/tasks?sortBy=statusName&FilterStatuses=${filterList.value
            .map((status) => status.trim())
            .join("&FilterStatuses=")}`
    } 
    let resBoards = await getBoard("boards")
    let resTasks = await getTaskByBoard(endpoint)
    let resStatuses = await getTaskByBoard(`${boardId.value}/statuses`)
    
    // console.log(resTasks);
    // console.log(resStatuses);
    // console.log(resBoards);
    
    if(resTasks.status === 401){
        router.push({name: 'login'})
        Store.errorToken = true

    } if (resTasks.status === 403) {
        Store.errorPage403 = true
        errorPermition()  

    }
    if (resTasks.status === 404) {
        Store.errortext404 = 'The Tasks does not exist'
        Store.errorPage404 = true
        errorPermition()

    }
    else {
    Store.tasks = resTasks
    Store.statuses = resStatuses
    Store.boards = resBoards.boards 
    Store.collaborate = resBoards.collaborate    
    console.log(Store.tasks);
    console.log(Store.boards);
    console.log(Store.collaborate);

         
    }
    checkOwner()

    for (const board of Store.boards) {
        if (board.visibility == "public") {
            board.isCheck = true
        } else {
            board.isCheck = false
        }
    }
}

function LoopcheckCollab(params) {
    for (const element of Store.boards) {
        
    }
}

function toggleSort() {
    sortStatus.value = (sortStatus.value + 1) % 3

    if (sortStatus.value === 1) {
        Store.tasks.sort((a, b) => a.statusName.localeCompare(b.statusName))
    } else if (sortStatus.value === 2) {
        Store.tasks
            .sort((a, b) => a.statusName.localeCompare(b.statusName))
            .reverse()
    } else {
        Store.tasks.sort((a, b) => a.id - b.id)
    }
}

function filteredStatuses() {
    return Store.statuses.filter((status) =>
        status.name.toLowerCase().includes(newFilterString.value.toLowerCase())
    )
}

function addFilter() {
    const trimmedFilter = newFilterString.value.trim()
    if (trimmedFilter && !filterList.value.includes(trimmedFilter)) {
        filterList.value.push(trimmedFilter)
        newFilterString.value = ""
        fetchData()
        showStatusList.value = false
        // Optional: Reset sort status if needed
        // sortStatus.value = 1;
    } else {
        window.alert(`${trimmedFilter} is already in the filter list.`)
        showStatusList.value = false
    }
}

function removeFilter(index) {
    filterList.value.splice(index, 1)
    fetchData()
}

function removeAllFilter() {
    filterList.value = []
    fetchData()
}

function openBoards() {
    router.push({ name: "Board" })
}

function openCreateTask() {
    router.push({ name: "createTask" })
}

function openBoardDetailModal(id) {
    router.push({ name: "BoardTask", params: { id } })
    // Update the boardId ref to trigger data fetch
    boardId.value = id
}

function openStatuses(boardId) {
    router.push({ name: "Status", params: { id: boardId } })
}

function openCollaborator(boardId) {
    router.push({ name: "collab", params: { id: boardId } })
}

function toggleStatusDropdown() {
    isStatusDropdownOpen.value = !isStatusDropdownOpen.value
    // checkFirstStatuses()
}

function toggleTaskDropdown() {
    isTaskDropdownOpen.value = !isTaskDropdownOpen.value
}

// function getBoardName() {
    
//     const board = Store.boards.find((b) => b.boardId === boardId.value)
//     console.log(board)

//     if (!board) {
//         const board = Store.collaborate.find((b) => b.boardId === boardId.value)
//         console.log(board)
//         boardName.value = board.board_name
//     } else {
//       if (board) {
//         boardName.value = board.board_name
//     }      
//     }
    
    
// }
function getBoardName() {
    const board = Store.boards.find((b) => b.boardId === boardId.value) || 
                  Store.collaborate.find((b) => b.boardId === boardId.value);
    if (board) {
        console.log(board)
        boardName.value = board.board_name
    } else {
        console.log('ไม่พบบอร์ด')
        boardName.value = ''
    }
}

function openTaskDetail(taskId) {  
        router.push({
        name: "editTask",
        params: { id: boardId.value, taskId: taskId },
    })
    
   
}

async function removeTask() {
    openConfirmed.value = false
    // console.log(taskID.value)
    let removedTask = await removeData(
        `boards/${route.params.id}/tasks/${taskID.value}`
    )
    // console.log("result", result)
    // if (result.status === 404) {
    //     console.log("result :", result.status)
    //     errorDelete.value = true
    // }
    // if (result.status === 401) {
    //     router.push({name: 'login'});
    //     Store.errorToken = true;
    // } else {
    //     Store.tasks = Store.tasks.filter((task) => task.id !== taskID.value)
    //     successDelete.value = true
    //     console.log(successDelete.value)
    // }

    if (checkOwner() && checkAuthToken()) {
                if(removedTask.status === 401){
                    router.push({name: 'login'})
                    Store.errorToken = true
                }
                if (removedTask.status === 404) {
                    onsole.log("result :", removedTask.status)
                    errorDelete.value = true
                }
                else {
                    Store.tasks = Store.tasks.filter((task) => task.id !== taskID.value)
                    successDelete.value = true
                    console.log(successDelete.value)
                }
            } 
            else{
                if (removedTask.status === 403) {
                Store.errorPage403 = true
                errorPermition()
                }
                if (removedTask.status === 401) {
                Store.errorPage401 = true
                errorPermition()
                }
            }

}

function closeNotificationModal() {
    errorDelete.value = false
    successDelete.value = false
    Store.successUpdateTask = false
    Store.errorUpdateTask = false
    Store.successAddTask = false
    openConfirmed.value = false
    taskTitle.value = ""
    taskID.value = ""
    Store.errorPage403 = false
    Store.errorPage404 = false
    


    // เพิ่มจากcypress
    openConfirmedvisibility.value = false
    Store.errorPrivate404 = false
    Store.errorPrivate404Content = ""
    
    let board = Store.boards.find(
        (b) => b.boardId === visibilityBoard.value.boardId
    )
    if (visibilityBoard.value.visibility === "public") {
        boardnow.value.isCheck = true
    } else {
        boardnow.value.isCheck = false
    }
}

function checkVariable() {
    if (
        Store.successAddTask == true ||
        Store.errorUpdateTask == true ||
        Store.successUpdateTask == true ||
        errorDelete.value === true ||
        successDelete.value === true
    ) {
        return true
    }
    return false
}

function openConfirmModal(id, title) {
    openConfirmed.value = true
    taskTitle.value = title
    taskID.value = id
}

async function logOut(){

    router.push({ name:'login'})

}
function errorPermition() {
    router.push({ name: "notFound" })
}

// function checkTokenLogin() {
//     TokenLogin.value = getAuthToken()
// }
function checkOwner() {
    let userInboard = null
    let boardFound = false
    
    for (const board of Store.boards) {
        if (board.boardId === boardId.value) {
            userInboard = board.owner.oid
            boardFound = true
            // console.log(userInboard);
            // break
        } 
        
    }
    // console.log(Store.boards)
    // console.log(boardFound , checkAuthToken());
    
    // if (getAuthToken() && !boardFound) {
    //     Store.errorPage403 = true;
    //     router.push({ name: "notFound" })
    //     console.log('boardFound :' ,boardFound , 'userInboard :' ,userInboard, 'userLogin :',userLogin ,checkUserInAuthToken(userInboard,userLogin));
    // }
    // if (getAuthToken() && !boardFound && checkUserInAuthToken(userInboard,userLogin)) {
       
    //    Store.errorPrivate404 = true
    //    Store.errorPrivate404Content ='Board'
    //    router.push({ name: "Board" })             
       
//    } 
   if (!getAuthToken() && !boardFound) {
       router.push({ name: "notFound" })
   }
    
    return checkUserInAuthToken(userInboard,userLogin)
}
onMounted(() => {
    checkrequestNewToken(router)
    fetchData()
})
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
        @confirmed="updateVisibility(),closeNotificationModal()"
        class="z-40"
    />
    <div class=" w-screen bg-white h-screen flex">
        <header
            name="header"
            class="top-0 h-full w-[20%] border-orange-400 bg-white shadow-lg flex flex-col items-center justify-between px-6 text-white rounded-r-3xl"
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
                            @click="openBoardDetailModal(board.boardId)"
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
                <div class="flex items-center justify-center right-0" @click="logOut()">
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

                <p class="pl-2" @click="openBoards()">Back</p>
            </div>
        </header>

        <!-- Table สำหรับแสดงข้อมูลของ board -->
        <main class="h-full w-full overflow-y-scroll">
            <!--TOPIC-->
            <div class="flex justify-between text-white">
                <div
                    class="text-2xl font-bold text-black flex w-auto ml-16 mt-10"
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
                    class="itbkk-button-add right-0 mt-3 flex bg-orange-400 items-center justify-center h-14 w-40 rounded-xl tooltip tooltip-left"
                    :data-tip="checkAuthToken() ? 'Create your task.' : 'You do not have permission to use this feature.'"          
                    @click="openCreateTask"
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
                    <p class="pl-2">Create Task</p>
                </button>
            </div>

            <div class="flex justify-between">
                <!--Search Box-->
                <div class="flex items-center">
                    <div>
                        <div
                            class="flex items-center justify-between input input-bordered w-auto h-10 ml-16 mt-5"
                        >
                            <input
                                @input="showStatusList = !showStatusList"
                                type="text"
                                placeholder="Search Filter something . . ."
                                v-model="newFilterString"
                                @keyup.enter="addFilter"
                                class="itbkk-status-filter w-auto"
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
                            <div
                                v-for="(status, index) in filteredStatuses()"
                                :key="index"
                            >
                                <p
                                    @click="
                                        addFilter(
                                            (newFilterString = status.name)
                                        )
                                    "
                                    class="hover:bg-slate-200 p-2"
                                >
                                    {{ status.name }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <p class="p-4 mt-5">Filter Status By :</p>
                    <div
                        v-show="filterList.length === 0"
                        class="italic text-gray-400 mt-5 "
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

                <!-- Visibility -->
                <div class="itbkk-board-visibility flex mt-8 ">
                            <input
                                type="checkbox"
                                class=" toggle tooltip tooltip-right"
                                :class="{
                                    'cursor-not-allowed ':
                                        !checkAuthToken() ||
                                        !checkOwner()
                                }"
                                :data-tip="
                                    checkAuthToken() &&
                                    checkOwner()
                                        ? 'change Visibility Board'
                                        : 'You do not have permission to use this feature.'
                                "
                                v-model="boardnow.isCheck"
                                @change="openConfirmVisibilitymodal()"
                            />
                            <p class="pl-3">{{ boardnow.visibility }}</p>
                        </div>
                        
                <!--Sort-->
                <div
                    class="itbkk-status-sort cursor-pointer pt-1 flex items-center mr-[12%] mt-3"
                    @click="toggleSort"
                >
                    <template v-if="sortStatus === 0">
                        <div class="flex">
                            <span>Sort DEF</span>
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
                            <span>Sort ACS</span>
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
                            <span>Sort DCS</span>
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
                    <button class="ml-2 bg-sky-200 rounded-lg p-2 itbkk-manage-status" @click="openStatuses(boardId)">Manage Status</button>
                    <button class="ml-2 bg-yellow-200 rounded-lg p-2 itbkk-manage-status" @click="openCollaborator(boardId)">Manage Collaborator</button>
                </div>
            </div>

            <!--Table-->
            <div class=" flex flex-col mt-5 ml-16 w-5/6">
                <!-- Table Header -->
                <div class="bg-gray-100 p-4 rounded-t-lg shadow-md">
                    <div class="grid grid-cols-4 gap-4">
                        <h3 class="font-bold">ID</h3>
                        <h3 class="font-bold">Title</h3>
                        <h3 class="font-bold">Assignees</h3>
                        <h3 class="font-bold">Status</h3>
                    </div>
                </div>
                <!-- Table Body -->
                <div
                    v-for="(task, index) in Store.tasks"
                    :key="index"
                    class=" bg-white rounded-b-lg shadow-md mb-2"
                    :class="{
                                'itbkk-modal-task itbkk-item': route.path.endsWith('/task') ,
                            }"
                >
                    <div class="  grid grid-cols-4 gap-4 p-4"
                    :class="{
                                'itbkk-status': !route.params.taskId,
                            }"
                            >
                        <p class="itbkk-button-action ">
                            <div class="itbkk-button-edit" :class="{ disabled: !checkAuthToken() }"  @click="openTaskDetail(task.id)" >
                                {{ index + 1 }}({{ task.id }})
                            </div>
                            
                        </p>
                        <p class="itbkk-title break-words" @click="openTaskDetail(task.id)">
                            {{ task.title }}
                        </p>
                        <span
                            class=" itbkk-assignees break-words"
                            :class="{
                                'italic text-gray-400': !task.assignees,
                                'itbkk-assignees': !route.params.id,
                            }"
                        >
                            {{
                                !task.assignees ? "Unassigned" : task.assignees
                            }}</span
                        >
                        <div class=" flex justify-between"
                        :class="{
                                'itbkk-status': route.path.endsWith('/task'),
                            }"
                        >
                            <p @click="openTaskDetail(task.id)">
                                {{ task.statusName }}
                            </p>
                            <div class="itbkk-button-delete tooltip tooltip-top"
                            :class="{
                                    'cursor-not-allowed':
                                        !checkAuthToken() || !checkOwner(),
                                    'cursor-pointer':
                                        checkAuthToken() && checkOwner(),

                                }"
                                :disabled="!checkAuthToken()"
                                :data-tip="checkAuthToken() && checkOwner() ? 'Delete your task.' : 'You do not have permission to use this feature.'"   >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                @click="openConfirmModal(task.id, task.title)"
                                class="size-6 text-red-500 "
                                  
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
