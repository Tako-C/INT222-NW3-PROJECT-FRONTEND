<script setup>
import { defineEmits, watchEffect } from 'vue'
import { ref, defineProps } from 'vue'
import { useStore } from '@/stores/store.js'
const emits = defineEmits(['closemodal', 'confirmed'])
const Store = useStore()
const props = defineProps({
  statusName: { type: String },
})
const statusData = ref([])
const transferStatus = ref(null)

watchEffect(() => {
  statusData.value = [...Store.statuses]
  if (
    props.statusName &&
    statusData.value.some((status) => status.name === props.statusName)
  ) {
    statusData.value = statusData.value.filter(
      (status) => status.name !== props.statusName
    )
  }
})
</script>

<template>
  <div class="fixed modal-box z-40">
    <h3 class="text-lg font-bold">Transfer a Status</h3>
    <p class="border-b mt-2"></p>
    {{ (props.statusName, statusData.value) }}
    <p class="itbkk-message py-4">
      There is some task associated with the Doing status.
    </p>
    <p class="itbkk-message py-4">
      Transfer to
      <select
        class="itbkk-status w-[30%] h-8 bg-gray-400 bg-opacity-15 rounded-lg pl-2 pr-2 border-2"
        v-model="transferStatus"
      >
        <option
          v-for="(status, index) in statusData"
          :key="index"
          :value="status.name"
        >
          {{ status.name }}
        </option>
      </select>
    </p>

    <div class="boxButton">
      <button
        @click="emits('closemodal')"
        class="itbkk-button-cancel button buttonCancel"
      >
        Cancel
      </button>
      <button
        @click="
          emits('confirmed', {
            removeStatus: props.statusName,
            transferStatus: transferStatus,
          })
        "
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
