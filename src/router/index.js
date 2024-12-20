import { createRouter, createWebHistory } from 'vue-router'
import boardTable from '@/components/boards/board.vue'
import boardTask from '@/components/boards/boardTask.vue'
import createBoard from '@/components/boards/createBoard.vue'
import boardDetail from '@/components/boards/boardDetail.vue'
import createTask from '@/components/tasks/createTask.vue'
import editTask from '@/components/tasks/EditTask.vue'
import statusTable from '@/components/statuses/statuses.vue'
import createStatus from '@/components/statuses/createStatus.vue'
import editStatus from '@/components/statuses/editStatus.vue'
import NotFound from '@/components/errorPage.vue'
import Collab from '@/components/boards/boardCollab.vue'
import createCollabUser from '@/components/collab/createCollabUser.vue'
import collabInvite from '@/components/invite/collabInvite.vue'


import login from '@/components/login.vue'
import Cookies from 'js-cookie'


function isAuthenticated() {
  const token = Cookies.get("token"); // เปลี่ยนเป็นการตรวจสอบ token จริง
  
  return !!token;
}
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  //history: createWebHistory("/nw3/"),
  routes: [
    {
      path: '/board',
      name: 'Board', 
      component: boardTable,
      children: [
        {
          path: 'add',
          name: 'createBoard',
          component: createBoard,
        },
        {
          path: ':id',
          name: 'BoardDetail',
          component: boardDetail,
        }
      ]
    },
    // {
    //   path: '/board/:id/collab/add',
    //   name: 'createCollab',
    //   component: createCollabUser,
    // },
    {
      path: '/board/:id/collab',
      name: 'collab',
      component: Collab,
      children: [
        {
          path: 'add',
          name: 'createCollab',
          component: createCollabUser,
        }
      ]
    },
    
    {
      path: '/board/:id/task',
      name: 'BoardTask',
      component: boardTask,
      children: [
        {
          path: 'add',
          name: 'createTask',
          component: createTask,
        },
        {
          path: ':taskId/edit',
          name: 'editTask',
          component: editTask,
        },
      ]
    },
    {
      path: '/board/:id/status',
      name: 'Status',
      component: statusTable,
      children: [
        {
          path: 'add',
          name: 'createStatus',
          component: createStatus,
        },
        {
          path: ':statusId/edit',
          name: 'editStatus',
          component: editStatus,
        },
      ]
    },
    // {
    //   path: '/board/:id/collab/invitation',
    //   name: 'collabInvite',
    //   component: collabInvite
    // },

    {
      path: '/collab/invitation',
      name: 'collabInvite',
      component: collabInvite
    },    
    {
        path: "/",
        redirect: "/board",
    },
    {
      path: '/login',
      name: 'login', 
      component: login
    },

    { path: '/NotFound',
      name: 'notFound',
       component: NotFound 
    },

    // {
    //   path: '/:catchAll(.*)',
    //   redirect: '/login',
    // },
  ],
})


// Global navigation guard
// router.beforeEach((to, from, next) => {
//   if (to.path === '/login') {
//     // Allow navigation to the login page
//     next();
//   } 
//   else if (!isAuthenticated()) {
//     // Allow navigation if authenticated
//     next();
//   } 
//   else {
//     // Redirect to login if not authenticated
//     next('/login');
//   }
// });

export default router
