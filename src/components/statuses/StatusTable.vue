<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/stores/store.js'
import { removeById, getData, removeAndTransfer } from '@/libs/fetchs.js'

import modalNotification from '@/components/modals/modalNotification.vue'
import modalstatusDelete from '@/components/statuses/statusDelete.vue'
import modalTransfer from '@/components/modals/modalTransfer.vue'

const Store = useStore()
let statusData = ref([])
const router = useRouter()
const optionsDropDownIndex = ref(null)
const successDeleteStatus = ref(false)
const openConfirmed = ref(false)
const statusNameDelete = ref('')
const statusID = ref('')
const taskData = ref([])
const transferModal = ref(false)
const errorDeleteStatus = ref(false)

async function fetchData() {
  if (Store.tasks.length === 0 || Store.statuses.length === 0) {
    taskData.value = await getData('tasks')
    Store.tasks.push(...taskData.value)
    statusData.value = await getData('statuses')
    Store.statuses.push(...statusData.value)
    console.log(Store.tasks)
    console.log(Store.statuses)
  }
}

function toggleDropDown(index) {
  optionsDropDownIndex.value =
    optionsDropDownIndex.value === index ? null : index
}

async function removeStatus() {
  optionsDropDownIndex.value = null
  openConfirmed.value = false
  const checkTaskUseStatus = Store.tasks.filter(
    (task) => task.statusName == statusNameDelete.value
  )

  if (checkTaskUseStatus.length == 0) {
    Store.statuses = Store.statuses.filter(
      (status) => status.id !== statusID.value
    )
    let result = await removeById('statuses', statusID.value)
    if (result.status === 404) {
      errorDeleteStatus.value = true
    } else {
      successDeleteStatus.value = true
    }
  } else {
    transferModal.value = true
  }

  openConfirmed.value = false
}

async function removeStatusTransfer(data) {
  const { removeStatus, transferStatus } = data
  // หา id จาก statusname ที่รับมา
  const removeStatusId = Store.statuses.find(
    (status) => status.name === removeStatus
  ).id
  const transferStatusId = Store.statuses.find(
    (status) => status.name === transferStatus
  ).id

  let removedStatus = await removeAndTransfer(
    'statuses',
    removeStatusId,
    transferStatusId
  )
  const tasksToTransfer = Store.tasks.filter(
    (task) => task.statusName === removeStatus
  )
  if (tasksToTransfer.length > 0) {
    for (const task of tasksToTransfer) {
      task.statusName = transferStatusId
    }
  }
  Store.statuses = Store.statuses.filter(
    (status) => status.id !== removeStatusId
  )
  transferModal.value = false
}

function addModal_Status() {
  router.push({ name: 'StatusAdd' })
}

function editModal_Status(status_Id) {
  router.push(`/status/${status_Id}/edit`)
  optionsDropDownIndex.value = null
}

function closeNotificationModal() {
  Store.successAddStatus = false
  Store.successUpdateStatus = false
  Store.errorUpdateStatus = false
  openConfirmed.value = false
  transferModal.value = false
  successDeleteStatus.value = false
  errorDeleteStatus.value = false
  statusNameDelete.value = ''
  statusID.value = ''
}

function openConfirmModal(id, name) {
  if (name === 'No Status') {
    window.alert('You can not delete this Status.')
  } else {
    openConfirmed.value = true
    statusNameDelete.value = name
    statusID.value = id
  }
}

function checkVariable() {
  if (
    Store.successAddStatus == true ||
    Store.successUpdateStatus == true ||
    Store.errorUpdateStatus == true ||
    successDeleteStatus.value === true ||
    errorDeleteStatus.value === true
  ) {
    return true
  }
  return false
}

onMounted(fetchData)
</script>

<template>
  <modalNotification
    :successDeleteStatus="successDeleteStatus"
    :errorDeleteStatus="errorDeleteStatus"
    @closemodal="closeNotificationModal()"
    v-show="checkVariable()"
    class="z-30"
  />
  <modalstatusDelete
    v-show="openConfirmed"
    :statusName="statusNameDelete"
    @closemodal="closeNotificationModal()"
    @confirmed="removeStatus()"
    class="z-40"
  />
  <modalTransfer
    :statusName="statusNameDelete"
    v-show="transferModal"
    @closemodal="closeNotificationModal()"
    @confirmed="removeStatusTransfer($event), (successDeleteStatus = true)"
  ></modalTransfer>

  <div class="class name : itbkk- bg-white w-screen h-screen">
    <header
      name="header"
      class="fixed top-0 z-10 w-screen bg-[#797979] flex justify-center items-center h-20 text-24 text-white rounded-b-3xl"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-10 mr-2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
        />
      </svg>
      <h1 class="text-3xl font-bold font-serif titleShadow">
        IT-Bangmod Kradan Kanban (ITB-KK)
      </h1>
    </header>

    <!-- The button to open modal -->

    <main
      class="flex flex-col pt-[7%] h-screen pl-[20%] pr-[20%] overflow-y-auto"
    >
      <div
        class="flex text-2xl font-serif font-bold justify-between items-center"
      >
        <div class="itbkk-manage-status flex">
          <div
            @click="router.push({ name: 'taskTable' })"
            class="itbkk-button-home text-blue-500 cursor-pointer flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-10 h-7"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            <p>Home</p>
          </div>
          <div>> Status Manage</div>
        </div>
        <div>
          <button
            class="itbkk-button-add button-add mb-2"
            @click="addModal_Status()"
          >
            Add Status
          </button>
        </div>
      </div>
      <table class="table table-zebra bg-white mt-2 mb-28 w-full">
        <thead
          class="bg-[#818080] text-white font-serif h-20 text-2xl titleShadow"
        >
          <tr>
            <th class="w-[10%]">ID</th>
            <th class="w-[20%]">Name</th>
            <th class="w-[40%]">Description</th>
            <th class="w-[10%]">Action</th>
            <!-- <div class="itbkk-button-add add-Button h-16 flex items-center justify-center">
                            <img class="itbkk-button-add add-Button" src="@/assets/plus.svg" @click="addModal_Status()" />
                        </div> -->
          </tr>
        </thead>
        <tbody class="text-base">
          <tr
            class="itbkk-item hover-table border-[1px] rounded-2xl"
            v-show="Store.statuses.length > 0"
            v-for="(status, index) in Store.statuses"
            :key="index"
          >
            <td>{{ index + 1 }}</td>
            <td class="itbkk-status-name">
              {{ status.name }}
            </td>

            <td>
              <p
                class="itbkk-status-description rounded-2xl m-1 p-2 text-wrap"
                :class="{
                  'italic text-gray-400': status.description == null,
                }"
                style="word-break: break-word; max-width: 600px;"
              >
                {{
                  status.description == null
                    ? 'No description is provided'
                    : status.description
                }}
              </p>
            </td>
            <td>
              <div class="itbkk-button-action relative pl-[10%]">

                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 cursor-pointer" @click="toggleDropDown(index)">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                <div
                  v-if="optionsDropDownIndex === index"
                  class="absolute w-32 bg-white border rounded-lg shadow-lg z-10"
                >
                  <ul class="divide-y divide-gray-200">
                    <li class="itbkk-button-edit">
                      <a
                        href="#"
                        class="itbkk-button-edit block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:rounded-lg"
                        @click="editModal_Status(status.id)"
                      >
                        Edit
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        @click="openConfirmModal(status.id, status.name)"
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
        <tbody v-show="Store.statuses.length === 0">
          <tr>
            <td class="text-center" colspan="4">Don't Have status ??</td>
          </tr>
        </tbody>
      </table>
    </main>
  </div>
  <router-view />
</template>

<style scoped>
.titleShadow {
  text-shadow: 5px 5px 3px black;
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

/* .add-Button {
    opacity: 30%;
    width: 40px;
    margin-top: 5px;
    margin-left: 5px;
    margin-right: 20px;
    cursor: pointer;

    &:hover {
        /* background-color: #cc2e5d; */
/* opacity: 100%;
        transition: 0.5s;
    } */
/* } */

.button-add {
  border-radius: 4px;
  background-color: black;
  border: none;
  color: #fff;
  text-align: center;
  font-size: 20px;
  padding: 10px;
  width: 150px;
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
  top: 10px;
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
</style>
