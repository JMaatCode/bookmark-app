<template>
  <div class="tag-management">
    <Sidebar />
    <div class="main-content">
      <div class="page-header">
        <h2>标签管理</h2>
        <el-button type="primary" size="large" @click="showAddDialog">
          <el-icon><Plus /></el-icon>新增标签
        </el-button>
      </div>

      <div class="tags-container">
        <el-card v-for="tag in tags" :key="tag" class="tag-card" shadow="hover">
          <div class="tag-content">
            <el-tag size="large" round>{{ tag }}</el-tag>
            <div class="tag-actions">
              <el-button type="primary" text @click="handleEdit(tag)">
                <el-icon><EditPen /></el-icon>
              </el-button>
              <el-button type="danger" text @click="handleDelete(tag)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 添加/编辑标签对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingTag ? '编辑标签' : '新增标签'"
      width="400px"
    >
      <el-form :model="tagForm" label-width="80px">
        <el-form-item label="标签名称">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, EditPen, Delete } from '@element-plus/icons-vue'
import Sidebar from '@/components/Sidebar.vue'
import { storage } from '@/services/storage'

const tags = ref<string[]>([])
const dialogVisible = ref(false)
const editingTag = ref<string | null>(null)
const tagForm = ref({
  name: ''
})

const loadTags = () => {
  tags.value = storage.getTags()
}

const showAddDialog = () => {
  editingTag.value = null
  tagForm.value.name = ''
  dialogVisible.value = true
}

const handleEdit = (tag: string) => {
  editingTag.value = tag
  tagForm.value.name = tag
  dialogVisible.value = true
}

const handleSave = () => {
  if (!tagForm.value.name.trim()) {
    ElMessage.warning('请输入标签名称')
    return
  }

  const newTags = [...tags.value]
  if (editingTag.value) {
    const index = newTags.indexOf(editingTag.value)
    if (index !== -1) {
      newTags[index] = tagForm.value.name
    }
  } else {
    if (newTags.includes(tagForm.value.name)) {
      ElMessage.warning('标签已存在')
      return
    }
    newTags.push(tagForm.value.name)
  }

  storage.saveTags(newTags)
  tags.value = newTags
  dialogVisible.value = false
  ElMessage.success(editingTag.value ? '更新成功' : '添加成功')
}

const handleDelete = async (tag: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个标签吗？删除后，所有使用该标签的书签将移除此标签。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const newTags = tags.value.filter(t => t !== tag)
    storage.saveTags(newTags)
    tags.value = newTags

    const bookmarks = storage.getBookmarks()
    const updatedBookmarks = bookmarks.map(bookmark => ({
      ...bookmark,
      tags: bookmark.tags.filter(t => t !== tag)
    }))
    storage.saveBookmarks(updatedBookmarks)

    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

onMounted(() => {
  loadTags()
})
</script>

<style scoped>
.tag-management {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.main-content {
  flex: 1;
  padding: 40px 48px;
  margin-left: 240px;
}

.page-header {
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.tags-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.tag-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.tag-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.tag-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

:deep(.el-tag) {
  font-size: 16px;
  padding: 8px 16px;
  height: auto;
}

.tag-actions {
  display: flex;
  gap: 8px;
}

.tag-actions .el-button {
  font-size: 20px;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 20px;
    padding-bottom: 80px; /* 为底部导航留出空间 */
  }

  .tags-container {
    grid-template-columns: 1fr;
  }
}
</style> 