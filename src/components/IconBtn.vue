<template>
  <b-button class="icon-btn" :class="size" @click="clicked">
    <div class="icon">
      <i class="material-icons">{{ icon }}</i>
    </div>
  </b-button>
</template>

<style scoped>
.icon-btn {
  padding: 0; 
}
.icon-btn.md {
  width: 30px;
  height: 30px;
  border-radius: 15px;
}
.icon-btn.sm {
  width: 20px;
  height: 20px;
  border-radius: 10px;
}
.icon-btn.sm >>> .material-icons {
  font-size: 15px;
}
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

<script>
export default {
  props: {
    icon: { type: String, required: true },
    size: { type: String, default: 'md' }
  },
  methods: {
    clicked() {
      this.$emit('click')
    }
  }
}
</script>


