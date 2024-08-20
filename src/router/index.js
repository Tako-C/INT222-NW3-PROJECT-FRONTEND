import { createRouter, createWebHistory } from 'vue-router'
import taskTable from '../components/taskTable.vue'
import taskDetail from '../components/taskDetail.vue'
import taskAdd from '@/components/taskAdd.vue'
import taskEdit from '@/components/taskEdit.vue'
import taskStatus from '@/components/statuses/StatusTable.vue'
import statusAdd from '@/components/statuses/statusAdd.vue'
import statusEdit from '@/components/statuses/statusEdit.vue'
import login from '@/components/login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  //history: createWebHistory("/nw3/"),
  routes: [
    {
      path: '/task',
      name: 'taskTable',
      component: taskTable,
      children: [
        { path: ':id', 
          name: 'taskDetail', 
          component: taskDetail },
        {
          path: 'add',
          name: 'taskAdd',
          component: taskAdd,
        },
        {
          path: ':id/edit',
          component: taskEdit,
        },
      ],
    },
    {
      path: '/status',
      name: 'StatusTable',
      component: taskStatus,
      children: [
        { 
          path: 'add', 
          name: 'StatusAdd', 
          component: statusAdd },
        { 
          path: ':id/edit',
          name: 'StatusEdit', 
          component: statusEdit }
      ]
    },
    // {
    //     path: "/",
    //     redirect: "/task",
    // },
    {
      path: '/login',
      name: 'login', 
      component: login
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/login',
    },
  ],
})

export default router
