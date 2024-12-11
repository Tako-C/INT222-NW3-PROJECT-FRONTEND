<script setup>
import { ref, onMounted  } from "vue"
import { addData,getAllBoard } from "@/libs/fetchs.js"
import { useRouter, useRoute } from "vue-router"
import { useStore } from '@/stores/store.js'
import Cookies from "js-cookie";
import { checkAuthToken,checkrequestNewToken,checkUserInAuthToken } from '@/libs/authToken.js'
import modalNotification from "@/components/modals/modalNotification.vue"
const router = useRouter()
const route = useRoute()
const Store = useStore()
const boardId = ref(route.params.id)
const username = ref(Cookies.get("name"))
let userLogin = Cookies.get("oid")


function checkUserPermition() {
    if (!checkAuthToken() || !checkOwner()) {
        Store.errorPage403 = true
        errorPermission()
        router.push({ name: "notFound" })
    } else {

    }
}

let accessRightList = ref(['read','write'])
let collabData = ref({
    email: '',
    accessRight : 'read',
    statusInvite : 'PENDING'
})

function closeModal() {
    router.push({ name: "collab",  params: { id: boardId.value }  })
    clearData()
}

function checkUserIsCollab() { 
    for (let i = 0; i < Store.collaborate.length; i++) {
        if (Store.collaborate[i].oid === userLogin && Store.collaborate[i].boardsId === boardId.value) {
            return true 
        }
    }
     return false 
}
function checkOwner() {
    let userInboard = ""
    const foundBoard = Store.boards.find((board) => board.boardId === boardId.value) || Store.collaborate.find((board) => board.boardId)
    
    if (foundBoard.boardId === boardId.value) {
        userInboard = foundBoard.owner.oid
        
    }
    
    
    return checkUserInAuthToken(userInboard, userLogin)
}

async function fetchData() {
    let endpoint = "boards"

        let resBoards = await getAllBoard(endpoint)
        Store.boards = resBoards.boards
        Store.collaborate = resBoards.collaborate
        
        checkUserPermition()
}
function addToStore(newBoard) {
    Store.collaborate.push({ ...newBoard })
}

async function saveBoardData() {
    checkrequestNewToken(router)
            collabData.value.boards = boardId.value
            collabData.value.inviteeEmail = collabData.value.email

            let emailCheck = [...collabData.value.email];
            let emailContain = emailCheck.find((char) => char === '@');

            let result
            if (checkUserIsCollab()) {
                Store.errorPage403 = true
                errorPermission()
            } 
            else {
                if (!emailContain) {
                    errorPermission()
                } else {
                    result = await addData(collabData.value, `boards/${boardId.value}/collabs/invitations`)
                }
                

    if (checkOwner() && checkAuthToken()) {
        
    switch (result.status) {
        case 401:
            router.push({ name: "login" })
            Store.errorToken = true
            break
        case 400:
            errorPermission()
            break
        case 404:
            Store.errorPage404 = true
            break
        case 409:
            Store.errorPage409 = true
            break
        default:
            addToStore(result.user)
            closeModal()
            break
    }
} else {
    switch (result.status) {
        case 403:
            Store.errorPage403 = true
            errorPermission()
            break
        case 401:
            Store.errorPage401 = true
            errorPermission()
            break
        case 409:
            errorPermission()
            break
    }
}

    }    
}

function errorPermission() {
    router.push({ name: "notFound" })
}
function clearData() {
    collabData = ref({
    email: '',
    accessRight : 'read'
})
}

function checkVariable() {
    if (
        Store.errorPage404 == true ) {
        return true
    }
    return false
}
function closeNotificationModal() {
    Store.errorPage404 = false
    
}

onMounted(() => {
    // checkrequestNewToken(router)
    // checkAuthToken()
    // fetchData()
    
})

// checkAuthToken()
// checkUserPermition()
</script>
<template>
    <modalNotification
        @closemodal="closeNotificationModal()"
        v-show="checkVariable()"
        class="z-30"
    />
    <div
        class="class name : itbkk-modal-alert z-40 fixed w-screen h-screen top-0 left-0 flex justify-center items-center"
    >
        <div
            class="bg-black bg-opacity-50 w-screen h-screen"
            @click="closeModal()"

        >
        </div>
        <div
            class=" itbkk-modal-new fixed bg-white w-[80%] lg:w-[35%] h-auto indicator flex flex-col rounded-2xl shadow-2xl "
        >
            <div class=" rounded-2xl ">
                <h1 class=" break-words w-[79%]">
                    <span class="font-serif text-[100%]">Add Collaburator </span>
            </h1>
            <p class="border-b mt-2"></p>
            </div>

            <div class=" mt-3 ml-7">

                    <div class=" font-bold">Collaburator e-mail</div>
                    <input maxlength="120" v-model="collabData.email" class="itbkk-collaborator-email w-[90%] h-8 resize-none italic bg-slate-400 bg-opacity-15 rounded-lg border-2 pl-2"></input>
                    <p class=" flex justify-end pr-20 text-[10px]">{{ collabData.email.length}}/50</p>

                    <select v-model="collabData.accessRight" class="itbkk-access-right h-8 rounded-lg border-2 pl-2">
                        <!-- <option disabled value="">Select Access Permissions</option> -->
                        <option v-for="right in accessRightList" :key="right" :value="right">
                        {{ right }}
                        </option>
                    </select>

            </div>
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
                        class="itbkk-button-ok button buttonOK "
                        @click="checkrequestNewToken(router),saveBoardData()"
                        :disabled=" collabData.email.length === 0"
                        :class="{ 'cursor-not-allowed tooltip tooltip-left': !checkAuthToken() }"
                        :data-tip="checkAuthToken() ? '' : 'You do not have permission to use this feature.'"
                        >
                    Add
                    </button>
                </div>

            </div>
    </div>
</template>
<style scoped>
.boxButton {
    display: flex;
    justify-content: flex-end;
    margin-top: 70px;
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
