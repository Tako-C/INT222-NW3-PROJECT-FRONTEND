<script setup>
import { defineEmits, ref } from "vue";
const props = defineProps({
  leaveCollab: {
    type: Object,
  },
});
const emits = defineEmits(["closemodal", "confirmed"]);
</script>

<template>
  <div class="fixed bg-black bg-opacity-30 w-screen h-screen">
    <div class="itbkk-modal-alert fixed modal-box">
      <h3 class="text-lg font-bold">Change access right</h3>
      <p class="border-b mt-2"></p>
      <p class="itbkk-message py-4">
        Do you want to leave
        <strong>"{{ leaveCollab.board_name }}"</strong> board ?
      </p>
      <div class="boxButton">
        <button
          @click="emits('closemodal')"
          class="itbkk-button-cancel button buttonCancel"
        >
          Cancel
        </button>
        <button
          @click="emits('confirmed')"
          class="itbkk-button-confirm button buttonConfirm"
        >
          Confirm
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
  margin: 15px 4px;
  transition-duration: 0.4s;
  cursor: pointer;
}
@media (max-width: 480px) {
  .button {
    padding: 8px 15px;
    font-size: 12px;
    margin: 12px 20px;
    width: 50%;
  }
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

.buttonConfirm {
  background-color: white;
  color: black;
  border: 2px solid #04aa6d;

  &:hover {
    background-color: #04aa6d;
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
