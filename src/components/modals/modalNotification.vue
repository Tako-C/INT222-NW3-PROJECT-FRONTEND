<script setup>
import { useStore } from "../../stores/store.js";
import { defineProps, ref, onMounted, watchEffect } from "vue";
import { defineEmits } from "vue";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from "@heroicons/vue/24/solid";

const emits = defineEmits(["closemodal"]);
const props = defineProps({
  errorDelete: { type: Boolean },
  successDelete: { type: Boolean },
  successDeleteStatus: { type: Boolean },
  errorDeleteStatus: { type: Boolean },
  // login by ch
  errorLoginStatus: { type: Boolean },
});
const Store = useStore();
const message = ref({ header: "", detail: "" });
let successAddTask = ref(Store.successAddTask);
let errorUpdateTask = ref(Store.errorUpdateTask);
let successUpdateTask = ref(Store.successUpdateTask);
let errorDelete = ref(props.errorDelete);
let successDelete = ref(props.successDelete);
let successAddStatus = ref(Store.successAddStatus);
let successUpdateStatus = ref(Store.successUpdateStatus);
let errorUpdateStatus = ref(Store.errorUpdateStatus);
let successDeleteStatus = ref(props.successDeleteStatus);
let errorDeleteStatus = ref(props.errorDeleteStatus);
let errorDeleteNoStatus = ref(Store.errorDeleteNoStatus);
let errorEditDefaultStatus = ref(Store.errorEditDefaultStatus);
let errorNotfoundStatus = ref(Store.errorNotfoundStatus);
let errorPrivate404 = ref(Store.errorPrivate404);
let errorPrivate404Content = ref(Store.errorPrivate404Content);

// collab
let errorPage409 = ref(Store.errorPage409);
let errorPage404 = ref(Store.errorPage404);
// login by ch
let errorLoginStatus = ref(props.errorLoginStatus);
let errorToken = ref(Store.errorToken);

watchEffect(() => {
  errorDelete.value = props.errorDelete;
  successDelete.value = props.successDelete;
  successAddTask.value = Store.successAddTask;
  errorUpdateTask.value = Store.errorUpdateTask;
  successUpdateTask.value = Store.successUpdateTask;
  successAddStatus.value = Store.successAddStatus;
  successUpdateStatus.value = Store.successUpdateStatus;
  errorUpdateStatus.value = Store.errorUpdateStatus;
  successDeleteStatus.value = props.successDeleteStatus;
  errorDeleteStatus.value = props.errorDeleteStatus;
  errorDeleteNoStatus.value = Store.errorDeleteNoStatus;
  errorEditDefaultStatus.value = Store.errorEditDefaultStatus;
  errorNotfoundStatus.value = Store.errorNotfoundStatus;
  errorPrivate404.value = Store.errorPrivate404;
  errorPrivate404Content.value = Store.errorPrivate404Content;

  errorPage409.value = Store.errorPage409;
  errorPage404.value = Store.errorPage404;
  // login by ch
  errorLoginStatus.value = props.errorLoginStatus;
  errorToken.value = Store.errorToken;
  checkEvent();
});

function checkEvent() {
  //Task
  if (successAddTask.value) {
    message.value.header = "Success!";
    message.value.detail = "The task has been successfully added.";
  } else if (errorUpdateTask.value) {
    message.value.header = "Error!";
    message.value.detail = "The task does not exist.";
  } else if (errorDelete.value) {
    message.value.header = "Error!";
    message.value.detail = "An error occurred while deleting the task.";
  } else if (successDelete.value) {
    message.value.header = "Success!";
    message.value.detail = "successfully Delete.";
  } else if (successUpdateTask.value) {
    message.value.header = "Success!";
    message.value.detail = "The update was successful.";

    //Status
  } else if (successAddStatus.value) {
    message.value.header = "Success!";
    message.value.detail = "The status has been added.";
  } else if (successUpdateStatus.value) {
    message.value.header = "Success!";
    message.value.detail = "The status has been updated.";
  } else if (errorUpdateStatus.value) {
    message.value.header = "Error!";
    message.value.detail = "An error has occurred, the status does not exist.";
  } else if (errorNotfoundStatus.value) {
    message.value.header = "Error!";
    message.value.detail = "The status does not exist.";
  } else if (successDeleteStatus.value) {
    message.value.header = "Success!";
    message.value.detail = "The status has been deleted.";
  } else if (errorDeleteStatus.value) {
    message.value.header = "Error!";
    message.value.detail = "An error has occurred, the status does not exist.";
  } else if (errorDeleteNoStatus.value) {
    message.value.header = "Error!";
    message.value.detail = "This status cannot be deleted.";
  } else if (errorEditDefaultStatus.value) {
    message.value.header = "Error!";
    message.value.detail = "This status cannot be edit.";
  }

  // login
  else if (errorLoginStatus.value) {
    message.value.header = "Error!";
    message.value.detail = "Username or Password is incorrect";
  } else if (errorToken.value) {
    message.value.header = "Error!";
    message.value.detail = "Something went wrong, Please try again later.";
  }

  // Private Error[404,403]
  else if (errorPrivate404.value) {
    message.value.header = "404 Error!";
    message.value.detail = `${errorPrivate404Content.value} Not found`;
  }

  // collab
  else if (errorPage409.value) {
    message.value.header = "409 Error!";
    message.value.detail =
      "The user is already the collaborator of this board.";
  } else if (errorPage404.value) {
    message.value.header = "404 Error!";
    message.value.detail = "The user does not exist.";
  }
}

onMounted(checkEvent);
</script>

<!-- <template>
  <div
    class="fixed modal-box z-50"
    :class="{
      'bg-green-100 border-green-600 border-2': message.header === 'Success!',
      'bg-red-100 border-red-600 border-2': message.header === 'Error!',
    }"
  >
    <div class="flex">
      <svg
        v-show="message.header === 'Error!'"
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
          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
        />
      </svg>
      <svg
        v-show="message.header === 'Success!'"
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
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
      <h3 class="text-xl font-bold p-1.5">{{ message.header }}</h3>
    </div>

    <p class="border-b mt-2"></p>
    <p class="itbkk-message py-4">{{ message.detail }}</p>
    <div class="boxButton">
      <button @click="emits('closemodal')" class="button buttonCancel">
        Close
      </button>
    </div>
  </div>
</template> -->

<template>
  <div class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div 
      class="modal-box max-w-md w-full mx-4 p-6 rounded-lg shadow-xl transition-all duration-300 ease-in-out transform"
      :class="{
        'bg-green-50 border-green-500': message.header === 'Success!',
        'bg-red-50 border-red-500': message.header === 'Error!',
        'scale-100 opacity-100': true,
        'scale-95 opacity-0': false
      }"
    >
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <CheckCircleIcon v-if="message.header === 'Success!'" class="w-8 h-8 text-green-500 mr-2" />
          <ExclamationTriangleIcon v-else class="w-8 h-8 text-red-500 mr-2" />
          <h3 class="text-xl font-bold" :class="{
            'text-green-700': message.header === 'Success!',
            'text-red-700': message.header === 'Error!',
            'text-red-700': message.header === '409 Error!'
          }">
            {{ message.header }}
          </h3>
        </div>
        <button @click="emits('closemodal')" class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <div class="border-t border-gray-200 my-4"></div>
      
      <p class="text-gray-600 mb-6">{{ message.detail }}</p>
      
      <div class="flex justify-end">
        <button 
          @click="emits('closemodal')" 
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
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
}
.button {
  margin-top: auto;
  background-color: #04aa6d;
  border: none;
  color: white;
  padding: 10px 30px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 15px;

  transition-duration: 0.4s;
  cursor: pointer;
}
.buttonCancel {
  background-color: white;
  color: black;
  border: 2px solid red;

  &:hover {
    background-color: red;
    color: white;
  }
}

.modal-box {
  position: fixed;
  top: 15%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
