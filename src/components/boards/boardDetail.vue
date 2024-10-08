<script setup>
import { ref, onMounted } from "vue";
import { getBoard } from "@/libs/fetchs.js";
import { useStore } from "@/stores/store.js";
import { useRoute, useRouter } from "vue-router";
import { checkrequestNewToken } from '@/libs/authToken.js';

let boardData = ref({});
let createTimeInBrowserTimezone = ref(null);
let updateTimeInBrowserTimezone = ref(null);
let browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let fetchHaveData = ref(false);
const route = useRoute();
const router = useRouter();
const Store = useStore();

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
    let result = await getBoard(`boards/${route.params.id}`);

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
        console.log(boardData.value);
    }
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
    <div v-show="fetchHaveData" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-lg p-8">
            <h1 class="text-3xl font-semibold text-center text-gray-800 mb-6">Board Details</h1>
            <div class="flex space-x-8">
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
                <div class="flex-none w-auto text-sm">
                    <div class="flex justify-center items-center bg-orange-300 rounded-2xl p-2"><p class=" font-medium text-gray-700">Task Quantity :</p>
                    <p class="text-gray-600 p-1">{{ taskQuantity(boardData.tasks) }}</p></div>
                    
                    <div  class="flex justify-center items-center bg-sky-300 rounded-2xl mt-2 p-2"><p class="font-medium text-gray-700">Statuses Quantity :</p>
                    <p class="text-gray-600 p-1">{{ taskQuantity(boardData.statuses) }}</p></div>
                    
                </div>
            </div>
            <div class="mt-6 flex justify-end">
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
