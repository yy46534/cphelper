<template>
  <div class="topbar">
    <icon-btn class="btn" icon="add" @click="add" />
    <icon-btn v-if="!edit" class="btn" icon="edit" @click="enterEdit" />
    <icon-btn v-else class="btn" icon="clear" @click="leaveEdit" />
  </div>
</template>

<style scoped>
.topbar {
  text-align: left;
}
.btn:not(:last-child) {
  margin-right: 5px;
}
</style>

<script>
import IconBtn from './IconBtn'

export default {
  props: {
    edit: { type: Boolean, required: true }
  },
  components: {
    'icon-btn': IconBtn
  },
  methods: {
    add() {
      this.$emit('add')
    },
    enterEdit() {
      this.$emit('update:edit', true)
    },
    leaveEdit() {
      this.$emit('update:edit', false)
    }
  }
}
</script>


