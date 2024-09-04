<script setup>
import { ref, onMounted } from 'vue'
import { getData } from '../libs/fetchs.js'
import { useRoute, useRouter } from 'vue-router'

let taskData = ref([])
let createTimeInBrowserTimezone = ref(null)
let updateTimeInBrowserTimezone = ref(null)
let browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
let fetchHaveData = ref(false)
const route = useRoute()
const router = useRouter()

//Option datetime
const options = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
}

function convertToBrowserTimezone(utcTime) {
  // สร้าง Date object จากเวลา UTC
  let date = new Date(utcTime)
  // แปลงเวลาให้เป็น timezone ของ browser
  const browserTime = date.toLocaleString('en-AU', options)
  return browserTime
}

async function fetchData() {
  try {
    taskData.value = await getData(`tasks/${route.params.id}`)

    // เรียกใช้งานฟังก์ชันในการแปลงเวลา
    createTimeInBrowserTimezone = convertToBrowserTimezone(
      taskData.value.createdOn
    )
    updateTimeInBrowserTimezone = convertToBrowserTimezone(
      taskData.value.updatedOn
    )
    fetchHaveData.value = !fetchHaveData.value
  } catch (error) {
    router.push('/task')
    window.onload = function () {
      setTimeout(async function () {
        window.alert('The requested task does not exist')
      }, 100)
    }
  }
}
function closeModal() {
  router.push('/task')
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
      <div class="rounded-t-2xl">
        <h1 class="itbkk-title break-words w-[79%]">
          {{ taskData.title }}
        </h1>
        <p class="border-b mt-2"></p>
      </div>

      <div class="flex mt-3 mb-20 ml-7">
        <div class="w-1/2">
          <p class="font-bold">Description</p>
          <textarea
            v-if="taskData.description !== null"
            disabled
            class="itbkk-description border-2 w-[80%] h-[105%] resize-none bg-gray-400 bg-opacity-15 rounded-lg p-2 overflow-hidden hover:overflow-y-scroll"
            >{{ taskData.description }}</textarea
          >

          <textarea
            v-else
            disabled
            class="itbkk-description border-2 w-[80%] h-[105%] resize-none italic bg-gray-400 bg-opacity-15 rounded-lg"
            style="color: grey"
            >{{
              !taskData.description
                ? 'No Description Provided'
                : taskData.assignees
            }}</textarea
          >
        </div>
        <div class="w-1/2">
          <div class="font-bold">Assignees</div>
          <textarea
            disabled
            class="itbkk-assignees border-2 w-[80%] h-[30%] resize-none bg-gray-400 bg-opacity-15 rounded-lg pl-3"
            :class="{ 'italic text-gray-400': !taskData.assignees }"
            type="text"
            >{{
              !taskData.assignees ? 'Unassigned' : taskData.assignees
            }}</textarea
          >

          <div class="font-bold">Status</div>
          <p
            class="itbkk-status border-2 w-[30%] h-8 bg-gray-400 bg-opacity-15 rounded-lg pl-2 pr-2"
          >
            {{ taskData.status }}
          </p>
          <div class="font-bold pt-1">TimeZone</div>
          <p
            class="itbkk-timezone border-2 w-[80%] h-[10%] bg-gray-400 bg-opacity-15 rounded-lg pl-3"
          >
            {{ browserTimeZone }}
          </p>
          <div class="font-bold pt-1">Created On</div>
          <p
            class="itbkk-created-on border-2 w-[80%] h-[10%] bg-gray-400 bg-opacity-15 rounded-lg pl-3"
          >
            {{ createTimeInBrowserTimezone }}
          </p>
          <div class="font-bold pt-1">Updated On</div>
          <p
            class="itbkk-updated-on border-2 w-[80%] h-[10%] bg-gray-400 bg-opacity-15 rounded-lg pl-3"
          >
            {{ updateTimeInBrowserTimezone }}
          </p>
        </div>
      </div>
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
