<script setup>
import { ref, onMounted, onUpdated, watch, computed } from "vue"
import { getAllBoard, editDatas } from "@/libs/fetchs.js"
import { useRoute, useRouter } from "vue-router"
import { useStore } from "@/stores/store.js"
import {
    getAuthToken,
    checkAuthToken,
    checkUserInAuthToken,
    checkrequestNewToken
} from "@/libs/authToken.js"
import Cookies from "js-cookie"

const route = useRoute()
const router = useRouter()
const Store = useStore()
const ID = ref(0)
const isEdited = ref(false)
const TokenLogin = computed(() => getAuthToken())
const currentBoardId = ref({})
let userLogin = Cookies.get("oid")
const boardId = ref(route.params.id)

let statusData = ref({
    name: "",
    description: "",
})
const originalStatusData = ref({
    name: "",
    description: "",
})

// watch(
//     boardId.value,
//     async (newBoardId) => {
//         if (newBoardId) {
//             await fetchData()
//         }
//     },
//     { immediate: true }
// )

async function fetchData() {

    let resultBoard = await getAllBoard(`boards/${boardId.value}`)
    currentBoardId.value = resultBoard     
    // let result = await getBoard(
    //         `boards/${boardId.value}/statuses/${route.params.statusId}`
    // )

        // พึ่งเพิ่ม
    let resultBoardAll = await getAllBoard(`boards`)
    let resultColab = await getAllBoard(`boards/${boardId.value}/collabs`)
    console.log(resultBoardAll);
    
    Store.boards = resultBoardAll 
    Store.collaborate = resultColab
        // console.log(Store.boards)
        // console.log(Store.collaborate)

        

    // if (checkAuthToken() && checkUserInAuthToken(userLogin, currentBoardId.value.owner.oid)) {
    //     let resultBoard = await getBoard(`boards/${boardId.value}`)
    //     currentBoardId.value = resultBoard     
    //     let result = await getBoard(
    //         `boards/${boardId.value}/statuses/${route.params.statusId}`
    //     )

    //     if (result.name === "No status" || result.name === "Done") {
    //         window.alert("You can not edit this Status.")
    //         router.push({ name: "StatusTable" })
    //     }
    //     if (result.status === 404) {
    //         router.push({ name: "Status", params: { id: boardId.value } })
    //         Store.errorNotfoundStatus = true
    //     }
    //     else {
    //         statusData.value = result
    //         originalStatusData.value = { ...statusData.value }
    //     }
    // } else {
    //     if (result.status === 403) {
    //         Store.errorPage403 = true
    //         errorPermition()
    //     }
    //     if (result.status === 401) {
    //         Store.errorPage401 = true
    //         errorPermition()
    //     } 
    //         // else{
    //         // Store.errorPage403 = true
    //         // // console.log("not Permition");
            
    //         // errorPermition()
    //         // }
    // }

    let currentStatus = await getAllBoard(`boards/${boardId.value}/statuses/${route.params.statusId}`)

    if (checkAuthToken()) {
        if (checkUserInAuthToken(userLogin, currentBoardId.value.owner.oid)) {  
            }if (userCollab()) {     
                console.log("Usercollab accessRight is write")
        
                if (currentStatus.name == "No Status" || currentStatus.name == "Done") {
                    window.alert("You can not edit this Status.")
                    openStatuses()
                }
                if (currentStatus.status === 404) {
                    openStatuses()
                    Store.errorNotfoundStatus = true
                }
                else {
                    statusData.value = currentStatus
                    originalStatusData.value = { ...statusData.value }
                }
            } else {
                console.log("Usercollab accessRight is read or not permition")

                if (currentBoardId.value.visibility === "private") {
                    Store.errorPage403 = true
                    errorPermition()
                }
                if (currentBoardId.value.visibility === "public") {
                    if (currentStatus.name === "No Status" || currentStatus.name === "Done") {
                        window.alert("You can not edit this Status.")
                        openStatuses()
                    }
                    if (currentStatus.status === 404) {
                        openStatuses()
                        Store.errorNotfoundStatus = true
                    }
                    else {
                        statusData.value = currentStatus
                        originalStatusData.value = { ...statusData.value }
                    }
                }
            }
        
        } else {
            if (currentBoardId.value.visibility === "private") {
                Store.errorPage403 = true
                errorPermition()
            }
            if (currentBoardId.value.visibility === "public") {
                if (currentStatus.name === "No Status" || currentStatus.name === "Done") {
                    window.alert("You can not edit this Status.")
                    openStatuses()
                }
                if (currentStatus.status === 404) {
                    openStatuses()
                    Store.errorNotfoundStatus = true
                }
                else {
                    statusData.value = currentStatus
                    originalStatusData.value = { ...statusData.value }
                }
            }
        }
}

async function updateStatus() {
    if (!statusData.value.name || statusData.value.name === "null") {
        window.alert("Information statusName Empty or null.")
        isEdited.value = false
    } else {
        if (!statusData.value.description) {
            statusData.value.description = null
        }
        if (
            statusData.value.name !== null &&
            statusData.value.description !== null
        ) {
            statusData.value.name = statusData.value.name.trim()
            statusData.value.description = statusData.value.description.trim()
        }
        // console.log(statusData.value)

        let result = await editDatas(
            `boards/${boardId.value}/statuses/${route.params.statusId}`,
            statusData.value
        )
        ID.value = result.id
        Store.successUpdateStatus = true
        // console.log(result.status)
        if (result.status === 401) {
            router.push({ name: "login" })
            Store.errorToken = true
        } else {
            addToStore()
            openStatuses()
        }
    }
}

function addToStore() {
    // ค้นหา index ของ Store.tasks ที่มี id เท่ากับ statusData.value.id
    let indexToUpdate = 0
    for (let i = 0; i < Store.statuses.length; i++) {
        if (Store.statuses[i].statusId === statusData.value.statusId) {
            indexToUpdate = i
            break
        }
    }
    if (indexToUpdate !== 0) {
        Store.statuses[indexToUpdate] = statusData.value
    } else {
        Store.statuses.push(statusData.value)
    }
}

function openStatuses() {
    clearData()
    router.push({ name: "Status", params: { id: boardId.value } })
}


function clearData() {
    statusData.value = {
        name: "",
        description: "",
    }
}

function errorPermition() {
    router.push({ name: "notFound" })
}


function checkOwner() {
    let userInboard = ''
    // for (const board of Store.boards.boards) {
    //     if (board.boardId === currentBoardId.value) {
    //         userInboard = board.owner.oid
    //     } else{
    //     }
    // }  
    const OwnerBoard = Store.boards.boards.find((uCollab) => uCollab.boardId === currentBoardId.value.boardId)
    || Store.boards.collaborate.find((uCollab) => uCollab.boardId === currentBoardId.value.boardId) 

    if (OwnerBoard) {
        userInboard = OwnerBoard.owner.oid
    } else {
        
    }
    return checkUserInAuthToken(userInboard,userLogin)
}

function userCollab() {

    const userCollab = Store.boards.boards.find((uCollab) => uCollab.boardId === currentBoardId.value.boardId)
    || Store.boards.collaborate.find((uCollab) => uCollab.boardId === currentBoardId.value.boardId) 

    if (checkOwner()) {
        return true
    } else {
        if (userCollab) {
        if (userCollab.accessRight == "read") {
            console.log("read")
            return false     
        } 
        if (userCollab.accessRight == "write") {
            console.log("write")
            return true
        }
        else{
            console.log("Erroe permition")
            return false
        }
    } else {
        return false
    }
    }
}

onMounted(fetchData, checkrequestNewToken(router))

onUpdated(() => {
    if (
        originalStatusData.value.name !== statusData.value.name ||
        originalStatusData.value.description !== statusData.value.description
    ) {
        isEdited.value = true
    } else {
        isEdited.value = false
    }
})
// watch(
//     boardUrl,
//     async (newBoardId) => {
//         if (newBoardId) {
//             await fetchData()
//         }
//     },
//     { immediate: true }
// )

</script>
<template>
    <div
        class="class name : itbkk-* fixed z-10 w-screen h-screen top-0 left-0 flex justify-center items-center"
    >
        <div
            class="bg-black bg-opacity-50 w-screen h-screen"
            @click="openStatuses()"
        ></div>
        <div
            class="fixed bg-white w-[85%] lg:w-[55%]  h-auto indicator flex flex-col rounded-2xl shadow-2xl"
        >
            <div class="rounded-2xl">
                <h1 class="break-words w-[79%]">
                    <span class="font-serif text-[100%]">Edit </span>
                    <span class="text-[70%] opacity-[60%] font-serif"
                        >Status</span
                    >
                </h1>
                <p class="border-b mt-2"></p>
            </div>
            <div class="itbkk-modal-status mt-3 ml-7">
                <div>
                    <p class="font-bold">Name</p>

                    <textarea
                        v-model="statusData.name"
                        v-if="statusData.name !== null"
                        maxlength="50"
                        class="itbkk-status-name text-black w-[90%] h-auto resize-none bg-gray-400 bg-opacity-15 rounded-lg pl-3 border-2 overflow-hidden hover:overflow-y-scroll"
                        >{{ statusData.name }} </textarea
                    >
                    <p class="flex justify-end pr-16 text-[10px]">
                        {{ statusData.name.length }}/50
                    </p>
                    <p class="font-bold mt-2">Description</p>

                    <textarea
                        maxlength="200"
                        class="itbkk-status-description border-2 w-[90%] h-44 resize-none italic pl-2 bg-opacity-15 rounded-lg"
                        style=""
                        v-model="statusData.description"
                        :placeholder="
                            statusData.description
                                ? ''
                                : 'No Description Provided'
                        "
                    >
                        {{ statusData.description }}
                        </textarea
                    >
                    <p class="flex justify-end pr-16 text-[10px]">
                        {{
                            statusData.description === null
                                ? "0"
                                : statusData.description.length
                        }}/200
                    </p>
                </div>
                <div class="boxButton m-3">
                    <button
                        type="submit"
                        class="itbkk-button-cancel button buttonClose btn"
                        @click="openStatuses()"
                    >
                        Close
                    </button>

                    <button
                        type="submit"
                        class="itbkk-button-confirm button buttonOK"
                        @click="TokenLogin ? updateStatus() : null"
                        :disabled="!isEdited || !TokenLogin || !userCollab()"
                        :class="{
                            'cursor-not-allowed tooltip tooltip-left':
                                !TokenLogin,
                        }"
                        :data-tip="
                            !TokenLogin
                                ? 'You do not have permission to use this feature.'
                                : ''
                        "
                    >
                        Update
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
    margin-top: 70px;
    margin-right: 30px;
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
    margin-right: 5px;
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
@media (max-width: 768px) {
    .button {
        padding: 10px 30px;
        font-size: 13px;
    }
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
