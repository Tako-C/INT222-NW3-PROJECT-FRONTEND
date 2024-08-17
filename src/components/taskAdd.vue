<script setup>
import { ref, onMounted } from 'vue'
import { addData } from '../libs/fetchs.js'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../stores/store.js'
import { validateTask } from '../libs/varidateTask.js'
const DefualtStatus = 1
const router = useRouter()
const Store = useStore()
const TaskID = ref(0)
let taskData = ref({
  title: '',
  description: '',
  assignees: '',
  status: DefualtStatus,
  statusName: '',
})

function closeModal() {
  router.push({ name: 'taskTable' })
  clearData()
}

function addToStore() {
  taskData.value.id = TaskID.value
  const statusObject = Store.statuses.find(
    (status) => status.id === taskData.value.status
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

  let result = await addData(taskData.value, 'tasks')
  TaskID.value = result.id
  addToStore()
}

function clearData() {
  taskData.value = {
    title: '',
    description: '',
    assignees: '',
    status: DefualtStatus,
    statusName: '',
  }
}
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
      class="fixed bg-white w-[35%] h-auto indicator flex flex-col rounded-2xl shadow-2xl shadow-white"
    >
      <div class="rounded-2xl">
        <h1 class="break-words w-[79%]">
          <span class="font-serif text-[100%]">Add </span
          ><span class="text-[70%] opacity-[60%] font-serif">New Task</span>
          <!-- {{ taskData.title }} -->
        </h1>
        <p class="border-b mt-2"></p>
      </div>

      <div class="mt-3 mb-20 ml-7">
        <div class="font-bold">Title</div>
        <input
          v-model="taskData.title"
          class="itbkk-title w-[80%] h-8 resize-none italic bg-slate-400 bg-opacity-15 rounded-lg border-2 pl-2 "
          maxlength="100"
        />
        <div>{{ taskData.title.length }} /100</div>
        <div class="font-bold">Description</div>
        <textarea
          v-model="taskData.description"
          class="itbkk-description w-[80%] h-[80%] resize-none bg-gray-400 bg-opacity-15 rounded-lg pl-2 overflow-hidden hover:overflow-y-scroll border-2"
        ></textarea>

        <div class="font-bold">Assignees</div>
        <textarea
          v-model="taskData.assignees"
          class="itbkk-assignees w-[80%] h-[30%] resize-none bg-gray-400 bg-opacity-15 rounded-lg pl-3 border-2"
        ></textarea>

        <div class="font-bold">Status</div>
        <select
          v-model="taskData.status"
          class="w-[30%] h-8 bg-gray-400 bg-opacity-15 rounded-lg pl-2 pr-2 border-2"
        >
          <option
            class="itbkk-status"
            v-for="(status, index) in Store.statuses"
            :key="index"
            :value="status.id"
          >
            {{ status.name }}
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
          class="itbkk-button-confirm button buttonOK btn"
          @click="saveTaskData()"
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
