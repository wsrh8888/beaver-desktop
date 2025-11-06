<template>
  <div class="search-panel">
    <div class="search-bar">
      <BeaverInput
        v-model="searchValue"
        type="text"
        placeholder="输入关键词"
        @keydown.enter="handleSearch"
      />
      <BeaverButton
        class="search-btn"
        type="primary"
        @click="handleSearch"
      >
        搜索
      </BeaverButton>
    </div>
    <!-- 标签页组件 -->
    <TabsComponent
      v-model="activeTab"
      :tabs="tabs"
      type="line"
      @tab-click="handleTabClick"
    />

    <!-- 结果区域组件 -->
    <SearchResults
      :results="searchResults"
    />
  </div>
</template>

<script lang="ts">
import type { ISearchResult } from 'commonModule/type/view/search'
import { isValidEmail } from 'commonModule/utils/validation'
import { searchGroupApi } from 'renderModule/api/group'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverInput from 'renderModule/components/ui/input/Input.vue'
import TabsComponent from 'renderModule/components/ui/tabs/Tabs.vue'
import { defineComponent, ref } from 'vue'
import { getSearchFriendApi } from '../../api/friend'
import SearchResults from './components/SearchResults.vue'

export default defineComponent({
  name: 'SearchView',
  components: {
    TabsComponent,
    SearchResults,
    BeaverInput,
    BeaverButton,
  },
  setup() {
    const searchValue = ref('')
    const activeTab = ref<string>('friend')
    const searchResults = ref<ISearchResult[]>([])

    const handleTabClick = () => {
      searchResults.value = []
    }

    const getSearchType = () => {
      // 判断是否是邮箱
      if (isValidEmail(searchValue.value)) {
        return 'email'
      }
      return 'userId'
    }
    const searchFriend = async () => {
      const response = await getSearchFriendApi({ keyword: searchValue.value.trim(), type: getSearchType() })
      if (response.code === 0) {
        searchResults.value = [{
          id: response.result.userId,
          title: response.result.nickname,
          avatar: response.result.avatar,
          conversationId: response.result.conversationId,
          type: 'friend',
          source: getSearchType(),
        }]
      }
      else {
        searchResults.value = []
      }
    }
    const searchGroup = async () => {
      const response = await searchGroupApi({ keyword: searchValue.value.trim() })
      if (response.code === 0) {
        searchResults.value = response.result.list.map(group => ({
          id: group.groupId,
          title: group.name,
          avatar: group.avatar || '',
          conversationId: group.conversationId || '',
          type: 'group',
          source: '',
        }))
      }
      else {
        searchResults.value = []
      }
    }

    // 执行搜索
    const handleSearch = async () => {
      const keyword = searchValue.value.trim()
      if (!keyword) {
        return
      }
      window.electron.window.openWindow('verify', { isHide: true })
      if (activeTab.value === 'friend') {
        searchFriend()
      }
      else if (activeTab.value === 'group') {
        searchGroup()
      }
    }

    return {
      searchValue,
      activeTab,
      handleTabClick,
      tabs: [
        { key: 'friend', label: '好友' },
        { key: 'group', label: '群聊' },
      ],
      searchResults,
      handleSearch,
    }
  },
})
</script>

<style lang="less" scoped>
.search-panel {
  width: 100%;
  height: calc(100vh - 40px); // 减去标题栏高度
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .search-bar {
    display: flex;
    gap: 8px;
    padding: 10px 0;

  }
}
</style>
