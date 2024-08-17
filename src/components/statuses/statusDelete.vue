<script setup>
import { defineEmits } from 'vue'
import { defineProps } from 'vue'

const emits = defineEmits(['closemodal', 'confirmed'])
const props = defineProps({
  statusName: { type: String },
})
</script>

<template>
  <div class="itbkk-message fixed modal-box">
    <h3 class="text-lg font-bold">Delete a status</h3>
    <p class="border-b mt-2"></p>
    <p class="itbkk-message py-4">
      Do you want to delete the status "{{ props.statusName }}"
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
