<template>
  <EntityShareDialog
    v-model="visible"
    :card-type="CardType.CIRCLE"
    :id="circleId"
    :name="circleName"
  />
</template>

<script lang="ts">
import { CardType } from 'commonModule/type/ajax/chat'
import EntityShareDialog from 'renderModule/windows/app/page/message/right-component/content/components/entityShareDialog.vue'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'CircleShareDialog',
  components: { EntityShareDialog },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    circleId: {
      type: String,
      required: true,
    },
    circleName: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const visible = computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val),
    })

    return {
      CardType,
      visible,
    }
  },
})
</script>
