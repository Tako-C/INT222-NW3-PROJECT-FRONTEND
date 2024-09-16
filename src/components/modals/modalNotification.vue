<script setup>
import { useStore } from '../../stores/store.js';
import { defineProps, ref, onMounted, watchEffect } from 'vue';
import { defineEmits } from 'vue';

const emits = defineEmits(['closemodal']);
const props = defineProps({
  errorDelete: { type: Boolean },
  successDelete: { type: Boolean },
  successDeleteStatus: { type: Boolean },
  errorDeleteStatus: { type: Boolean },
  // login by ch
  errorLoginStatus: { type: Boolean },
});
const Store = useStore();
const message = ref({ header: '', detail: '' })
let successAddTask = ref(Store.successAddTask)
let errorUpdateTask = ref(Store.errorUpdateTask)
let successUpdateTask = ref(Store.successUpdateTask)
let errorDelete = ref(props.errorDelete)
let successDelete = ref(props.successDelete)
let successAddStatus = ref(Store.successAddStatus)
let successUpdateStatus = ref(Store.successUpdateStatus)
let errorUpdateStatus = ref(Store.errorUpdateStatus)
let successDeleteStatus = ref(props.successDeleteStatus)
let errorDeleteStatus = ref(props.errorDeleteStatus)
let errorDeleteNoStatus = ref(Store.errorDeleteNoStatus)
let errorEditDefaultStatus = ref(Store.errorEditDefaultStatus)

// login by ch
let errorLoginStatus = ref(props.errorLoginStatus)
let errorToken = ref(Store.errorToken)

watchEffect(() => {
  errorDelete.value = props.errorDelete
  successDelete.value = props.successDelete
  successAddTask.value = Store.successAddTask
  errorUpdateTask.value = Store.errorUpdateTask
  successUpdateTask.value = Store.successUpdateTask
  successAddStatus.value = Store.successAddStatus
  successUpdateStatus.value = Store.successUpdateStatus
  errorUpdateStatus.value = Store.errorUpdateStatus
  successDeleteStatus.value = props.successDeleteStatus
  errorDeleteStatus.value = props.errorDeleteStatus
  errorDeleteNoStatus.value = Store.errorDeleteNoStatus
  errorEditDefaultStatus.value = Store.errorEditDefaultStatus

  // login by ch
  errorLoginStatus.value = props.errorLoginStatus
  errorToken.value = Store.errorToken
  checkEvent();
});

function checkEvent() {
  //Task
  if (successAddTask.value) {
    message.value.header = 'Success!'
    message.value.detail = 'The task has been successfully added.'
  } else if (errorUpdateTask.value) {
    message.value.header = 'Error!'
    message.value.detail = 'The task does not exist.'
  } else if (errorDelete.value) {
    message.value.header = 'Error!'
    message.value.detail = 'An error occurred while deleting the task.'
  } else if (successDelete.value) {
    message.value.header = 'Success!'
    message.value.detail = 'successfully Delete.'
  } else if (successUpdateTask.value) {
    message.value.header = 'Success!'
    message.value.detail = 'The update was successful.'

    //Status
  } else if (successAddStatus.value) {
    message.value.header = 'Success!'
    message.value.detail = 'The status has been added.'
  } else if (successUpdateStatus.value) {
    message.value.header = 'Success!'
    message.value.detail = 'The status has been updated.'
  } else if (errorUpdateStatus.value) {
    message.value.header = 'Error!'
    message.value.detail = 'An error has occurred, the status does not exist.'
  } else if (successDeleteStatus.value) {
    message.value.header = 'Success!'
    message.value.detail = 'The status has been deleted.'
  } else if (errorDeleteStatus.value) {
    message.value.header = 'Error!'
    message.value.detail = 'An error has occurred, the status does not exist.'
  } else if (errorDeleteNoStatus.value) {
    message.value.header = 'Error!'
    message.value.detail = 'This status cannot be deleted.'
  } else if (errorEditDefaultStatus.value) {
    message.value.header = 'Error!'
    message.value.detail = 'This status cannot be edit.'
  }


  // login
  else if (errorLoginStatus.value) {
    message.value.header = 'Error!';
    message.value.detail = 'Username or Password is incorrect';
  } else if (errorToken.value) {
    message.value.header = 'Error!';
    message.value.detail = 'Something went wrong, Please try again later.';
  }
}

onMounted(checkEvent);
</script>

<template>
  <div
    class="fixed modal-box"
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
