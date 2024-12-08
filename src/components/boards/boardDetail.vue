<script setup>
import { ref, onMounted } from "vue";
import { getAllBoard } from "@/libs/fetchs.js";
import { useStore } from "@/stores/store.js";
import { useRoute, useRouter } from "vue-router";
import { checkrequestNewToken,getAuthToken,checkUserInAuthToken } from '@/libs/authToken.js';
import Cookies from "js-cookie"

let boardData = ref({});
let createTimeInBrowserTimezone = ref(null);
let updateTimeInBrowserTimezone = ref(null);
let browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let fetchHaveData = ref(false);
const route = useRoute();
const router = useRouter();
const Store = useStore();
const boardId = ref(route.params.id)
let userLogin = Cookies.get("oid")


const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
};

function convertToBrowserTimezone(utcTime) {
    let date = new Date(utcTime);
    return date.toLocaleString("en-AU", options);
}

async function fetchData() {
    let result = await getAllBoard(`boards/${route.params.id}`);

    if (result.status === 404) {
        Store.errorPrivate404 = true;
        Store.errorPrivate404Content = 'Board';
        router.push({ name: "board", params: { id: route.params.id } });
    } else if (result.status === 403) {
        Store.errorPage403 = true;
        router.push({ name: "notFound" });
    } else if (result.status === 401) {
        router.push({ name: "login" });
        Store.errorToken = true;
    } else {
        boardData.value = result;
        fetchHaveData.value = true;
        createTimeInBrowserTimezone.value = convertToBrowserTimezone(result.createdOn);
        updateTimeInBrowserTimezone.value = convertToBrowserTimezone(result.updatedOn);
        // console.log(boardData.value);
    }
    checkOwner()
}

function checkOwner() {
    let userInboard = null
    let boardFound = false
    
    for (const board of Store.boards) {
        console.log(board);
        
        if (board.boardId === boardId.value) {
            userInboard = board.owner.oid
            boardFound = true
            // console.log(userInboard);
            // break
        } 
        
    }
   if (!getAuthToken() && !boardFound) {
       router.push({ name: "notFound" })
   }
    
    return checkUserInAuthToken(userInboard,userLogin)
}
function closeModal() {
    router.push("/board");
    fetchHaveData.value = !fetchHaveData.value;
}

function taskQuantity(dataList) {
    let count = 0
    for (const key in dataList) {
        count++
    }
    return count;  // Assuming dataList is an array
}

onMounted(() => {
    checkrequestNewToken(router);
    fetchData();
});
</script>

<template>
    <div v-show="fetchHaveData" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div class="bg-white rounded-xl shadow-lg w-80 md:w-full max-w-lg p-8">
            <div class="md:hidden">
                <p class="text-red-400 flex justify-end cursor-pointer" @click="closeModal()">x</p>
            </div>
            <h1 class="text-3xl font-semibold text-center text-gray-800 mb-6">Board Details</h1>
            <div class="flex space-x-8 text-xs md:text-xl">
                <div class="flex-1 space-y-4 border p-4 rounded-lg border-gray-300">
                    <div>
                        <h2 class="text-xl font-medium text-gray-700">Board Name</h2>
                        <p class="text-gray-600">{{ boardData.board_name }}</p>
                    </div>
                    <div>
                        <h2 class="text-xl font-medium text-gray-700">Time Zone</h2>
                        <p class="text-gray-600">{{ browserTimeZone }}</p>
                    </div>
                    <div>
                        <h2 class="text-xl font-medium text-gray-700">Created On</h2>
                        <p class="text-gray-600">{{ createTimeInBrowserTimezone }}</p>
                    </div>
                    <div>
                        <h2 class="text-xl font-medium text-gray-700">Updated On</h2>
                        <p class="text-gray-600">{{ updateTimeInBrowserTimezone }}</p>
                    </div>
                    <div>
                        <h2 class="text-xl font-medium text-gray-700">Status</h2>
                        <p class="text-gray-600">{{ boardData.visibility }}</p>
                    </div>
                </div>
                <div class="flex-none w-auto text-sm space-y-2">
    <div class="flex justify-between items-center bg-orange-300 rounded-2xl p-2">
        <p class="font-medium text-gray-700">
            Task<span class="hidden md:inline"> Quantity</span>:
        </p>
        <p class="text-gray-600 font-semibold">{{ taskQuantity(boardData.tasks) }}</p>
    </div>

    <div class="flex justify-between items-center bg-sky-300 rounded-2xl p-2">
        <p class="font-medium text-gray-700">
            Statuses<span class="hidden md:inline"> Quantity</span>:
        </p>
        <p class="text-gray-600 font-semibold">{{ taskQuantity(boardData.statuses) }}</p>
    </div>
</div>

            </div>
            <div class="hidden md:flex justify-end mt-6">
    <button 
        class="btn btn-primary" 
        @click="closeModal()"
    >
        Close
    </button>
</div>


        </div>
    </div>
</template>

<style scoped>
/* Custom button styles for DaisyUI */
.btn-primary {
    @apply bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out;
}

.btn-primary:hover {
    @apply bg-blue-700;
}

/* Optional: Additional styling for the border */
.border {
    border-width: 1px;
}
</style>
