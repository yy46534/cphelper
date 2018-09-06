<template>
  <div class="home">
    <b-container fluid>
      <b-col>
        <div class="table-top">
          <top-bar
            v-show="showCpBar"
            :edit.sync="showEditCp"
            @add="displayAddCp" />
          <edit-form
            :show.sync="showCpForm"
            :data="formCp"
            :type="'CP'"
            :isEdit="editingCp !== null"
            @update:show="formCp = {}"
            @submit="submitCp"
            @changeStatus="changeFormStatus" />
        </div>
        <table class="table cp-table">
          <thead>
            <tr>
              <th class="edit-col" v-show="showEditCp"></th>
              <th
                v-for="(field, i) in cpFields" :key="i"
                scope="col"
                :class="field.key + '-col'">{{ field.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cp, i) in checkpoints" :key="i" :class="{ closed: !cp.open }">
              <td class="edit-col" v-show="showEditCp">
                <icon-btn size="sm" icon="edit" @click="editCp(cp)"/>
                <icon-btn size="sm" icon="remove" @click="deleteCp(cp)" />
              </td>
              <td class="cp-col">{{ cp.name }}</td>
              <td class="oc-col">{{ cp.oc }}</td>
              <td class="gp-col">{{ cp.group.name }}</td>
              <td class="gpoc-col">{{ cp.group.oc }}</td>
              <td class="timer-col">
                <timer :isCounting="cp.occupied"/>
              </td>
              <td class="remarks-col">{{ cp.remarks }}</td>
              <td class="actions-col">
                <template v-if="cp.open">
                  <b-dropdown v-if="!cp.occupied" size="sm" text="Arrive">
                    <b-dropdown-item-button 
                      v-for="(group, i) in groups" :key="i"
                      v-if="!group.occupied"
                      @click="arrive(group, cp)">
                      {{ group.name }}
                    </b-dropdown-item-button> 
                  </b-dropdown>
                  <b-button v-else size="sm" @click="leave(cp)">Leave</b-button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </b-col>

      <b-col sm="12" md="4" lg="5">
        <div class="table-top">
          <top-bar
            v-show="showGpBar"
            :edit.sync="showEditGp"
            @add="displayAddGp" />
          <edit-form
            :show.sync="showGpForm"
            :data="formGp"
            :type="'GP'"
            :isEdit="editingGp !== null"
            @update:show="formGp = {}"
            @submit="submitGp" />
        </div>
        
        <table class="table gp-table">
          <thead>
            <tr>
              <th class="edit-col" v-if="showEditGp"></th>
              <th scope="col">Name</th>
              <th scope="col">OC</th>
              <th scope="col">Occupied</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(gp, i) in groups" :key="i">
              <td class="edit-col" v-if="showEditGp">
                <icon-btn size="sm" icon="edit" @click="editGp(gp)" />
                <icon-btn size="sm" icon="remove" @click="deleteGp(gp)" />
              </td>
              <td>{{ gp.name }}</td>
              <td>{{ gp.oc }}</td>
              <td>{{ gp.occupied }}</td>
            </tr>
          </tbody>
        </table>
      </b-col>
    </b-container>
  </div>
</template>

<style scoped>
.table-top {
  height: 31px;
}
.table {
  margin-top: 10px;
  table-layout: fixed;
  width: 100%;
}
.table td {
  vertical-align: middle;
}
.edit-col {
  width: 75px;
  padding: .75rem 0 .75rem .5rem;
}
.cp-table .oc-col {
  border-right: 1px solid var(--border-color);
}
.cp-table .time-col {
  width: 60px;
}
.cp-table .remarks-col {
  width: 20%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.cp-table .actions-col {
  text-align: center;
}
.cp-table tr.closed {
  background-color: var(--shade-color);
}
.btn:not(:last-child) {
  margin-right: 5px;
}
</style>

<script>
import { mapState, mapMutations } from 'vuex'
import TopBar from './TopBar'
import IconBtn from './IconBtn'
import EditForm from './EditForm'
import Timer from './Timer'

export default {
  components: {
    'top-bar': TopBar,
    'icon-btn': IconBtn,
    'edit-form': EditForm,
    'timer': Timer
  },
  data() {
    return {
      showDropdown: false,
      showCpForm: false,
      showGpForm: false,
      showEditCp: false,
      showEditGp: false,
      editingGp: null,
      editingCp: null,
      isEditCp: false,
      formCp: { },
      formGp: { },
      cpFields: [
        { key: 'cp', label: 'CP' },
        { key: 'oc', label: 'OC' },
        { key: 'gp', label: 'GP' },
        { key: 'gpoc', label: 'OC' },
        { key: 'time', label: 'Time' },
        { key: 'remarks', label: 'Remarks' },
        { key: 'actions', label: '' }
      ]
      // checkpoints: [
      //   { id: 0, name: '1/F', oc: 'Nicole', group: {}, time: '', remarks: '', occupied: false, open: true },
      //   { id: 1, name: '2/F', oc: 'Helen', group: {}, time: '', remarks: '', occupied: false, open: true },
      //   { id: 2, name: '3/F', oc: 'Becky', group: {}, time: '', remarks: 'waiting for scissors pleeeeeease', occupied: false, open: false, _rowVariant: 'closed' },
      //   { id: 3, name: '4/F', oc: 'Kelvin', group: {}, time: '', remarks: '', occupied: false, open: true }
      // ],
      // groups: [
      //   { id: 0, name: 'ABC', oc: 'Apple', cpId: -1, occupied: false },
      //   { id: 1, name: 'BTO', oc: 'Jack', cpId: -1, occupied: false },
      //   { id: 2, name: 'FFL', oc: 'Joseph', cpId: -1, occupied: false }
      // ]
    }
  },
  computed: {
    ...mapState([ 'checkpoints', 'groups' ]),
    showCpBar() {
      return !this.showCpForm
    },
    showGpBar() {
      return !this.showGpForm
    }
  },
  methods: {
    ...mapMutations([
      'addGroup',
      'removeGroup',
      'updateGroup',
      'addCheckpoint',
      'removeCheckpoint',
      'updateCheckpoint'
    ]),
    arrive(group, cp) {
      group.occupied = true
      group.cpId = cp.id
      cp.group = group
      cp.occupied = true
    },
    leave(cp) {
      cp.group.occupied = false
      cp.group.cpId = -1
      cp.group = {}
      cp.occupied = false
    },
    submitCp() {
      if (this.editingCp) {
        Object.assign(this.editingCp, this.formCp)
        if (!this.editingCp.open) {
          this.editingCp.group.occupied = false
          this.editingCp.group.cpId = -1
          this.editingCp.group = {}
          this.editingCp.occupied = false
        }
      } else {
        this.addCheckpoint(
          {
            group: {},
            time: '',
            remark: '',
            occupied: false,
            open: true,
            ...this.formCp
          })
      }
      this.showCpForm = false
    },
    submitGp() {
      if (this.editingGp) {
        this.updateGroup(this.formGp)
        // Object.assign(this.editingGp, this.formGp)
      } else {
        this.addGroup({ ...this.formGp, occupied: false })
      }
      this.editingGp = {}
      this.showGpForm = false
      this.formGp = {}
    },
    changeFormStatus(value) {
      this.formCp.open = value
    },
    displayAddCp() {
      this.formCp = { open: true }
      this.editingCp = null
      this.showCpForm = true
    },
    displayAddGp() {
      this.editingGp = null
      this.showGpForm = true
    },
    editCp(cp) {
      this.formCp = { ...cp }
      this.editingCp = cp
      this.showCpForm = true
    },
    deleteCp(cp) {
      let index = this.checkpoints.indexOf(cp)
      cp.group.occupied = false
      cp.group.cpId = -1
      if (index > -1) {
        this.checkpoints.splice(index, 1)
      }
    },
    editGp(group) {
      this.formGp = { ...group }
      this.editingGp = group
      this.showGpForm = true
    },
    deleteGp(group) {
      this.removeGroup(group)
    }
  }
}
</script>

