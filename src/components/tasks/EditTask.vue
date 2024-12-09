<script setup>
import { ref, onMounted, onUpdated, watch } from "vue";
import { getAllBoard, editDatas } from "@/libs/fetchs.js";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "@/stores/store.js";
import { validateTask } from "@/libs/varidateTask.js";
import {
  checkrequestNewToken,
  checkAuthToken,
  checkUserInAuthToken,
} from "@/libs/authToken.js";
import Cookies from "js-cookie";

let createTimeInBrowserTimezone = ref(null);
let updateTimeInBrowserTimezone = ref(null);
let browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const route = useRoute();
const router = useRouter();
const Store = useStore();
const isEdited = ref(false);
const DefualtStatus = 3;
let statusObject = ref();
let userLogin = Cookies.get("oid");
const currentBoardId = ref({});

let taskData = ref({
  id: "",
  title: "",
  description: "",
  assignees: "",
  status: DefualtStatus,
});
const originalTaskData = ref({
  id: "",
  title: "",
  description: "",
  assignees: "",
  status: DefualtStatus,
});

//Option datetime
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
  const browserTime = date.toLocaleString("en-AU", options);
  return browserTime;
}
// console.log(route.params.taskId)

// function checkOwner() {
//     let userInboard = ''
//     for (const board of Store.boards) {
//         if (board.boardId === boardId.value) {
//             userInboard = board.owner.oid
//             // console.log(userInboard);
//             // break
//         } else{
//             // router.push({ name: "notFound" })
//         }

//     }
//     return checkUserInAuthToken(userInboard,userLogin)
// }

function checkOwner() {
  let userInboard = "";
  // for (const board of Store.boards.boards) {
  //     if (board.boardId === currentBoardId.value) {
  //         userInboard = board.owner.oid
  //     } else{
  //     }
  // }
  const OwnerBoard =
    Store.boards.boards.find(
      (uCollab) => uCollab.board_name === currentBoardId.value.boardName
    ) ||
    Store.boards.collaborate.find(
      (uCollab) => uCollab.board_name === currentBoardId.value.boardName
    );

  if (OwnerBoard) {
    userInboard = OwnerBoard.owner.oid;
  } else {
  }
  return checkUserInAuthToken(userInboard, userLogin);
}

function userCollab() {
  const userCollab =
    Store.boards.boards.find(
      (uCollab) => uCollab.board_name == currentBoardId.value.boardName
    ) ||
    Store.boards.collaborate.find(
      (uCollab) => uCollab.board_name == currentBoardId.value.boardName
    );

  if (checkOwner()) {
    return true;
  } else {
    if (userCollab) {
      return true;
    } else {
      return false;
    }
  }
}

function userCollabWrite() {
  const userCollab =
    Store.boards.boards.find(
      (uCollab) => uCollab.board_name == currentBoardId.value.boardName
    ) ||
    Store.boards.collaborate.find(
      (uCollab) => uCollab.board_name == currentBoardId.value.boardName
    );

  if (checkOwner()) {
    return true;
  } else {
    if (userCollab) {
      if (userCollab.accessRight === "read") {
        console.log("read");
        return false;
      }
      if (userCollab.accessRight === "write") {
        console.log("write");
        return true;
      } else {
        console.log("Public Borard");
        return false;
      }
    } else {
      return false;
    }
  }
}

async function fetchData() {
  let currentBoardVisibility = "";
  let resultBoardAll = await getAllBoard(`boards`);
  let result = await getAllBoard(
    `boards/${route.params.id}/tasks/${route.params.taskId}`
  );
  let resultStatuses = await getAllBoard(`boards/${route.params.id}/statuses`);

  Store.boards = resultBoardAll;
  Store.statuses = resultStatuses;
  currentBoardId.value = result;

  // console.log(currentBoardId.value)
  // console.log(Store.boards)
  // console.log(userCollab());

  const BoardVisibility =
    Store.boards.boards.find(
      (BV) => BV.board_name == currentBoardId.value.boardName
    ) ||
    Store.boards.collaborate.find(
      (BV) => BV.board_name == currentBoardId.value.boardName
    );

  if (BoardVisibility) {
    currentBoardVisibility = BoardVisibility.visibility;
  } else {
  }

  if (checkAuthToken()) {
    if (checkUserInAuthToken(userLogin, currentBoardId.value.owner?.oid)) {
    }
    if (userCollab()) {
      console.log("Usercollab accessRight is write or read");
      if (currentBoardId.value.status === 404) {
        closeModal();
        Store.errorPage403 = true;
      } else {
        // taskData.value = currentBoardId
        // originalStatusData.value = { ...statusData.value }

        statusObject = Store.statuses.find(
          (status) => status.name === currentBoardId.value.statusName
        );
        // console.log( Store.statuses );
        // console.log(currentBoardId.value.statusName);
        // console.log(statusObject);

        currentBoardId.value.status = statusObject.statusId;
        taskData.value = currentBoardId.value;
        originalTaskData.value = { ...taskData.value };
        createTimeInBrowserTimezone = convertToBrowserTimezone(
          result.createdOn
        );
        updateTimeInBrowserTimezone = convertToBrowserTimezone(
          result.updatedOn
        );
      }
    } else {
      console.log("Usercollab accessRight is not permition");

      if (currentBoardVisibility === "private") {
        Store.errorPage403 = true;
        errorPermission();
      }
      if (currentBoardVisibility === "public") {
        if (currentBoardId.status === 404) {
          closeModal();
          Store.errorPage404 = true;
        } else {
          statusObject = Store.statuses.find(
            (status) => status.name === currentBoardId.value.statusName
          );
          currentBoardId.value.status = statusObject.statusId;
          taskData.value = currentBoardId.value;
          originalTaskData.value = { ...taskData.value };
          createTimeInBrowserTimezone = convertToBrowserTimezone(
            result.createdOn
          );
          updateTimeInBrowserTimezone = convertToBrowserTimezone(
            result.updatedOn
          );
        }
      }
    }
  } else {
    if (currentBoardVisibility === "private") {
      Store.errorPage403 = true;
      errorPermission();
    }
    if (currentBoardVisibility === "public") {
      if (currentStatus.status === 404) {
        closeModal();
        // Store.errorNotfoundStatus = true
      } else {
        statusObject = Store.statuses.find(
          (status) => status.name === currentBoardId.value.statusName
        );
        currentBoardId.value.status = statusObject.statusId;
        taskData.value = currentBoardId.value;
        originalTaskData.value = { ...taskData.value };
        createTimeInBrowserTimezone = convertToBrowserTimezone(
          result.createdOn
        );
        updateTimeInBrowserTimezone = convertToBrowserTimezone(
          result.updatedOn
        );
      }
    }
  }

  // if (result.status === 404) {
  //     router.push({ name: "BoardTask", params: { id: route.params.id } })
  //     Store.errorUpdateTask = true
  // }
  // if (result.status === 401) {
  //     router.push({ name: "login" })
  //     Store.errorToken = true
  // } else {
  //     statusObject = Store.statuses.find(
  //         (status) => status.name === result.statusName
  //     )
  //     result.status = statusObject.statusId
  //     taskData.value = result
  //     originalTaskData.value = { ...taskData.value }
  //     createTimeInBrowserTimezone = convertToBrowserTimezone(result.createdOn)
  //     updateTimeInBrowserTimezone = convertToBrowserTimezone(result.updatedOn)
  // }

  // } else {
  //     router.push({ name: "notFound" })
  // }
}

async function updateTask() {
  if (!validateTask(taskData.value)) {
    return;
  }
  const statusObject = Store.statuses.find(
    (status) => status.statusId === taskData.value.status
  );
  taskData.value.status = statusObject.statusId;
  let result = await editDatas(
    `boards/${route.params.id}/tasks/${route.params.taskId}`,
    taskData.value
  );

  if (checkOwner() && checkAuthToken()) {
    if (result.status === 401) {
      router.push({ name: "login" });
      Store.errorToken = true;
    } else {
      // TaskID.value = result.id
      Store.successUpdateTask = true;
      addToStore();
    }
  }
  if (userCollabWrite()) {
    if (result.status === 401) {
      router.push({ name: "login" });
      Store.errorToken = true;
    } else {
      // TaskID.value = result.id
      Store.successUpdateTask = true;
      addToStore();
    }
  } else {
    if (result.status === 403) {
      Store.errorPage403 = true;
      errorPermission();
    }
    if (result.status === 401) {
      Store.errorPage401 = true;
      errorPermission();
    } else {
      Store.errorPage403 = true;
      errorPermission();
    }
    // errorPermission()
  }
}

function addToStore() {
  let indexToUpdate = -1;
  const ConvertTostatusName = Store.statuses.find(
    (status) => status.statusId === taskData.value.status
  );
  taskData.value.statusName = ConvertTostatusName.name;

  for (let i = 0; i < Store.tasks.length; i++) {
    if (Store.tasks[i].id === taskData.value.id) {
      indexToUpdate = i;
      break;
    }
  }
  if (indexToUpdate !== -1) {
    Store.tasks[indexToUpdate] = taskData.value;
  } else {
    Store.tasks.push(taskData.value);
  }
  // console.log(Store.tasks)

  closeModal();
}

function closeModal() {
  router.push({ name: "BoardTask", params: { id: route.params.id } });
}

// function checkTokenLogin() {
//     TokenLogin.value = getAuthToken()
// }

function checkUserPermition() {
  // console.log(checkAuthToken())
  if (checkAuthToken() === false) {
    errorPermission();
  } else {
  }
}

function errorPermission() {
  router.push({ name: "notFound" });
}

// watch(
//     boardId,
//     async (newBoardId) => {
//         if (newBoardId) {
//             await fetchData()
//             // checkTokenLogin()
//         }
//     },
//     { immediate: true }
// )

onMounted(() => {
  checkrequestNewToken(router);
  fetchData();
});

onUpdated(() => {
  if (
    originalTaskData.value.title !== taskData.value.title ||
    originalTaskData.value.description !== taskData.value.description ||
    originalTaskData.value.assignees !== taskData.value.assignees ||
    originalTaskData.value.status !== taskData.value.status
  ) {
    isEdited.value = true;
  } else {
    isEdited.value = false;
  }
});
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
      class="fixed bg-white w-[85%] lg:w-[55%] h-auto indicator flex flex-col rounded-2xl shadow-2xl"
      :class="{
        'itbkk-modal-task itbkk-item': route.params.taskId,
      }"
    >
      <div class="rounded-2xl">
        <h1 class="w-[79%]">
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
            maxlength="100"
            class="itbkk-title text-black w-[90%] h-auto resize-none bg-gray-400 bg-opacity-15 rounded-lg pl-3 border-2 overflow-hidden hover:overflow-y-scroll"
          >
                        {{ taskData.title }}  
                    </textarea
          >
          <p class="flex justify-end pr-14 text-[10px]">
            {{ taskData.title.length }}/100
          </p>

          <p class="font-bold mt-2">Description</p>
          <textarea
            maxlength="500"
            class="itbkk-description border-2 w-[90%] h-[105%] resize-none italic bg-gray-400 bg-opacity-15 rounded-lg"
            v-model="taskData.description"
            :placeholder="taskData.description ? '' : 'No Description Provided'"
          >
                        {{
              taskData.description === null
                ? "No Description Provided"
                : taskData.description
            }}
          </textarea>
          <p class="flex justify-end pr-14 text-[10px]">
            {{
              taskData.description === null ? "0" : taskData.description.length
            }}/500
          </p>
        </div>

        <div class="w-1/2">
          <div class="font-bold">Assignees</div>
          <textarea
            maxlength="30"
            class="itbkk-assignees border-2 w-[80%] h-[30%] resize-none bg-gray-400 bg-opacity-15 rounded-lg pl-3"
            :class="{ 'italic text-gray-400': !taskData.assignees }"
            type="text"
            v-model="taskData.assignees"
            :placeholder="taskData.assignees ? '' : 'Unassigned'"
            >{{ taskData.assignees }}
                        </textarea
          >
          <p class="flex justify-end pr-20 text-[10px]">
            {{
              taskData.assignees === null ? "0" : taskData.assignees.length
            }}/30
          </p>

          <div class="font-bold">Status</div>

          <select
            class="itbkk-status md:w-[30%] z-40 h-8 bg-gray-400 bg-opacity-15 rounded-lg pl-2 pr-2 border-2"
            v-model="taskData.status"
          >
            <option
              v-for="(status, index) in Store.statuses"
              :key="index"
              :value="status.statusId"
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
            class="itbkk-created-on border-2 w-[80%] md:h-[10%] bg-gray-400 bg-opacity-15 rounded-lg pl-3"
          >
            {{ createTimeInBrowserTimezone }}
          </p>
          <div class="font-bold pt-1">Updated On</div>
          <p
            class="itbkk-updated-on border-2 w-[80%] md:h-[10%] bg-gray-400 bg-opacity-15 rounded-lg pl-3"
          >
            {{ updateTimeInBrowserTimezone }}
          </p>
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
          class="itbkk-button-confirm button buttonOK tooltip"
          :disabled="!isEdited || !checkAuthToken() || !userCollabWrite()"
          :class="{
            'tooltip-left': !checkAuthToken(),
          }"
          :data-tip="
            checkAuthToken()
              ? 'Update Task Data.'
              : 'You do not have permission to use this feature.'
          "
          @click="
            updateTask(route.params.id, {
              title: taskData.title,
              description: taskData.description,
              assignees: taskData.assignees,
              status: taskData.status,
            })
          "
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
  margin: 40px 2px;
  transition-duration: 0.4s;
  /* cursor: pointer; */
  border-radius: var(--rounded-btn, 0.5rem);
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
@media (max-width: 768px) {
  .button {
    padding: 10px 30px;
    font-size: 13px;
  }
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
