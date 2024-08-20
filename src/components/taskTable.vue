<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '@/stores/store.js'
import { removeById, getData } from '@/libs/fetchs.js'

import modalNotification from '@/components/modals/modalNotification.vue'
import modalconfirmed from '@/components/modals/modalConfirmed.vue'
import Cookies from 'js-cookie'

const Store = useStore()
let taskData = ref([])
let statusData = ref([])
const router = useRouter()
const route = useRoute()
const optionsDropDownIndex = ref(null)
const errorDelete = ref(false)
const successDelete = ref(false)
const openConfirmed = ref(false)
const taskTitle = ref('')
const taskID = ref('')
const sortStatus = ref(0)
const newFilterString = ref('')
const filterList = ref([])
const showStatusList = ref(false)
const username = Cookies.get('name')

async function fetchData() {
  let endpoint = 'tasks'
  if (filterList.value.length > 0) {
    let endpointFilter =
      'tasks?sortBy=status.name&FilterStatuses=' +
      filterList.value.map((status) => status.trim()).join('&FilterStatuses=')
    taskData.value = await getData(endpointFilter)
    taskData.value.sort((a, b) => a.id - b.id)
    
  } else {
    if (sortStatus.value === 1) {
      endpoint += '?sortBy=status.name&FilterStatuses'
      taskData.value = await getData(endpoint)
    } else if (sortStatus.value === 2) {
      endpoint += '?sortBy=status.name&FilterStatuses'
      taskData.value = (await getData(endpoint)).reverse()
    } else {
      taskData.value = await getData(endpoint);
    }
  }
  Store.tasks = taskData.value
  statusData.value = await getData('statuses')
  Store.statuses = statusData.value
}

function toggleDropDown(index) {
  optionsDropDownIndex.value =
    optionsDropDownIndex.value === index ? null : index
}

async function removeTask() {
  optionsDropDownIndex.value = null
  openConfirmed.value = false
  console.log(taskID.value)
  let result = await removeById('tasks', taskID.value)
  console.log('result', result)
  if (result.status === 404) {
    console.log('result :', result.status)
    errorDelete.value = true
  }
  Store.tasks = Store.tasks.filter((task) => task.id !== taskID.value)
  successDelete.value = true
  console.log(successDelete.value)
}

function addTaskModal() {
  router.push({ name: 'taskAdd' })
}
function switchToManage() {
  router.push(`/status`)
}

function editTaskModal(taskId) {
  router.push(`/task/${taskId}/edit`)
  optionsDropDownIndex.value = null
}
function openTaskDetailModal(taskId) {
  router.push({ name: 'taskDetail', params: { id: taskId } })
  optionsDropDownIndex.value = null
}

function closeNotificationModal() {
  errorDelete.value = false
  successDelete.value = false
  Store.successUpdateTask = false
  Store.errorUpdateTask = false
  Store.successAddTask = false
  openConfirmed.value = false
  taskTitle.value = ''
  taskID.value = ''
}
function openConfirmModal(id, title) {
  openConfirmed.value = true
  taskTitle.value = title
  taskID.value = id
}
function checkVariable() {
  if (
    Store.successAddTask == true ||
    Store.errorUpdateTask == true ||
    Store.successUpdateTask == true ||
    errorDelete.value === true ||
    successDelete.value === true
  ) {
    return true
  }
  return false
}

function addFilter() {
  if (
    newFilterString.value.trim() &&
    !filterList.value.includes(newFilterString.value)
  ) {
    filterList.value.push(newFilterString.value)
    newFilterString.value = ''
    fetchData()
    showStatusList.value = false
    // sortStatus.value = 1
  } else {
    window.alert(newFilterString.value + ' is current filter.')
    showStatusList.value = false
  }
}

function filteredStatuses() {
  return Store.statuses.filter((status) =>
    status.name.toLowerCase().includes(newFilterString.value.toLowerCase())
  )
}

function removeFilter(index) {
  filterList.value.splice(index, 1)
  fetchData()
}

function removeAllFilter(){
  filterList.value = []
  fetchData()
}

function toggleSort() {
  sortStatus.value = (sortStatus.value + 1) % 3
  if (filterList.value.length === 0) {
    fetchData()
  } else {
    if (sortStatus.value === 1) {
      Store.tasks.sort((a, b) => a.statusName.localeCompare(b.statusName))
    } else if (sortStatus.value === 2) {
      Store.tasks
        .sort((a, b) => a.statusName.localeCompare(b.statusName))
        .reverse()
    } else {
      Store.tasks.sort((a, b) => a.id - b.id)
    }
  }
}

onMounted(fetchData)
</script>

<template>
  <modalNotification
    :errorDelete="errorDelete"
    :successDelete="successDelete"
    @closemodal="closeNotificationModal()"
    v-show="checkVariable()"
    class="z-30"
  />
  <modalconfirmed
    v-show="openConfirmed"
    :taskTitle="taskTitle"
    @closemodal="closeNotificationModal()"
    @confirmed="removeTask()"
    class="z-40"
  />

  <div class="class name : itbkk-modal-task bg-white w-screen h-screen">
    <header
  name="header"
  class="fixed top-0 z-10 w-screen bg-gray-700 shadow-lg flex items-center h-24 px-6 text-white rounded-b-3xl"
>
  <div class="flex items-center mx-auto space-x-4">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-10 h-10"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
      />
    </svg>

    <h1 class="text-3xl font-bold font-serif titleShadow text-center">
      IT-Bangmod Kradan Kanban (ITB-KK)
    </h1>
  </div>

  <div class="absolute right-6 flex items-center space-x-2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-6 h-6"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
    <p class="itbkk-fullname text-lg font-medium">
      {{ username }}
    </p>
  </div>
</header>

    <!-- The button to open modal -->
    <main class="flex flex-col p-[8%] h-screen overflow-y-auto">
      <div class="flex justify-between">
        <div class="flex items-center">
          <div>
            <div
              class="flex items-center justify-between input input-bordered w-96"
            >
              <input
                @input="showStatusList = !showStatusList"
                type="text"
                placeholder="Search Filter something . . ."
                v-model="newFilterString"
                @keyup.enter="addFilter"
                class="itbkk-status-filter w-96"
              />
              <img
                src="https://www.svgrepo.com/show/46113/magnifying-glass.svg"
                alt=""
                class="ml-2 cursor-pointer w-4 h-4"
                @click="addFilter"
              />
            </div>
            <div
              class="fixed z-10 bg-white rounded-lg p-2"
              v-show="showStatusList"
            >
              <div v-for="(status, index) in filteredStatuses()" :key="index">
                <p
                  @click="addFilter((newFilterString = status.name))"
                  class="hover:bg-slate-200 p-2"
                >
                  {{ status.name }}
                </p>
              </div>
            </div>
          </div>
          <p class="p-4">Filter Status By :</p>
          <div
            v-show="filterList.length === 0"
            class="italic text-gray-400 p-4"
          >
            No filter yet . . .
          </div>

          <div
            v-show="filterList.length > 0"
            v-for="(filter, index) in filterList"
            :key="index"
            class="flex justify-center items-center rounded-lg bg-slate-300 w-auto m-2 p-2"
          >
            <p class=" itbkk-filter-item">{{ filter }}</p>
            <img
              src="https://www.svgrepo.com/show/21045/delete-button.svg"
              alt="Delete"
              class="itbkk-filter-item-clear ml-2 cursor-pointer w-4 h-4"
              @click="removeFilter(index)"
            />
          </div>
          <div v-show="filterList.length > 0" @click="removeAllFilter()" class="itbkk-filter-item-clear">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 cursor-pointer text-red-500">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>

          </div>
        </div>

        <div
          class="flex mt-2 ml-10 mb-3 text-xl font-serif font-bold justify-end"
        >
          <button
            class="itbkk-manage-status button-manage"
            @click="switchToManage()"
          >
            Status Manage
          </button>
          <button class="itbkk-button-add button-add" @click="addTaskModal()">
            Add Task
          </button>
        </div>
      </div>
      <table class="table table-zebra w-auto bg-white mt-2 mb-28">
        <thead
          class="bg-[#818080] text-white font-serif h-20 text-2xl titleShadow"
        >
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Assignees</th>
            <th class="flex items-center justify-between pt-7 pb-7">
              <span>Status</span>
              <div class="itbkk-status-sort cursor-pointer pt-1" @click="toggleSort">
                <template v-if="sortStatus === 0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-6 h-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
                    />
                  </svg>
                </template>
                <template v-else-if="sortStatus === 1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-6 h-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12"
                    />
                  </svg>
                </template>
                <template v-else>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-6 h-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25"
                    />
                  </svg>
                </template>
              </div>
            </th>

            <th>Action</th>
          </tr>
        </thead>
        <tbody class="text-base">
          <tr
            class="itbkk-item hover-table border-[1px] rounded-2xl"
            v-show="Store.tasks.length > 0"
            v-for="(task, index) in Store.tasks"
            :key="index"
          >
            <td @click="openTaskDetailModal(task.id)">{{ index + 1 }}</td>
            <td @click="openTaskDetailModal(task.id)" class="itbkk-title"
                style="word-break: break-word; max-width: 300px;"
            >
              {{ task.title }}
            </td>
            <td @click="openTaskDetailModal(task.id)">
              <span
                class=""
                :class="{
                  'italic text-gray-400': !task.assignees,
                  'itbkk-assignees': !route.params.id,
                }"
              >
                {{ !task.assignees ? 'Unassigned' : task.assignees }}</span
              >
            </td>
            <td @click="openTaskDetailModal(task.id)">
              <p
                class="itbkk-status rounded-2xl m-1 p-2 font-bold font-serif"
                :class="{
                  'bg-gray-200 w-24': task.statusName === 'No Status',
                  'text-yellow-500': task.statusName === 'To Do',
                  'text-orange-400': task.statusName === 'Doing',
                  'text-green-400': task.statusName === 'Done',
                }"
              >
                {{ task.statusName }}
              </p>
            </td>
            <td>
              <div class="itbkk-button-action relative pl-[20%]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 cursor-pointer" @click="toggleDropDown(index)">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                <div
                  v-if="optionsDropDownIndex === index"
                  class="absolute w-32 bg-white border rounded-lg shadow-lg z-50"
                >
                  <ul class="divide-y divide-gray-200">
                    <li>
                      <a
                        href="#"
                        @click="editTaskModal(task.id)"
                        class="itbkk-button-edit block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:rounded-lg"
                      >
                        Edit
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        @click="openConfirmModal(task.id, task.title)"
                        class="itbkk-button-delete block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:rounded-lg"
                      >
                        Delete
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-show="Store.tasks.length === 0">
          <tr>
            <td class="text-center" colspan="6">Don't Have Task ??</td>
          </tr>
        </tbody>
      </table>
    </main>
  </div>
  <router-view />
</template>

<style scoped>
.titleShadow {
  text-shadow: 5px 5px 5px black;
}

.hover-font-table {
  opacity: 30%;

  &:hover {
    opacity: 100%;
    transition: 0.3s;
    color: blue;
  }
}

.hover-table:hover {
  background-color: rgba(207, 207, 207, 0.5);
  transition: 0.3s;
}

.button-manage {
  border-radius: 4px;
  background-color: black;
  border: none;
  color: #fff;
  text-align: center;
  font-size: 20px;
  padding: 15px;
  width: 200px;
  transition: all 0.5s;
  cursor: pointer;
  margin-right: 5px;
  box-shadow: 0 10px 20px -8px rgba(0, 0, 0, 0.7);
  position: relative;
}

.button-manage:hover {
  padding-right: 24px;
  padding-left: 8px;
}

.button-manage::after {
  content: '»';
  position: absolute;
  opacity: 0;
  top: 15px;
  right: -20px;
  transition: 0.5s;
}

.button-manage:hover::after {
  opacity: 1;
  right: 10px;
}

.button-add {
  border-radius: 4px;
  background-color: black;
  border: none;
  color: #fff;
  text-align: center;
  font-size: 20px;
  padding: 15px;
  width: 170px;
  transition: all 0.5s;
  cursor: pointer;
  margin-right: 5px;
  box-shadow: 0 10px 20px -8px rgba(0, 0, 0, 0.7);
  position: relative;
}

.button-add:hover {
  padding-right: 24px;
  padding-left: 8px;
}

.button-add::after {
  content: '+';
  position: absolute;
  opacity: 0;
  top: 15px;
  right: -20px;
  transition: 0.5s;
}

.button-add:hover::after {
  opacity: 1;
  right: 10px;
}

.div-class-name {
  height: 50vh;
}
.icon {
  width: 36px;
  height: 36px;
  color: #222;
  margin-right: 12px;
}
</style>
