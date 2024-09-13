<script setup>
import { ref, onMounted,computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '@/stores/store.js'
import { removeById, getData ,getBoard} from '@/libs/fetchs.js'


import modalNotification from '@/components/modals/modalNotification.vue'
import modalconfirmed from '@/components/modals/modalConfirmed.vue'
import Cookies from 'js-cookie'


const Store = useStore()
let boardData = ref([])
let statusData = ref([])
const router = useRouter()
const route = useRoute()

// const optionsDropDownIndex = ref(null)
// const errorDelete = ref(false)
// const successDelete = ref(false)
// const openConfirmed = ref(false)
// const taskTitle = ref('')
// const taskID = ref('')
// const sortStatus = ref(0)
// const newFilterString = ref('')
// const filterList = ref([])
// const showStatusList = ref(false)

const username = ref(Cookies.get('name'))

const isBoardPage = computed(() => route.path.startsWith('/board'))
const isStatusPage = computed(() => route.path.endsWith('/status'));
const isStatusDropdownOpen = ref(false)
const isTaskDropdownOpen = ref(false)

function getImageUrl(index){
//   return `/nw3/images/bg-theme-${(index %5) +1}.jpg`
 return `/images/bg-theme-${(index %5) +1}.jpg`
 
}

async function fetchData() {
  let endpoint = 'boards'
      boardData.value = await getBoard(endpoint)
  Store.boards = boardData.value
  console.log(boardData.value)
}
function openBoardDetailModal(boardId) {
  router.push({ name:'BoardDetail', params: { id: boardId } })
}
function openStatuses(boardId) {
  router.push({ name:'Status', params: { id: boardId } })

}
function openCreateBoard(boardId) {
  router.push({ name:'createBoard', params: { id: boardId } })

}
function toggleStatusDropdown() {
    isStatusDropdownOpen.value = !isStatusDropdownOpen.value;
}
function toggleTaskDropdown() {
    isTaskDropdownOpen.value = !isTaskDropdownOpen.value;
}


onMounted(() => {
    fetchData()
})
</script>
 

<template>
  
    <div class="class name : itbkk-modal-task w-screen  bg-slate-200  h-screen flex">

    <header
    name="header"
    class=" top-0 z-10 h-full w-[25%] border-orange-400  bg-slate-100 shadow-lg flex flex-col items-center justify-between  px-6  text-white rounded-r-3xl"
  >
    <div class="flex ">
        <div class="flex flex-col items-start justify-start first-letter:mx-auto space-x-4 pt-5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFA500" class="size-6">
                <path d="M6 3a3 3 0 0 0-3 3v2.25a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6ZM15.75 3a3 3 0 0 0-3 3v2.25a3 3 0 0 0 3 3H18a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3h-2.25ZM6 12.75a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3v-2.25a3 3 0 0 0-3-3H6ZM17.625 13.5a.75.75 0 0 0-1.5 0v2.625H13.5a.75.75 0 0 0 0 1.5h2.625v2.625a.75.75 0 0 0 1.5 0v-2.625h2.625a.75.75 0 0 0 0-1.5h-2.625V13.5Z" />
            </svg>
        </div>
        <div class="p-5">
            <h3 class="text-xl font-bold font-serif titleShadow text-center text-black">
             Kradan Kanban <br>Boards
            </h3>
        </div>
    </div>
    <!-- <div class="flex flex-col">
        <div class="w-60 p-5 flex " :class="['rounded-md' ,{ 'bg-orange-400': isBoardPage }]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="gray"  :style="{ stroke: isBoardPage ? 'white' : 'gray' }" class="size-6" >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122" />
            </svg>
            <p class="pl-3" :class="{ 'text-white': isBoardPage, 'text-slate-400': !isBoardPage }">Board</p>
        </div>
        <div class="w-60 p-5 flex " :class="['rounded-md' ,{ 'bg-orange-400': isStatusPage }]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="gray"  :style="{ stroke: isStatusPage ? 'white' : 'gray' }" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
            </svg>

            <p class="pl-3" :class="{ 'text-white': isStatusPage, 'text-slate-400': !isStatusPage } " @click="openStatuses()">Statuses</p>
        </div>
        
    </div> -->

    <div class="flex flex-col">
    <!-- Board Section -->
        <div class="w-60 p-5 flex items-center justify-between cursor-pointer" :class="['rounded-md', { 'bg-orange-400': isBoardPage }]" @click="toggleTaskDropdown()">
            <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" :stroke="isBoardPage ? 'white' : 'gray'" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122" />
                </svg>
                <p class="pl-3" :class="{ 'text-white': isBoardPage, 'text-slate-400': !isBoardPage }">Board</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" :stroke="isBoardPage ? 'white' : 'gray'" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" :d="isTaskDropdownOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'" />
            </svg>
        </div>

        <!-- Dropdown for boards -->
        <div v-show="isTaskDropdownOpen" class="w-60 mt-2 pl-4 border border-gray-300 bg-white rounded-md shadow-lg max-h-20 overflow-y-auto">
            <ul>
                <li class="py-2 text-slate-400 hover:text-black cursor-pointer" @click="openBoards">
                    All
                </li>
                <li v-for="(board, index) in Store.boards" :key="index" class="py-2 text-slate-400 hover:text-black cursor-pointer"
                @click="openBoardDetailModal(board.boardId)"
                >
                    {{ board.board_name }}
                </li>
            </ul>
        </div>

        <!-- Statuses Section -->
        <div class="w-60 p-5 flex items-center justify-between cursor-pointer" :class="['rounded-md', { 'bg-orange-400': isStatusPage }]" @click="toggleStatusDropdown()">
            <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" :stroke="isStatusPage ? 'white' : 'gray'" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
                </svg>
                <p class="pl-3" :class="{ 'text-white': isStatusPage, 'text-slate-400': !isStatusPage }">Statuses</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" :stroke="isStatusPage ? 'white' : 'gray'" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" :d="isStatusDropdownOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'" />
            </svg>
        </div>

        <!-- Dropdown for statuses -->
        <div v-show="isStatusDropdownOpen" class="w-60 mt-2 pl-4 border border-gray-300 bg-white rounded-md shadow-lg max-h-20 overflow-y-auto">
            <ul>
                <li v-for="(board, index) in Store.boards" :key="index" class="py-2 text-slate-400 hover:text-black cursor-pointer"
                @click="openStatuses(board.boardId)"
                >
                    {{ board.board_name }}
                </li>
            </ul>
        </div>
    </div>


    <div class="bg-orange-400 p-2 flex my-14 justify-between w-3/4">
        
        <div class="flex items-center space-x-2 p-1 ">
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
        </div>
        <p class="itbkk-fullname text-sm font-medium p-1">
            {{ Store.username }}
        </p>
        <div class="flex items-center justify-center right-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
        </div>
    </div>
    <div class="fixed right-0 mt-3 flex  bg-orange-400 items-center justify-center h-14 w-40 rounded-xl"
        @click="openCreateBoard()">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <p class="pl-2">Create Board</p>
    </div>
  </header>

  <!-- Table สำหรับแสดงข้อมูลของ board -->
  <main class="w-auto h-full overflow-y-scroll">
    <h1 class="text-3xl font-bold text-black ml-10 mt-10">{{Store.username}} Personal Board</h1>
    <div class=" h-screen p-8">
    <div class="flex flex-wrap gap-4 ">
      <div v-for="(board ,index) in Store.boards" :key="index" 
      class="bg-white rounded-lg shadow p-6 w-10 md:w-1/5 lg:w-1/5 flex flex-col"
      @click="openBoardDetailModal(board.boardId)"
      >{{ board.board }}
        <div class="mb-4">
            <img :src="getImageUrl(index)" alt="bg-board" class="w-full h-full object-cover rounded-2xl">
        </div>
        <h3 class="text-lg font-bold mb-2">{{ board.board_name }}</h3>
        
      </div>
    </div>
  </div>
    
  </main>
    <router-view />
  </div>

  </template>
 
<style scoped>

</style>