<script setup>
import { ref, onMounted, onUpdated } from 'vue'
import { getData, editData } from '@/libs/fetchs.js'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '@/stores/store.js'

let statusData = ref({
  name: '',
  description: '',
})
const originalStatusData = ref({
  name: '',
  description: '',
})
const route = useRoute()
const router = useRouter()
const Store = useStore()
const ID = ref(0)
const isEdited = ref(false)

if (route.params.id == 1) {
  window.alert('You can not edit this Status.')
  router.push({ name: 'StatusTable' })
}
async function fetchData() {
  try {
    statusData.value = await getData(`statuses/${route.params.id}`)
    console.log(originalStatusData.value)

    originalStatusData.value = { ...statusData.value }
  } catch (error) {
    Store.errorUpdateStatus = true
    router.push({ name: 'StatusTable' })
  }
}

async function updateStatus(statusId) {
  if (!statusData.value.name || statusData.value.name === 'null') {
    window.alert('Information statusName Empty or null.')
    isEdited.value = false
  } else {  
    if (!statusData.value.description) {
      statusData.value.description = null
    }
    if (
      statusData.value.name !== null &&
      statusData.value.description !== null
    ) {
      statusData.value.name = statusData.value.name.trim()
      statusData.value.description = statusData.value.description.trim()
    }
    let result = await editData('statuses', statusId, statusData.value)
    ID.value = result.id
    Store.successUpdateStatus = true

    addToStore()
    closeModal()
  }
}

function addToStore() {
  // ค้นหา index ของ Store.tasks ที่มี id เท่ากับ statusData.value.id
  let indexToUpdate = 0
  for (let i = 0; i < Store.statuses.length; i++) {
    if (Store.statuses[i].id === statusData.value.id) {
      indexToUpdate = i
      break
    }
  }
  if (indexToUpdate !== 0) {
    Store.statuses[indexToUpdate] = statusData.value
  } else {
    Store.statuses.push(statusData.value)
  }
}

function closeModal() {
  router.push({ name: 'StatusTable' })
  clearData()
}

function clearData() {
  statusData.value = {
    name: '',
    description: '',
  }
}

onMounted(fetchData)

onUpdated(() => {
  if (
    originalStatusData.value.name !== statusData.value.name ||
    originalStatusData.value.description !== statusData.value.description
  ) {
    isEdited.value = true
  }
   else {
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
      class="fixed bg-white w-[35%] h-auto indicator flex flex-col rounded-2xl shadow-2xl shadow-white"
    >
      <div class="rounded-2xl">
        <h1 class="break-words w-[79%]">
          <span class="font-serif text-[100%]">Edit </span>
          <span class="text-[70%] opacity-[60%] font-serif">Status</span>
        </h1>
        <p class="border-b mt-2"></p>
      </div>
      <div class="itbkk-modal-status mt-3 ml-7">
        <div>
          <p class="itbkk-status-name font-bold">Name</p>

          <textarea
            v-model="statusData.name"
            v-if="statusData.name !== null"
            class="itbkk-status-name text-black w-[90%] h-auto resize-none bg-gray-400 bg-opacity-15 rounded-lg pl-3 border-2 overflow-hidden hover:overflow-y-scroll"
            >{{ statusData.name }} </textarea
          >
          <p class="font-bold mt-2">Description</p>

          <textarea
            class="itbkk-status-description border-2 w-[90%] h-44 resize-none italic pl-2 bg-gray-400 bg-opacity-15 rounded-lg"
            style="color: grey"
            v-model="statusData.description"
            :placeholder="
              statusData.description ? '' : 'No Description Provided'
            "
          >
                        {{ statusData.description }}
                        </textarea
          >
        </div>
      </div>
      <div class="boxButton m-3">
        <button
          type="submit"
          class="itbkk-button-cancel button buttonClose btn"
          @click="closeModal()"
        >
          Close
        </button>

        <button
          type="submit"
          class="itbkk-button-confirm button buttonOK btn"
          @click="
            updateStatus(route.params.id, {
              name: statusData.name,
              description: statusData.description,
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
