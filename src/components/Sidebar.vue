<template>
  <div>
    <!-- 桌面端侧边栏 -->
    <div class="sidebar desktop-only">
      <h1 class="main-title">书签收藏</h1>
      <p class="slogan">收藏美好<br>分享快乐</p>
      
      <div class="nav-menu">
        <router-link to="/bookmarks" class="nav-item" :class="{ active: currentPath === '/bookmarks' }">
          <el-icon><Collection /></el-icon>
          我的书签
        </router-link>
        <router-link to="/tags" class="nav-item" :class="{ active: currentPath === '/tags' }">
          <el-icon><Files /></el-icon>
          标签管理
        </router-link>
      </div>
    </div>

    <!-- 只在移动端显示底部导航栏 -->
    <div class="mobile-nav">
      <router-link to="/bookmarks" class="nav-item" :class="{ active: currentPath === '/bookmarks' }">
        <el-icon><Collection /></el-icon>
        <span>书签</span>
      </router-link>
      <router-link to="/tags" class="nav-item" :class="{ active: currentPath === '/tags' }">
        <el-icon><Files /></el-icon>
        <span>标签</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Collection, Files } from '@element-plus/icons-vue'

const route = useRoute()
const currentPath = ref(route.path)

// 监听路由变化以更新当前路径
watch(() => route.path, (newPath) => {
  currentPath.value = newPath
})

onMounted(() => {
  currentPath.value = route.path
})
</script>

<style scoped>
/* 桌面端样式 */
.sidebar {
  width: 240px;
  padding: 40px 0;
  background-color: #fff;
  position: fixed;
  height: 100vh;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.main-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  padding: 0 30px;
  margin-bottom: 20px;
}

.slogan {
  color: #666;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  padding: 0 30px;
  margin-bottom: 40px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #606266;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
  font-size: 16px;
}

.nav-item:hover {
  background-color: #f0f2f5;
  color: #409EFF;
}

.nav-item.active {
  background-color: #ecf5ff;
  color: #409EFF;
}

.nav-item .el-icon {
  font-size: 20px;
}

/* 移动端底部导航栏默认隐藏 */
.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  justify-content: space-around;
  padding: 8px 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  z-index: 1000;
}

.mobile-nav .nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #606266;
  padding: 8px 0;
  transition: all 0.3s;
  flex: 1;
}

.mobile-nav .nav-item.active {
  color: #409EFF;
}

.mobile-nav .el-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.mobile-nav span {
  font-size: 12px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .sidebar {
    display: none; /* 移动端隐藏侧边栏 */
  }

  .mobile-nav {
    display: flex; /* 移动端显示底部导航 */
  }
}
</style> 