<script setup>
import { ref, watch, onMounted } from "vue"
import { addData, getTaskByBoard,getBoard } from "@/libs/fetchs.js"
import { useRoute, useRouter } from "vue-router"
import { useStore } from "@/stores/store.js"
import { validateTask } from "@/libs/varidateTask.js"
import { checkAuthToken, checkUserInAuthToken,checkrequestNewToken } from '@/libs/authToken.js'
import Cookies from "js-cookie"

const router = useRouter()
const route = useRoute()
const Store = useStore()
const boardId = ref(route.params.id)
const TaskID = ref(0)
const DefualtStatus = ref()
let TokenLogin = ref(false)
let userLogin = Cookies.get("oid")

async function fetchCheckBoardId() {
    let result = await getBoard(`boards/${route.params.id}`);
 if (checkAuthToken()) {
    if (result.status === 404) {
        Store.errorPage404 = true;
        Store.errorPrivate404Content = 'Board';
        router.push({ name: "board", params: { id: route.params.id } });
    } else if (result.status === 403) {
        Store.errorPage403 = true;
        router.push({ name: "notFound" });
    } else if (result.status === 401) {
        router.push({ name: "login" });
        Store.errorToken = true;
    }
 } else {
    Store.errorPage401 = true;
    router.push({ name: "notFound" });
 }
    
}


// watch(
//     boardId,
//     async (newloadpage) => {
//         if (newloadpage) {
//             checkTokenLogin()
//             checkrequestNewToken()
//         }
//     },
//     { immediate: true }
// )

onMounted(() => {
    checkrequestNewToken(router)
})

async function setDefualtStatus() {
    Store.statuses = await getTaskByBoard(`${boardId.value}/statuses`)
    DefualtStatus.value = Store.statuses.find(
        (status) => status.name === "No Status"
    )
    // console.log(Store.statuses,DefualtStatus.value);

    taskData.value.status = DefualtStatus.value.statusId
    return DefualtStatus
}

let taskData = ref({
    title: "",
    description: "",
    assignees: "",
    status: DefualtStatus,
})

function closeModal() {
    router.push({ name: "BoardTask" })
    clearData()
}

function addToStore() {
    taskData.value.id = TaskID.value
    const statusObject = Store.statuses.find(
        (status) => status.statusId === taskData.value.status
    )
    taskData.value.statusName = statusObject.name
    Store.tasks.push(taskData.value)
    Store.successAddTask = true
    closeModal()
}

async function saveTaskData() {
    if (!validateTask(taskData.value)) {
        return // Stop execution if validation fails
    }
    taskData.value.title = taskData.value.title.trim()
    if (taskData.value.description !== null) {
        taskData.value.description = taskData.value.description.trim()
    }
    if (taskData.value.assignees !== null) {
        taskData.value.assignees = taskData.value.assignees.trim()
    }

    // console.log(taskData.value);

    let result = await addData(taskData.value, `${boardId.value}/tasks`)
    // if(result.status === 401){
    //   router.push({name: 'login'});
    //   Store.errorToken = true;
    // } else {
    // console.log(result)
    // TaskID.value = result.id
    // addToStore()
    // }

    if (checkOwner() && checkAuthToken()) {
        if (result.status === 401) {
            router.push({ name: "login" })
            Store.errorToken = true
        } else {
            console.log(result)
            TaskID.value = result.id
            addToStore()
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

        // errorPermition()
    }
}

function clearData() {
    taskData.value = {
        title: "",
        description: "",
        assignees: "",
        status: DefualtStatus,
    }
}

function errorPermition() {
    router.push({ name: "notFound" })
}

function checkOwner() {
    let userInboard = ""
    for (const board of Store.boards) {
        if (board.boardId === boardId.value) {
            userInboard = board.owner.oid
            console.log(userInboard)
            break
        } else {
            // router.push({ name: "notFound" })
        }
    }
    return checkUserInAuthToken(userInboard, userLogin)
}

// function checkUserPermition() {
//     console.log(checkAuthToken(),checkOwner());
//     if (!checkAuthToken()) {
//         router.push({ name: "notFound" })
//     }
//     if (checkAuthToken() && !checkOwner()) {
//         router.push({ name: "notFound" })
//     }
// }
// checkUserPermition()
setDefualtStatus()
</script>
<template>
    <div
        class="class name : itbkk-* fixed w-screen h-screen top-0 left-0 flex justify-center items-center"
    >
        <div
            class="bg-black bg-opacity-50 w-screen h-screen"
            @click="closeModal()"
        ></div>
        <div
            class="fixed bg-white w-[35%] h-auto indicator flex flex-col rounded-2xl shadow-2xl"
        >
            <div class="rounded-2xl">
                <h1 class="break-words w-[79%]">
                    <span class="font-serif text-[100%]">Create </span
                    ><span class="text-[70%] opacity-[60%] font-serif"
                        >New Task</span
                    >
                    <!-- {{ taskData.title }} -->
                </h1>
                <p class="border-b mt-2"></p>
            </div>

            <div class="itbkk-modal-task mt-3 mb-20 ml-7">
                <div class="font-bold">Title</div>
                <input
                    v-model="taskData.title"
                    class="itbkk-title w-[80%] h-8 resize-none italic bg-slate-400 bg-opacity-15 rounded-lg border-2 pl-2"
                    maxlength="100"
                />
                <p class="flex justify-end pr-28 text-[10px]">
                    {{
                        taskData.title === null ? "0" : taskData.title.length
                    }}/100
                </p>
                <div class="font-bold">Description</div>
                <textarea
                    maxlength="500"
                    v-model="taskData.description"
                    class="itbkk-description w-[80%] h-[80%] resize-none bg-gray-400 bg-opacity-15 rounded-lg pl-2 overflow-hidden hover:overflow-y-scroll border-2"
                ></textarea>
                <p class="flex justify-end pr-28 text-[10px]">
                    {{
                        taskData.description === null
                            ? "0"
                            : taskData.description.length
                    }}/500
                </p>

                <div class="font-bold">Assignees</div>
                <textarea
                    maxlength="30"
                    v-model="taskData.assignees"
                    class="itbkk-assignees w-[80%] h-[30%] resize-none bg-gray-400 bg-opacity-15 rounded-lg pl-3 border-2"
                ></textarea>
                <p class="flex justify-end pr-28 text-[10px]">
                    {{
                        taskData.description === null
                            ? "0"
                            : taskData.assignees.length
                    }}/30
                </p>

                <div class="font-bold">Status</div>
                <select
                    v-model="taskData.status"
                    class="itbkk-status w-[30%] h-8 bg-gray-400 bg-opacity-15 rounded-lg pl-2 pr-2 border-2"
                >
                    <option
                        class=""
                        v-for="(status, index) in Store.statuses"
                        :key="index"
                        :value="status.statusId"
                    >
                        {{ status.name }}
                    </option>
                </select>
                <div class="boxButton m-3">
                    <button
                        type="submit"
                        class="itbkk-button-cancel button buttonClose btn"
                        @click="closeModal()"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="itbkk-button-confirm button buttonOK tooltip tooltip-left"
                        @click="saveTaskData()"
                        :data-tip="
                            TokenLogin
                                ? 'Create your task.'
                                : 'You do not have permission to use this feature.'
                        "
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.boxButton {
    display: flex;
    justify-content: flex-end;
    margin-top: auto;
    margin-right: 25px;
}
.button {
    margin-top: auto;
    background-color: #04aa6d;
    border: none;
    color: white;
    padding: 10px 50px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    transition-duration: 0.4s;
    /* cursor: pointer; */
    border-radius: var(--rounded-btn, 0.5rem);
}

.buttonClose {
    background-color: white;
    color: black;
    border: 2px solid red;
}
.buttonClose:hover {
    background-color: red;
    color: white;
}
.buttonOK {
    background-color: white;
    color: black;
    border: 2px solid #04aa6d;
    pointer-events: auto;
}

.buttonOK:hover {
    background-color: #04aa6d;
    color: white;
}

/* เมื่อปุ่มถูก disabled */
.buttonOK:disabled {
    background-color: grey;
    color: white;
    border: 2px solid grey;
}

.box {
    margin-right: auto;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 98;
    background-color: rgba(0, 0, 0, 0.3);
}

h1 {
    color: black;
    font-size: 32px;
    font-weight: 900;
    margin-top: 15px;
    margin-left: 25px;
    font-family: sans-serif;
}

.modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 99;

    width: 100%;
    max-width: 400px;
    background-color: #fff;
    border-radius: 16px;

    padding: 25px;
}
</style>
