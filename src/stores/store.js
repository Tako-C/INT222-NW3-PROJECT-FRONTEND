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
  const collaborate = []
  const successAddTask = false
  const successUpdateTask = false
  const errorUpdateTask = false
  const successUpdateStatus = false
  const successAddStatus = false
  const errorUpdateStatus = false
  const errorDeleteNoStatus = false
  const errorEditDefaultStatus = false
  const errorNotfoundStatus = false
  const errorPage409 = false
  const errorPage403 = false
  const errorPage404 = false
  const errorPage401 = false
  const errortext404 = ''
  const errorPrivate404 = false
  const errorPrivate404Content = ''

  // Login error noti by chaiyo
  const errorLoginStatus = false
  return {
    username,
    boards,
    tasks,
    statuses,
    collaborate,
    successAddStatus,
    successAddTask,
    successUpdateTask,
    successUpdateStatus,
    errorUpdateStatus,
    errorUpdateTask,
    errorEditDefaultStatus,
    errorNotfoundStatus,
    

    // login by ch
    errorLoginStatus,
    errorDeleteNoStatus,

    // Error Page
    errorPage409,
    errorPage403,
    errorPage404,
    errorPage401,
    errortext404,

    // Error Private 
    errorPrivate404,
    errorPrivate404Content

  }
})
