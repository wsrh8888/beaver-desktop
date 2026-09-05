<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-desktop-header-v2
-->

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
import Logger from 'renderModule/utils/logger'
import { defineComponent, ref } from 'vue'
import { getSearchFriendApi } from '../../../api/friend'
import SearchResults from './components/SearchResults.vue'

const logger = new Logger('SearchView')

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
      const keyword = searchValue.value.trim()
      const type = getSearchType()
      logger.info({ text: '搜索好友', data: { keyword, type } })

      try {
        const response = await getSearchFriendApi({ keyword, type })
        if (response.code === 0) {
          logger.info({ text: '搜索好友成功', data: { keyword, userId: response.result.userId } })
          searchResults.value = [{
            id: response.result.userId,
            title: response.result.nickName,
            avatar: response.result.avatar,
            conversationId: response.result.conversationId,
            type: 'friend',
            source: getSearchType(),
          }]
        }
        else {
          logger.warn({ text: '搜索好友失败', data: { keyword, code: response.code, msg: response.msg } })
          searchResults.value = []
        }
      }
      catch (error) {
        logger.error({ text: '搜索好友异常', data: { keyword, type, error } })
        searchResults.value = []
      }
    }
    const searchGroup = async () => {
      const keyword = searchValue.value.trim()
      logger.info({ text: '搜索群聊', data: { keyword } })

      try {
        const response = await searchGroupApi({ keyword })
        if (response.code === 0) {
          logger.info({ text: '搜索群聊成功', data: { keyword, count: response.result.list.length } })
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
          logger.warn({ text: '搜索群聊失败', data: { keyword, code: response.code, msg: response.msg } })
          searchResults.value = []
        }
      }
      catch (error) {
        logger.error({ text: '搜索群聊异常', data: { keyword, error } })
        searchResults.value = []
      }
    }

    // 执行搜索
    const handleSearch = async () => {
      const keyword = searchValue.value.trim()
      if (!keyword) {
        return
      }
      if (activeTab.value === 'friend') {
        await searchFriend()
      }
      else if (activeTab.value === 'group') {
        await searchGroup()
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
