<script setup>
import { ref, onMounted } from "vue"
import { getBoard } from "@/libs/fetchs.js"
import { useStore } from "@/stores/store.js"
import { useRoute, useRouter } from "vue-router"

let boardData = ref({})
let createTimeInBrowserTimezone = ref(null)
let updateTimeInBrowserTimezone = ref(null)
let browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
let fetchHaveData = ref(false)
const route = useRoute()
const router = useRouter()
const Store = useStore()

//Option datetime
const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
}

function convertToBrowserTimezone(utcTime) {
    let date = new Date(utcTime)
    const browserTime = date.toLocaleString("en-AU", options)
    return browserTime
}

async function fetchData() {
    let result = await getBoard(`boards/${route.params.id}`)
console.log(result);

    if (result.status === 404) {
        router.push({ name: "board", params: { id: route.params.id } })
        // Store.errorUpdateStatus = true
    }
    if (result.status === 401) {
        router.push({ name: "login" })
        Store.errorToken = true
    } else {
        boardData.value = result // อัปเดต boardData ด้วยข้อมูลที่ได้จาก backend
        fetchHaveData.value = true // อัปเดตสถานะการดึงข้อมูลเสร็จสิ้น
        console.log(result)
        createTimeInBrowserTimezone.value = convertToBrowserTimezone(
            result.createdOn
        )
        updateTimeInBrowserTimezone.value = convertToBrowserTimezone(
            result.updatedOn
        )
        console.log(
            createTimeInBrowserTimezone,
            updateTimeInBrowserTimezone,
            browserTimeZone
        )
    }
}
function closeModal() {
    router.push("/board")
    fetchHaveData.value = !fetchHaveData.value
}
onMounted(fetchData)
</script>
<template>
    <div
        v-show="fetchHaveData"
        class="class name : itbkk-* fixed w-screen h-screen z-10 top-0 left-0 flex justify-center items-center"
    >
        <div
            class="bg-black bg-opacity-50 w-screen h-screen"
            @click="closeModal()"
        ></div>
        <div
            class="fixed bg-white w-[55%] h-auto indicator flex flex-col rounded-2xl shadow-2xl shadow-white"
        >
            <h1>Board name</h1>
            <p>{{ boardData.board_name }}</p>
            <h1>Time Zone</h1>
            <p>{{ browserTimeZone }}</p>
            <h1>Created On</h1>
            <p>{{ createTimeInBrowserTimezone }}</p>
            <h1>Updated On</h1>
            <p>{{ updateTimeInBrowserTimezone }}</p>
            <h1>Status</h1>
            <p>{{ boardData.visibility }}</p>
            <div class="boxButton m-3">
                <button
                    type="submit"
                    class="itbkk-button button buttonClose btn"
                    @click="closeModal()"
                >
                    Close
                </button>
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
    cursor: pointer;
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
}
.buttonOK:hover {
    background-color: #04aa6d;
    color: white;
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
    font-weight: 600;
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
