<template>
  <div class="settings-field">
    <div class="field-title">
      登录设备
    </div>
    <div class="field-desc">
      查看并管理已登录的设备，可将其他设备踢下线
    </div>
    <div v-if="isLoading" class="loading-tip">
      加载中...
    </div>
    <div v-else-if="devices.length === 0" class="empty-tip">
      暂无登录设备
    </div>
    <div v-else class="device-list">
      <div
        v-for="device in devices"
        :key="device.deviceId"
        class="device-item"
      >
        <div class="device-info">
          <div class="device-name">
            {{ device.deviceName || '未知设备' }}
            <span v-if="isCurrentDevice(device.deviceId)" class="current-tag">本机</span>
            <span v-else-if="device.isOnline" class="online-tag">在线</span>
          </div>
          <div class="device-meta">
            {{ formatDeviceMeta(device) }}
          </div>
          <div class="device-time">
            最近登录：{{ device.lastLoginTime }}
          </div>
        </div>
        <BeaverButton
          v-if="!isCurrentDevice(device.deviceId) && device.isOnline"
          type="default"
          size="small"
          :loading="kickingId === device.deviceId"
          @click="handleKick(device.deviceId)"
        >
          踢下线
        </BeaverButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { IDeviceInfo } from 'commonModule/type/ajax/auth'
import type { ISettingsSection } from '../../config/settingsRegistry'
import { getDevicesApi, kickDeviceApi } from 'renderModule/api/auth'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import Message from 'renderModule/components/ui/message'
import MessageBox from 'renderModule/components/ui/messagebox'
import { defineComponent, onMounted, ref, type PropType } from 'vue'

export default defineComponent({
  name: 'DeviceListField',
  components: {
    BeaverButton,
  },
  props: {
    section: {
      type: Object as PropType<ISettingsSection>,
      required: true,
    },
  },
  setup() {
    const devices = ref<IDeviceInfo[]>([])
    const isLoading = ref(false)
    const kickingId = ref('')
    const currentDeviceId = ref('')

    const loadDevices = async () => {
      isLoading.value = true
      const res = await getDevicesApi()
      isLoading.value = false

      if (res.code === 0 && res.result) {
        devices.value = res.result.devices || []
        return
      }
      Message.error(res.msg || '获取设备列表失败')
    }

    const isCurrentDevice = (deviceId: string) => deviceId === currentDeviceId.value

    const formatDeviceMeta = (device: IDeviceInfo) => {
      const osLabel = device.deviceOsVersion
        ? `${device.deviceOs} ${device.deviceOsVersion}`
        : device.deviceOs
      return [device.deviceModel, osLabel, device.lastLoginIp].filter(Boolean).join(' · ')
    }

    const handleKick = (deviceId: string) => {
      MessageBox.confirm('确定要将该设备踢下线吗？', '提示').then(async () => {
        kickingId.value = deviceId
        const res = await kickDeviceApi({ deviceId })
        kickingId.value = ''

        if (res.code === 0) {
          Message.success('已踢下线')
          await loadDevices()
          return
        }
        Message.error(res.msg || '操作失败')
      })
    }

    onMounted(() => {
      currentDeviceId.value = electron.app.devicedId || ''
      loadDevices()
    })

    return {
      devices,
      isLoading,
      kickingId,
      isCurrentDevice,
      formatDeviceMeta,
      handleKick,
    }
  },
})
</script>

<style lang="less" scoped>
.settings-field {
  .field-title {
    font-size: 16px;
    font-weight: 500;
    color: #2D3436;
    margin-bottom: 8px;
  }

  .field-desc {
    font-size: 13px;
    color: #B2BEC3;
    margin-bottom: 24px;
    line-height: 1.5;
  }

  .loading-tip,
  .empty-tip {
    text-align: center;
    padding: 48px 0;
    font-size: 14px;
    color: #B2BEC3;
  }

  .device-list {
    .device-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
      border-bottom: 1px solid #EBEEF5;

      &:last-child {
        border-bottom: none;
      }

      .device-info {
        flex: 1;
        min-width: 0;
        padding-right: 16px;
      }

      .device-name {
        font-size: 14px;
        font-weight: 500;
        color: #2D3436;
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .current-tag {
        font-size: 11px;
        color: #FF7D45;
        background: rgba(255, 125, 69, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 400;
      }

      .online-tag {
        font-size: 11px;
        color: #00B894;
        background: rgba(0, 184, 148, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 400;
      }

      .device-meta,
      .device-time {
        font-size: 12px;
        color: #B2BEC3;
        margin-top: 2px;
      }
    }
  }
}
</style>
