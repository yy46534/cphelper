<template>
  <b-form v-show="show" @submit.stop="submit">
    <b-form-row>
      <b-col cols="6" sm="auto">
        <b-input-group :prepend="type" size="sm">
          <b-form-input v-model="data.name" />
        </b-input-group>
      </b-col>
      <b-col cols="6" sm="auto">
        <b-input-group prepend="OC" size="sm">
          <b-form-input v-model="data.oc" />
        </b-input-group>
      </b-col>
      <b-col cols="12" sm="auto" v-if="type === 'CP'">
        <b-input-group prepend="Remark" size="sm">
          <b-form-input v-model="data.remarks" />
        </b-input-group>
      </b-col>
      <b-col sm="auto">
        <b-dropdown v-if="type === 'CP'" size="sm" :text="data.open ? 'Open' : 'Close'">
          <b-dropdown-item-button @click="changeStatus(true)">Open</b-dropdown-item-button>
          <b-dropdown-item-button @click="changeStatus(false)">Close</b-dropdown-item-button>
        </b-dropdown>
        <b-button size="sm" type="submit">{{ isEdit ? 'Edit' : 'Add' }}</b-button>
        <icon-btn icon="clear" @click="hide"/>
      </b-col>
    </b-form-row>
  </b-form>
</template>

<style scoped>

</style>

<script>
import IconBtn from './IconBtn'

export default {
  components: {
    'icon-btn': IconBtn
  },
  props: {
    show: { type: Boolean, required: true },
    data: { type: Object, required: true },
    type: { type: String, default: 'CP' },
    isEdit: { type: Boolean, default: false }
  },
  methods: {
    hide() {
      this.$emit('update:show', false)
    },
    submit() {
      this.$emit('submit')
    },
    changeStatus(value) {
      this.$emit('changeStatus', value)
    }
  }
}
</script>


