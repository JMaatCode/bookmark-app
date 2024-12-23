import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/bookmarks'
    },
    {
      path: '/bookmarks',
      name: 'bookmarks',
      component: () => import('../views/BookmarkList.vue')
    },
    {
      path: '/tags',
      name: 'tags',
      component: () => import('../views/TagManagement.vue')
    }
  ]
})

export default router
