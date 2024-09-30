<script setup>
import { onMounted, ref,watch } from "vue"
import { createStatus } from "@/libs/fetchs.js"
import { useRouter, useRoute } from "vue-router"
import { useStore } from '@/stores/store.js'
import {
    checkAuthToken,
    checkUserInAuthToken,
    checkAuthRefreshToken,
    requestNewToken,
    checkExpAuthToken
} from "@/libs/authToken.js"
import Cookies from "js-cookie"

const router = useRouter()
const route = useRoute()
const Store = useStore()
const statusID = ref(0)
const boardId = ref(route.params.id)
let TokenLogin = ref(false)
let userLogin = Cookies.get("oid")
// function checkTokenLogin() {
//     TokenLogin.value = getAuthToken()
// }

watch(
    boardId,
    async (newloadpage) => {
        if (newloadpage) {
            checkAuthToken()
        }
    },
    { immediate: true }
)

function checkrequestNewToken() {
  if (checkAuthToken()) {
    if (checkExpAuthToken() && checkAuthToken()) {
        console.log(checkAuthRefreshToken(), checkExpAuthToken())
      if (!checkAuthRefreshToken()) {
        
        console.log("Token ยังใช้งานต่อไม่ได้")
        router.push({ name: "login" })
      } else {
        requestNewToken()
        // setTimeout(() => {
        //   checkrequestNewToken()
        // }, 1000)
      }
    } else {
      console.log("Token ใช้งานต่อได้")
    }
  } else {
    console.log("User Not Login")
  }
}

// Fetch data when the component is first mounted
onMounted(() => {
    checkrequestNewToken()
})




let statusData = ref({
    name: '',
    description: ''
})

function closeModal() {
    router.push({name: 'Status'})
    clearData()
}

function addToStore() {
    statusData.value.statusId = statusID.value
    console.log(statusData.value);
    Store.statuses.push(statusData.value)
    Store.successAddStatus = true
    console.log(Store.statuses);
    clearData()
}


async function saveTaskData() {
    let checkStatusName = Store.statuses.filter((status) => status.name === statusData.value.name)
    console.log(statusData.value,checkStatusName);
    
        if(checkStatusName.length === 1){
            window.alert("An error has occurred, the status could not be added.")
        }   
        else{
            if (!statusData.value.description) {
                statusData.value.description = null
            }
            if(statusData.value.name !== null && statusData.value.description !== null) {
                statusData.value.name = statusData.value.name.trim()
                statusData.value.description = statusData.value.description.trim()      
            
            } 
            statusData.value.boards = boardId.value
            let result = await createStatus(statusData.value, `${boardId.value}/statuses`)
            // console.log(result.statusId);

            // if (result.status === 401) {
            //     router.push({name: 'login'});
            //     Store.errorToken = true;
            // } else {
            // statusID.value = result.statusId
            // console.log(result)
            // addToStore()
            // closeModal()                  
            // }
                        
            if (checkOwner() && checkAuthToken()) {
                if(result.status === 401){
                    router.push({name: 'login'})
                    Store.errorToken = true
                }
                else {
                    statusID.value = result.statusId
                    console.log(result)
                    addToStore()
                    closeModal()  
                }
            } 
            else{
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
}

function errorPermition() {
    router.push({ name: "notFound" })
}

function clearData() {
    statusData.value = {
        name: '',
        description: ''
    }
}
function checkOwner() {
    let userInboard = ''
    for (const board of Store.boards) {
        if (board.boardId === boardId.value) {
            userInboard = board.owner.oid
            console.log(userInboard);
            break
        } else{
            // router.push({ name: "notFound" })
        }

    }
    return checkUserInAuthToken(userInboard,userLogin)
    

}


function checkUserPermition() {
    console.log(checkAuthToken());
    if (checkAuthToken() === false) {
        router.push({ name: "notFound" })
    } 
    if (checkAuthToken() && !checkOwner()) {
        router.push({ name: "notFound" })
    } 
}
// checkUserPermition()
</script>
<template>
    <div
        class="class name : itbkk-* fixed w-screen h-screen top-0 left-0 flex justify-center items-center"
    >
        <div
            class="bg-black bg-opacity-50 w-screen h-screen"
            @click="closeModal()"

        >
        </div>
        <div
            class=" itbkk-modal-status fixed bg-white w-[35%] h-auto indicator flex flex-col rounded-2xl shadow-2xl "
        >
            <div class=" rounded-2xl ">
                <h1 class=" break-words w-[79%]">
                    <span class="font-serif text-[100%]">Add </span><span class="text-[70%] opacity-[60%] font-serif">New Status</span>
            </h1>
            <p class="border-b mt-2"></p>
            </div>

            <div class=" mt-3 ml-7">

                    <div class=" font-bold">Name</div>
                 
                    <input v-model="statusData.name" maxlength="50" class="itbkk-status-name w-[90%] h-8 resize-none italic bg-slate-400 bg-opacity-15 rounded-lg border-2 pl-2" />
                    <p class=" flex justify-end pr-20 text-[10px]">{{ statusData.name.length}}/50</p>

                    <div class=" font-bold">Description</div>
                    <textarea v-model="statusData.description" maxlength="200" class="itbkk-status-description  w-[90%] h-44 resize-none bg-gray-400 bg-opacity-15 rounded-lg pl-2 overflow-hidden hover:overflow-y-scroll border-2"></textarea>
                    <p class=" flex justify-end pr-20 text-[10px]">{{ statusData.description === null ? "0" : statusData.description.length}}/200</p>
            </div>


                <div class="boxButton m-3">
                    <button
                        type="submit"
                        class="itbkk-button-cancel button buttonClose btn"
                        @click="closeModal()"
                    >
                    Cancel
                    </button>
                    <!-- <button 
                        type="submit"
                        class="itbkk-button-confirm button buttonOK"
                        @click="saveTaskData()"
                        :disabled="!checkAuthToken() || statusData.name.length === 0"
                        :class="{ 'cursor-not-allowed tooltip tooltip-left': !checkAuthToken() }"
                        :data-tip="checkAuthToken() ? '' : 'You do not have permission to use this feature.'"
                    >
                        
                    Add
                    </button> -->
                    <button 
                        type="submit"
                        class="itbkk-button-confirm button buttonOK tooltip tooltip-left"
                        @click="saveTaskData()"
                        :disabled="statusData.name.length === 0"
                        :class="{ 'cursor-not-allowed ': !checkAuthToken() }"
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
