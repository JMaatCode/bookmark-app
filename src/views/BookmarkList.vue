<template>
  <div class="bookmark-list">
    <Sidebar />

    <div class="main-content">
      <div class="page-header">
        <div class="header-actions">
          <div class="search-wrapper">
            <el-input
              v-model="searchQuery"
              placeholder="搜索书签、网址、描述或标签..."
              :prefix-icon="Search"
              clearable
              class="search-input"
            >
              <template #append>
                <el-tooltip
                  content="支持搜索书签标题、网址、描述和标签"
                  placement="bottom"
                  effect="light"
                >
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </template>
            </el-input>
          </div>
          <el-button type="primary" size="large" @click="showAddDialog">
            <el-icon><Plus /></el-icon>添加书签
          </el-button>
        </div>
      </div>

      <div v-if="searchQuery" class="search-stats">
        找到 {{ filteredBookmarks.length }} 个相关书签
      </div>

      <el-row :gutter="30" class="bookmark-grid">
        <el-col 
          :xl="12" 
          :lg="12" 
          :md="12" 
          :sm="24" 
          :xs="24" 
          v-for="bookmark in filteredBookmarks" 
          :key="bookmark.id"
        >
          <el-card class="bookmark-card" shadow="hover">
            <div class="card-header">
              <div class="icon-wrapper">
                <img :src="bookmark.icon" class="website-icon" />
              </div>
              <div class="website-info">
                <a :href="bookmark.url" target="_blank" class="website-title">{{ bookmark.title }}</a>
                <div class="website-url">{{ bookmark.url }}</div>
              </div>
            </div>
            <div class="card-content">
              <p class="description">{{ bookmark.description }}</p>
              <div class="tags">
                <el-tag
                  size="small"
                  effect="plain"
                  v-for="tag in bookmark.tags"
                  :key="tag"
                  class="tag-item"
                  round
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
            <div class="card-footer">
              <span class="time">{{ new Date(bookmark.createTime).toLocaleDateString() }}</span>
              <div class="actions">
                <el-button text type="primary" size="large" @click="handleEdit(bookmark)">
                  <el-icon class="icon"><EditPen /></el-icon>
                </el-button>
                <el-button text type="danger" size="large" @click="handleDelete(bookmark)">
                  <el-icon class="icon"><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty
        v-if="searchQuery && filteredBookmarks.length === 0"
        description="没有找到相关书签"
      >
        <template #image>
          <el-icon :size="60" class="empty-icon"><Search /></el-icon>
        </template>
      </el-empty>
    </div>

    <!-- 添加书签对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingBookmark ? '编辑书签' : '添加书签'"
      width="500px"
    >
      <el-form :model="bookmarkForm" label-width="80px">
        <el-form-item label="网站名称">
          <el-input v-model="bookmarkForm.title" placeholder="请输入网站名称" />
        </el-form-item>
        <el-form-item label="网址">
          <el-input v-model="bookmarkForm.url" placeholder="请输入网址" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="bookmarkForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入网站描述"
          />
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="bookmarkForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或创建标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in availableTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="editingBookmark ? handleSaveEdit() : handleAddBookmark()"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  Plus,
  EditPen,
  Delete,
  Search,
  Collection,
  Files,
  QuestionFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { storage } from '@/services/storage'
import type { Bookmark } from '@/types/bookmark'
import Sidebar from '@/components/Sidebar.vue'

const dialogVisible = ref(false)
const searchQuery = ref('')
const bookmarks = ref<Bookmark[]>([])
const availableTags = ref<string[]>([])
const bookmarkForm = ref({
  title: '',
  url: '',
  description: '',
  tags: [] as string[]
})
const editingBookmark = ref<Bookmark | null>(null)

const filteredBookmarks = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return bookmarks.value

  return bookmarks.value.filter(bookmark => {
    // 搜索标题
    const titleMatch = bookmark.title.toLowerCase().includes(query)
    // 搜索网址
    const urlMatch = bookmark.url.toLowerCase().includes(query)
    // 搜索描述
    const descriptionMatch = bookmark.description?.toLowerCase().includes(query) || false
    // 搜索标签
    const tagMatch = bookmark.tags.some(tag => tag.toLowerCase().includes(query))

    return titleMatch || urlMatch || descriptionMatch || tagMatch
  })
})

// 加载标签数据
const loadTags = () => {
  availableTags.value = storage.getTags()
}

// 加载书签数据
const loadBookmarks = () => {
  bookmarks.value = storage.getBookmarks()
}

onMounted(() => {
  loadBookmarks()
  loadTags()
})

const showAddDialog = () => {
  editingBookmark.value = null
  bookmarkForm.value = {
    title: '',
    url: '',
    description: '',
    tags: []
  }
  dialogVisible.value = true
}

const handleAddBookmark = () => {
  if (!bookmarkForm.value.title.trim()) {
    ElMessage.warning('请输入网站名称')
    return
  }
  if (!bookmarkForm.value.url.trim()) {
    ElMessage.warning('请输入网址')
    return
  }

  // 保存新标签
  const newTags = bookmarkForm.value.tags.filter(tag => !availableTags.value.includes(tag))
  if (newTags.length > 0) {
    const allTags = [...availableTags.value, ...newTags]
    storage.saveTags(allTags)
    availableTags.value = allTags
  }

  const newBookmark: Bookmark = {
    id: Date.now().toString(),
    title: bookmarkForm.value.title,
    url: bookmarkForm.value.url,
    description: bookmarkForm.value.description,
    tags: bookmarkForm.value.tags,
    createTime: new Date().toISOString(),
    icon: `https://www.google.com/s2/favicons?domain=${bookmarkForm.value.url}`
  }

  bookmarks.value.push(newBookmark)
  storage.saveBookmarks(bookmarks.value)

  ElMessage.success('添加成功')
  dialogVisible.value = false
  bookmarkForm.value = {
    title: '',
    url: '',
    description: '',
    tags: []
  }
}

const handleEdit = (bookmark: Bookmark) => {
  editingBookmark.value = bookmark
  bookmarkForm.value = {
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description || '',
    tags: [...bookmark.tags]
  }
  dialogVisible.value = true
}

const handleSaveEdit = () => {
  if (!bookmarkForm.value.title.trim()) {
    ElMessage.warning('请输入网站名称')
    return
  }
  if (!bookmarkForm.value.url.trim()) {
    ElMessage.warning('请输入网址')
    return
  }

  // 保存新标签
  const newTags = bookmarkForm.value.tags.filter(tag => !availableTags.value.includes(tag))
  if (newTags.length > 0) {
    const allTags = [...availableTags.value, ...newTags]
    storage.saveTags(allTags)
    availableTags.value = allTags
  }

  if (editingBookmark.value) {
    const index = bookmarks.value.findIndex(b => b.id === editingBookmark.value!.id)
    if (index !== -1) {
      bookmarks.value[index] = {
        ...editingBookmark.value,
        title: bookmarkForm.value.title,
        url: bookmarkForm.value.url,
        description: bookmarkForm.value.description,
        tags: bookmarkForm.value.tags,
        icon: `https://www.google.com/s2/favicons?domain=${bookmarkForm.value.url}`
      }
      storage.saveBookmarks(bookmarks.value)
      ElMessage.success('更新成功')
    }
  }

  dialogVisible.value = false
  editingBookmark.value = null
  bookmarkForm.value = {
    title: '',
    url: '',
    description: '',
    tags: []
  }
}

const handleDelete = async (bookmark: Bookmark) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个书签吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const index = bookmarks.value.findIndex(b => b.id === bookmark.id)
    if (index !== -1) {
      bookmarks.value.splice(index, 1)
      storage.saveBookmarks(bookmarks.value)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消删除
  }
}
</script>

<style scoped>
.bookmark-list {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  width: 100%;
}

.main-content {
  flex: 1;
  padding: 40px 48px;
  margin-left: 240px;
  width: calc(100% - 240px);
}

.page-header {
  margin-bottom: 40px;
  display: flex;
  justify-content: flex-end;
}

.header-actions {
  display: flex;
  gap: 20px;
  align-items: center;
}

.search-wrapper {
  position: relative;
  width: 400px;
}

.search-input {
  width: 100%;
}

:deep(.el-input-group__append) {
  padding: 0 12px;
  cursor: help;
}

.search-stats {
  margin-bottom: 24px;
  color: #606266;
  font-size: 14px;
}

.empty-icon {
  color: #909399;
}

.bookmark-grid {
  margin: 0 -15px;
}

.el-col {
  margin-bottom: 30px;
  padding: 0 15px;
}

.bookmark-card {
  height: 100%;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.bookmark-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 1;
}

:deep(.el-card__body) {
  padding: 24px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.website-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.website-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.website-title {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
  text-decoration: none;
  margin-bottom: 6px;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.website-url {
  color: #909399;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-content {
  min-height: 120px;
  margin: 20px 0;
}

.description {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
  min-height: 44px;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
  min-height: 50px;
}

.time {
  color: #909399;
  font-size: 13px;
}

.actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.actions .el-button {
  height: 44px;
  width: 44px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon {
  font-size: 22px;
}

@media (min-width: 1921px) {
  .main-content {
    max-width: calc(1920px - 240px);
    margin: 0 auto 0 240px;
  }
}

@media (max-width: 1600px) {
  .bookmark-grid {
    margin: 0 -10px;
  }
}

@media (max-width: 1200px) {
  .el-col {
    padding: 0 10px;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 20px;
    padding-bottom: 80px;
  }

  .bookmark-grid {
    margin: 0 -5px;
  }

  .el-col {
    padding: 0 5px;
  }

  .el-col {
    margin-bottom: 40px;
  }

  .header-actions {
    flex-direction: column;
    gap: 16px;
  }

  .search-wrapper {
    width: 100%;
  }
}
</style> 