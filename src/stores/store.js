// store.js
// import { defineStore } from 'pinia'

// export const useStore = defineStore('task', {
//   state: () => ({
//     tasks: [],
//     statuss:[],
//     successAddTask:false,
//     successUpdateTask:false,
//     errorUpdateTask:false,
//     successUpdateStatus:false,
//     successAddStatus:false,
//     errorUpdateStatus:false

//   }),
// })
import { defineStore } from 'pinia'

export const useStore = defineStore('task', () => {
  const username = ''
  const boards = []
  const tasks = []
  const statuses = []
  const successAddTask = false
  const successUpdateTask = false
  const errorUpdateTask = false
  const successUpdateStatus = false
  const successAddStatus = false
  const errorUpdateStatus = false

  // Login error noti by chaiyo
  const errorLoginStatus = false
  return {
    username,
    boards,
    tasks,
    statuses,
    successAddStatus,
    successAddTask,
    successUpdateTask,
    successUpdateStatus,
    errorUpdateStatus,
    errorUpdateTask,

    // login by ch
    errorLoginStatus,
  }
})
