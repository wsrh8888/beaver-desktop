/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IDocItem, INodeItem, ISpaceItem } from '@packageCommon/type/ajax/doc'
import {
  createNodeApi,
  getDocApi,
  listNodesApi,
  listSpacesApi,
} from '@packageRender/api/doc'
import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 文档工作区状态：当前空间、节点树、当前文档。
 * 正文编辑不进 store（由 TipTap/Yjs 直连 doc_sync_ws 协同），store 只管导航骨架。
 */
export const useDocStore = defineStore('doc', () => {
  const spaces = ref<ISpaceItem[]>([])
  const currentSpaceId = ref('')
  const nodes = ref<INodeItem[]>([])
  const currentDoc = ref<IDocItem | null>(null)
  const loading = ref(false)

  async function loadSpaces() {
    loading.value = true
    try {
      const res = await listSpacesApi({ page: 1, pageSize: 100 })
      spaces.value = res.result?.spaces || []
      if (!currentSpaceId.value && spaces.value.length)
        currentSpaceId.value = spaces.value[0].spaceId
    }
    finally {
      loading.value = false
    }
  }

  async function selectSpace(spaceId: string) {
    currentSpaceId.value = spaceId
    currentDoc.value = null
    const res = await listNodesApi({ spaceId })
    nodes.value = res.result?.nodes || []
  }

  async function openDoc(docId: string) {
    const res = await getDocApi({ docId })
    currentDoc.value = res.result?.doc || null
  }

  async function addPage(spaceId: string, parentId: string, title: string) {
    const res = await createNodeApi({ spaceId, parentId, title, type: 'page' })
    await selectSpace(spaceId)
    const docId = res.result?.docId
    if (docId)
      await openDoc(docId)
    return res.result
  }

  return {
    spaces,
    currentSpaceId,
    nodes,
    currentDoc,
    loading,
    loadSpaces,
    selectSpace,
    openDoc,
    addPage,
  }
})
