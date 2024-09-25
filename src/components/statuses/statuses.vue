<script setup>
import { ref, onMounted, watch, computed } from "vue"
import { useRoute, useRouter, onBeforeRouteUpdate } from "vue-router"
import { useStore } from "@/stores/store.js"
import {
    getBoard,
    getTaskByBoard,
    removeData,
    clearCookies,
} from "@/libs/fetchs.js"
import Cookies from "js-cookie"
import modalNotification from "@/components/modals/modalNotification.vue"
import modalstatusDelete from "@/components/statuses/removeStatus.vue"
import modalTransfer from "@/components/modals/modalTransfer.vue"
import { getAuthToken } from '@/libs/authToken.js'

const Store = useStore()
const router = useRouter()
const route = useRoute()
const boardId = ref(route.params.id)
const isStatusDropdownOpen = ref(false)
const isTaskDropdownOpen = ref(false)
const username = ref(Cookies.get("name"))
const boardName = ref("")
const removeName = ref("")
const removeId = ref("")

const openConfirmed = ref(false)
const transferModal = ref(false)
const errorDeleteStatus = ref(false)
const successDeleteStatus = ref(false)
let TokenLogin = ref(false)

const isBoardPage = computed(() => route.path.endsWith(`/board`))
const isStatusPage = computed(() =>
    route.path.includes(`/board/${boardId.value}/status`)
)

function checkTokenLogin() {
    TokenLogin.value = getAuthToken()
}

watch(
    boardId,
    async (newBoardId) => {
        if (newBoardId) {
            await fetchData()
            getBoardName()
            checkTokenLogin()
        }
    },
    { immediate: true }
)
// Fetch data when the component is first mounted
onMounted(() => {
    fetchData()
    getBoardName()
})

// Fetch data every time the route changes (but the same component remains active)
onBeforeRouteUpdate((to, from, next) => {
    fetchData() // Re-fetch data when navigating within the same component
    console.log(Store.statuses)
    next()
})

// console.log(Store.statuses)

async function fetchData() {
    const endpoint = `${boardId.value}/statuses`
    let resStatus = await getTaskByBoard(endpoint)
    let resTasks= await getTaskByBoard(`${boardId.value}/tasks`)
    let resBoards = await getBoard("boards")
    if(resStatus.status === 401 || resTasks.status === 401 || resBoards.status === 401) {
        router.push({name: 'login'})
        Store.errorToken = true;
    } else {
        Store.statuses = resStatus
        Store.tasks = resTasks
        Store.boards = resBoards        
    }
}

// ================= Open/Close Page Function ===========================================================================
function openBoards() {
    router.push({ name: "Board" })
}

function openCreateStatus() {
    router.push({ name: "createStatus" })
}

function openBoardDetailModal(id) {
    router.push({ name: "BoardTask", params: { id } })
    // Update the boardId ref to trigger data fetch
    boardId.value = id
}

function openStatuses(id) {
    router.push({ name: "Status", params: { id } })
    boardId.value = id
}

function openStatusDetail(statusId, statusName) {
    if (statusName === "No Status" || statusName === "Done") {
        Store.errorEditDefaultStatus = true
    } else {
        router.push({
            name: "editStatus",
            params: { id: boardId.value, statusId: statusId },
        })
        // window.alert('You can not edit this Status.')
    }
}

function openConfirmModal(id, name) {
    openConfirmed.value = true
    removeName.value = name
    removeId.value = id
}

function closeNotificationModal() {
    Store.successAddStatus = false
    Store.successUpdateStatus = false
    Store.errorUpdateStatus = false
    successDeleteStatus.value = false
    errorDeleteStatus.value = false
    Store.successUpdateTask = false
    Store.errorUpdateTask = false
    openConfirmed.value = false
    transferModal.value = false
    Store.errorDeleteNoStatus = false
    Store.errorEditDefaultStatus = false
    removeId.value = ""
    removeName.value = ""
}

// =======================================================================================================================

// ====================== Orther Fucntion ================================================================================
function toggleStatusDropdown() {
    isStatusDropdownOpen.value = !isStatusDropdownOpen.value
}

function toggleTaskDropdown() {
    isTaskDropdownOpen.value = !isTaskDropdownOpen.value
}

function getBoardName() {
    const board = Store.boards.find((b) => b.boardId === boardId.value)
    if (board) {
        boardName.value = board.board_name
    }
}

function findUsageStatus(name) {
    let usageCount = 0
    for (const task of Store.tasks) {
        if (task.statusName == name) {
            usageCount++
        }
    }
    return usageCount
}

// =======================================================================================================================

// ======================= Remove function ===============================================================================
// async function removeStatus() {
//   openConfirmed.value = false
//   const checkTaskUseStatus = Store.tasks.filter(
//     (task) => task.statusName == removeName.value
//   )

//   if (checkTaskUseStatus.length == 0) {
//     Store.statuses = Store.statuses.filter(
//       (status) => status.statusId !== removeId.value
//     )

//     let result = await removeData(`boards/${route.params.id}/statuses/${removeId.value}`)
//     if (result.status === 401) {
//         errorDeleteStatus.value = true
//     } else {
//       successDeleteStatus.value = true
//     }
//   } else if (removeName.value == "No Status" || removeName.value == "Done") {
//     Store.errorDeleteNoStatus = true
//     console.log(removeName.value);

//     openStatuses(route.params.id)
//   }  else {
//     transferModal.value = true
//   }

//   openConfirmed.value = false
// }
async function removeStatus() {
    openConfirmed.value = false;

    const checkTaskUseStatus = Store.tasks.filter(
        (task) => task.statusName === removeName.value
    )

    if (removeName.value === "No Status" || removeName.value === "Done") {
        Store.errorDeleteNoStatus = true
        console.log(removeName.value)
        openStatuses(route.params.id)
        return
    }
    if (checkTaskUseStatus.length === 0) {

        Store.statuses = Store.statuses.filter(
            (status) => status.statusId !== removeId.value
        );

        const result = await removeData(
            `boards/${route.params.id}/statuses/${removeId.value}`
        );
        console.log(result);

        if (result.status === 404) {
            errorDeleteStatus.value = true;
        } else if (result.status === 401) {
            router.push({ name: "login" })
            Store.errorToken = true
        } else {
            successDeleteStatus.value = true
        }
    } else {
        transferModal.value = true
    }
    openConfirmed.value = false; // Reset confirmation modal
}

async function removeStatusTransfer(data) {
    const { removeStatus, transferStatus } = data
    const transferStatusId = Store.statuses.find(
        (status) => status.name === transferStatus
    ).statusId

    // ลบข้อมูลสถานะที่ถูกโอนย้าย
    let removedStatus = await removeData(
        `boards/${route.params.id}/statuses/${removeId.value}/${transferStatusId}`
    )

    // อัปเดตสถานะของ tasks
    const tasksToTransfer = Store.tasks.filter(
        (task) => task.statusName === removeStatus
    )

    if (tasksToTransfer.length > 0) {
        for (const task of tasksToTransfer) {
            task.statusName = transferStatus
        }
    }

    // ลบสถานะจาก Store
    Store.statuses = Store.statuses.filter(
        (status) => status.statusId !== removeId.value
    )

    // อัปเดตหน้าจอ
    transferModal.value = false
}

async function logOut() {
    clearCookies()
    router.push({ name: "login" })
}

// =======================================================================================================================

function checkVariable() {
    if (
        Store.successAddStatus == true ||
        Store.successUpdateStatus == true ||
        Store.errorUpdateStatus == true ||
        successDeleteStatus.value === true ||
        errorDeleteStatus.value === true ||
        Store.errorDeleteNoStatus == true ||
        Store.errorEditDefaultStatus == true
    ) {
        return true
    }
    return false
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
        <header
            name="header"
            class="top-0 z-10 h-full w-20% border-orange-400 bg-white shadow-lg flex flex-col items-center justify-between px-6 text-white rounded-r-3xl"
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
                    class="w-60 p-5 flex items-center justify-between cursor-pointer"
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

            <div
                class="bg-orange-400 p-2 flex my-14 justify-between w-3/4 cursor-pointer"
            >
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
                    {{ TokenLogin ? username : "Login" }}
                </p>
                <div
                    class="flex items-center justify-center right-0"
                    @click="logOut()"
                >
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
            <div class="flex justify-between text-white">
                <div
                    class="text-2xl font-bold text-black flex w-auto ml-16 mt-10"
                >
                    <h1>{{ TokenLogin ? `${username}` : "Public Board" }}</h1>
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

                    <p>Statuses Lists</p>
                </div>
                <button
    class="right-0 mt-3 flex bg-orange-400 items-center justify-center h-14 w-40 rounded-xl"
    :class="{ 'cursor-not-allowed': !TokenLogin, 'cursor-pointer': TokenLogin }"
    :data-tip="TokenLogin ? '' : 'You do not have permission to use this feature.'"
    :disabled="!TokenLogin"
    @click="TokenLogin ? openCreateStatus() : null"
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
    <p
        class="pl-2"
        :class="{ 'cursor-not-allowed': !TokenLogin, 'cursor-pointer': TokenLogin }"
    >
        Create Status
    </p>
</button>

            </div>

            <div class="flex flex-col mt-10 ml-16 w-5/6">
                <!-- Table Header -->
                <div class="bg-gray-100 p-4 rounded-t-lg shadow-md">
                    <div class="grid grid-cols-4 gap-4">
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
                    class="itbkk-item bg-white rounded-b-lg shadow-md mb-2"
                >
                    <div class=" grid grid-cols-4 gap-4 p-4">
                        <p 
                            @click="
                                openStatusDetail(status.statusId, status.name)
                            "
                        >
                            {{ index + 1 }}({{ status.statusId }})
                        </p>
                        <p
                            class="itbkk-status-name itbkk-button-edit break-words"
                            @click="
                                openStatusDetail(status.statusId, status.name)
                            "
                        >
                            {{ status.name }}
                        </p>
                        <p
                            @click="
                                openStatusDetail(status.statusId, status.name)
                            "
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
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                @click="TokenLogin ?
                                    openConfirmModal(
                                        status.statusId,
                                        status.name
                                    ) : null
                                "
                                class="size-6 text-red-500"
                                :class="{ 'cursor-not-allowed': !TokenLogin, 'cursor-pointer': TokenLogin }"
                                :disabled="!TokenLogin"
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
            <tbody
                v-show="Store.statuses.length === 0"
                class="w-full flex justify-center mt-16"
            >
                <tr>
                    <td class="text-center" colspan="6">
                        Don't Have Status ??
                    </td>
                </tr>
            </tbody>
        </main>
    </div>
    <router-view />
</template>

<style scoped></style>
