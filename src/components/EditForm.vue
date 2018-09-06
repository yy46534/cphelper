<template>
  <b-form v-show="show" @submit.stop="submit">
    <b-form-row>
      <b-col>
        <b-input-group :prepend="type" size="sm">
          <b-form-input v-model="data.name" />
        </b-input-group>
      </b-col>
      <b-col>
        <b-input-group prepend="OC" size="sm">
          <b-form-input v-model="data.oc" />
        </b-input-group>
      </b-col>
      <b-col cols="5" v-if="type === 'CP'">
        <b-input-group prepend="Remark" size="sm">
          <b-form-input v-model="data.remarks" />
        </b-input-group>
      </b-col>
      <b-col cols="auto">
        <b-dropdown v-if="type === 'CP'" size="sm" :text="data.open ? 'Open' : 'Close'">
          <b-dropdown-item-button @click="changeStatus(true)">Open</b-dropdown-item-button>
          <b-dropdown-item-button @click="changeStatus(false)">Close</b-dropdown-item-button>
        </b-dropdown>
      </b-col>
      <b-col cols="auto">
        <b-button size="sm" type="submit">{{ isEdit ? 'Edit' : 'Add' }}</b-button>
      </b-col>
      <b-col cols="auto">
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


