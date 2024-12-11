<script setup>
import { ref, onMounted } from "vue"
import { addData } from "@/libs/fetchs.js"
import { useRouter, useRoute } from "vue-router"
import { useStore } from "@/stores/store.js"
import Cookies from "js-cookie"
import { checkAuthToken, checkrequestNewToken } from "@/libs/authToken.js"

const router = useRouter();
const route = useRoute();
const Store = useStore();
const boardId = ref(route.params.id);
let userLogin = Cookies.get("name");

function checkUserPermition() {
  if (checkAuthToken() === false) {
    Store.errorPage403 = true
    router.push({ name: "notFound" })
  }
}

let boardData = ref({
  board_name: `${Cookies.get("name")} personal board`,
})

function closeModal() {
  router.push({ name: "Board" })
  clearData()
}

function addToStore(newBoard) {
  boardData.value = { ...newBoard }
  boardData.value.owner = { ...boardData.value.owner }
  boardData.value.owner.oid = newBoard.oid
  boardData.value.owner.name = userLogin

  Store.boards.push(boardData.value)
  Store.successAddStatus = true
}

async function saveBoardData() {
  checkrequestNewToken(router)
  boardData.value.boards = boardId.value
  let result = await addData(boardData.value, `boards`)

  switch (result.status) {
    case 401:
      router.push({ name: "login" })
      Store.errorToken = true
      break
    case 400:
      router.push({ name: "Board" })
      break
    case 404:
      Store.errortext404 = "The Colabulate does not exist"
      Store.errorPage404 = true
      errorPermission()
      break;
    case 403:
      Store.errorPage403 = true
      errorPermission()
      break
    default:
      addToStore(result)
      closeModal()
      break
  }
}

function errorPermission() {
  router.push({ name: "notFound" });
}

function clearData() {
  boardData.value = {
    board_name: "",
  };
}
onMounted(() => {
  checkrequestNewToken(router)
  checkAuthToken()
  checkUserPermition()
})


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
      class="itbkk-modal-new fixed bg-white w-[80%] lg:w-[35%] h-auto indicator flex flex-col rounded-2xl shadow-2xl"
    >
      <div class="rounded-2xl">
        <h1 class="break-words w-[79%]">
          <span class="font-serif text-[100%]">Add </span
          ><span class="text-[70%] opacity-[60%] font-serif">New</span>
        </h1>
        <p class="border-b mt-2"></p>
      </div>

      <div class="mt-3 ml-7">
        <div class="font-bold">Name</div>
        <input
          maxlength="120"
          v-model="boardData.board_name"
          class="itbkk-board-name w-[90%] h-8 resize-none italic bg-slate-400 bg-opacity-15 rounded-lg border-2 pl-2"
        />
        <p class="flex justify-end pr-14 md:pr-20 text-[10px]">
          {{ boardData.board_name.length }}/120
        </p>
      </div>

      <div class="boxButton m-3">
        <button
          type="submit"
          class="itbkk-button-cancel button buttonClose"
          @click="closeModal()"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="itbkk-button-ok button buttonOK"
          @click="checkrequestNewToken(router),saveBoardData()"
          :disabled="boardData.board_name.length === 0"
          :class="{
            'cursor-not-allowed tooltip tooltip-left': !checkAuthToken(),
          }"
          :data-tip="
            checkAuthToken()
              ? ''
              : 'You do not have permission to use this feature.'
          "
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
  margin-top: 70px;
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
  /* cursor: pointer; */
  border-radius: var(--rounded-btn, 0.5rem);
}
@media (max-width: 768px) {
  .button {
    padding: 10px 30px;
    font-size: 13px;
  }
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
