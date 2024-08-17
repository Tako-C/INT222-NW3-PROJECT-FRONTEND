<script setup>
import { ref, onMounted, onUpdated } from 'vue'
import { getData, editData } from '../libs/fetchs.js'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../stores/store.js'
import { validateTask } from '../libs/varidateTask.js'
let createTimeInBrowserTimezone = ref(null)
let updateTimeInBrowserTimezone = ref(null)
let browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const route = useRoute()
const router = useRouter()
const Store = useStore()
const TaskID = ref(0)
const isEdited = ref(false)
const DefualtStatus = 1

let taskData = ref({
  id: '',
  title: '',
  description: '',
  assignees: '',
  status: DefualtStatus,
  statusName: '',
})
const originalTaskData = ref({
  id: '',
  title: '',
  description: '',
  assignees: '',
  status: DefualtStatus,
  statusName: '',
})

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
  let date = new Date(utcTime)
  const browserTime = date.toLocaleString('en-AU', options)
  return browserTime
}

async function fetchData() {
  try {
    taskData.value = await getData(`tasks/${route.params.id}`)
    const statusObject = Store.statuses.find(
      (status) => status.name === taskData.value.status
    )
    taskData.value.status = statusObject.id

    createTimeInBrowserTimezone = convertToBrowserTimezone(
      taskData.value.createdOn
    )
    updateTimeInBrowserTimezone = convertToBrowserTimezone(
      taskData.value.updatedOn
    )
    originalTaskData.value = { ...taskData.value }
  } catch (error) {
    Store.errorUpdateTask = true
    router.push({ name: 'taskTable' })
  }
}

async function updateTask(taskId) {
  if (!validateTask(taskData.value)) {
    return
  }
  const statusObject = Store.statuses.find(
    (status) => status.id === taskData.value.status
  )
  taskData.value.statusName = statusObject.name
  let result = await editData('tasks', taskId, taskData.value)
  // TaskID.value = result.id
  Store.successUpdateTask = true
  addToStore()
  closeModal()
}

function addToStore() {
  let indexToUpdate = -1
  for (let i = 0; i < Store.tasks.length; i++) {
    if (Store.tasks[i].id === taskData.value.id) {
      indexToUpdate = i
      break
    }
  }
  if (indexToUpdate !== -1) {
    Store.tasks[indexToUpdate] = taskData.value
  } else {
    Store.tasks.push(taskData.value)
  }
}

function closeModal() {
  router.push({ name: 'taskTable' })
}

onMounted(fetchData)

onUpdated(() => {
  if (
    originalTaskData.value.title !== taskData.value.title ||
    originalTaskData.value.description !== taskData.value.description ||
    originalTaskData.value.assignees !== taskData.value.assignees ||
    originalTaskData.value.statusName !== taskData.value.statusName ||
    originalTaskData.value.status !== taskData.value.status
  ) {
    isEdited.value = true
  } else {
    isEdited.value = false
  }
})
</script>
<template>
  <div
    class="class name : itbkk-* fixed z-10 w-screen h-screen top-0 left-0 flex justify-center items-center"
  >
    <div
      class="bg-black bg-opacity-50 w-screen h-screen"
      @click="closeModal()"
    ></div>
    <div
      class="fixed bg-white w-[55%] h-auto indicator flex flex-col rounded-2xl shadow-2xl shadow-white"
    >
      <div class="rounded-2xl">
        <h1 class="itbkk-title break-words w-[79%]">
          <span class="font-serif text-[100%]">Edit </span
          ><span class="text-[70%] opacity-[60%] font-serif">Task</span>
        </h1>
        <p class="border-b mt-2"></p>
      </div>

      <div class="flex mt-3 mb-20 ml-7">
        <div class="w-1/2">
          <p class="font-bold">Title</p>

          <textarea
            v-model="taskData.title"
            v-if="taskData.title !== null"
            class="itbkk-title text-black w-[90%] h-auto resize-none bg-gray-400 bg-opacity-15 rounded-lg pl-3 border-2 overflow-hidden hover:overflow-y-scroll"
            >{{ taskData.title }} </textarea
          >

          <p class="font-bold mt-2">Description</p>

          <textarea
            class="itbkk-description border-2 w-[90%] h-[105%] resize-none italic bg-gray-400 bg-opacity-15 rounded-lg"
            style="color: grey"
            v-model="taskData.description"
            :placeholder="taskData.description ? '' : 'No Description Provided'"
          >
                        {{ taskData.description }}
                        </textarea
          >
        </div>
        <div class="w-1/2">
          <div class="font-bold">Assignees</div>
          <textarea
            class="itbkk-assignees border-2 w-[80%] h-[30%] resize-none bg-gray-400 bg-opacity-15 rounded-lg pl-3"
            :class="{ 'italic text-gray-400': !taskData.assignees }"
            type="text"
            v-model="taskData.assignees"
            :placeholder="taskData.assignees ? '' : 'Unassigned'"
            >{{ taskData.assignees }}
                        </textarea
          >

          <div class="font-bold">Status</div>
          <select
            v-model="taskData.status"
            class="itbkk-status w-[30%] h-8 bg-gray-400 bg-opacity-15 rounded-lg pl-2 pr-2 border-2"
          >
            <option
              v-for="(status, index) in Store.statuses"
              :key="index"
              :value="status.id"
            >
              {{ status.name }}
            </option>
          </select>

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

        <button
          type="submit"
          class="itbkk-button button buttonOK btn"
          @click="
            updateTask(route.params.id, {
              title: taskData.title,
              description: taskData.description,
              assignees: taskData.assignees,
              status: taskData.status,
            })
          "
          :disabled="!isEdited"
        >
          Update
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
  cursor: pointer;
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
