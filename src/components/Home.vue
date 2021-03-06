<template>
  <div class="home">
    <detect-network @detected-condition="detected" />
    <b-alert :show="!isOnline" variant="danger" fade>You are offline!</b-alert>
    <b-alert
      :show="dismissCountDown"
      variant="danger"
      fade
      dismissible
      @dismissed="dismissCountDown = 0"
      @dismiss-count-down="countDownChanged">{{ alertText }}</b-alert>
    
    <b-container fluid>
      <div class="user-code-bar">
        <b-form @submit.stop="login">
          <b-form-row v-if="!loggedin">
            <b-col>
              <b-input-group size="sm" prepend="User Code">
                <b-form-input v-model="userCodeInput"/>
              </b-input-group>
            </b-col>
            <b-col cols="auto">
              <b-button size="sm" type="submit">Enter</b-button>
            </b-col>
          </b-form-row>
          <div v-else>User: {{ currentRole }}
            <a class="logout-link" href="#" @click="logout">Logout</a>
          </div>
        </b-form>
      </div>

      <div v-if="currentRole === 'admin'" class="table-top">
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
            <th class="cp-col">CP</th>
            <th class="oc-col">OC</th>
            <th class="gp-col">GP</th>
            <th class="gpoc-col d-none d-sm-table-cell">OC</th>
            <th class="time-col">Time</th>
            <th class="remarks-col d-none d-sm-table-cell">Remarks</th>
            <th class="actions-col" :class="{'d-none d-sm-table-cell':showEditCp}"></th>
          </tr>
        </thead>
        <tbody name="fade" is="transition-group">
            <tr v-for="cp in checkpoints" :key="cp.id" :class="{ closed: !cp.open }">
              <td class="edit-col" v-show="showEditCp">
                <icon-btn size="sm" icon="edit" @click="displayEditCp(cp)"/>
                <icon-btn size="sm" icon="remove" @click="deleteCp(cp)" />
              </td>
              <td class="cp-col">{{ cp.name }}</td>
              <td class="oc-col">{{ cp.oc }}</td>
              <td class="gp-col">{{ groupInfo[cp.id] === undefined ? '' : groupInfo[cp.id].name }} </td>
              <td class="gpoc-col d-none d-sm-table-cell">{{ groupInfo[cp.id] === undefined ? '' : groupInfo[cp.id].oc }}</td>
              <td class="timer-col">
                <timer 
                  :initial="cpInitialTime[cp.id]" :isCounting="cp.occupied"
                  @stopTimer="cpInitialTime[cp.id] = 0" />
              </td>
              <td class="remarks-col d-none d-sm-table-cell">{{ cp.remarks }}</td>
              <td
                class="actions-col"
                :class="{'d-none d-sm-table-cell' : showEditCp}">
                <template v-if="cp.open && currentRole === 'admin'">
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

      <b-col sm="12" md="4" lg="5">
        <div v-if="currentRole === 'admin'" class="table-top">
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
          <tbody name="fade" is="transition-group">
            <tr v-for="gp in groups" :key="gp.id">
              <td class="edit-col" v-if="showEditGp">
                <icon-btn size="sm" icon="edit" @click="displayEditGp(gp)" />
                <icon-btn size="sm" icon="remove" @click="deleteGp(gp)" />
              </td>
              <td>{{ gp.name }}</td>
              <td>{{ gp.oc }}</td>
              <td>{{ gp.occupied ? 'Yes' : 'No' }}</td>
            </tr>
          </tbody>
        </table>
      </b-col>

    </b-container>
  </div>
</template>

<script>
import Firebase from 'firebase'
// import 'Firebase/firestore'
import detectNetwork from 'v-offline'
import config from '../../config/dbconfig'
import TopBar from './TopBar'
import IconBtn from './IconBtn'
import EditForm from './EditForm'
import Timer from './Timer'

const app = Firebase.initializeApp(config)
const db = app.firestore()
const settings = { timestampsInSnapshots: true }

db.settings(settings)

const checkpointsRef = db.collection('checkpoints')
const groupsRef = db.collection('groups')
const usersRef = db.collection('users')
const alertFadeTime = 2
const syncTimerInterval = 10

export default {
  components: {
    'top-bar': TopBar,
    'icon-btn': IconBtn,
    'edit-form': EditForm,
    'timer': Timer,
    'detect-network': detectNetwork
  },
  data() {
    return {
      finishLoading: false,
      isOnline: true,
      users: [],
      currentRole: '',
      loggedin: false,
      checkpoints: [],
      groups: [],
      groupInfo: {},
      intervals: {},
      cpInitialTime: {},
      userCodeInput: '',
      alertText: '',
      dismissCountDown: 0,
      showDropdown: false,
      showCpForm: false,
      showGpForm: false,
      showEditCp: false,
      showEditGp: false,
      editingGp: null,
      editingCp: null,
      isEditCp: false,
      formCp: { },
      formGp: { }
    }
  },
  // use manual binding in mounted
  // firestore () {
  //   return {
  //     checkpoints: checkpointsRef,
  //     groups: groupsRef
  //   }
  // },
  computed: {
    showCpBar() {
      return !this.showCpForm
    },
    showGpBar() {
      return !this.showGpForm
    }
  },
  mounted() {
    let loadGroups = this.$bind('groups', groupsRef.orderBy('name'))
      .then(() => {
        // groups loaded, set onSnapshot watchGroup
        this.groups.forEach(group => {
          this.watchGroup(group.id)
        })
      })
      .catch(err => {
        console.log('error in loading groups', err)
      })
    let loadCheckpoints = this.$bind('checkpoints', checkpointsRef.orderBy('name'))
      .then(() => {
        this.checkpoints.forEach(cp => {
          this.watchCheckpoint(cp.id)
        })
      })
      .catch(err => {
        console.log('error in loading checkpoints', err)
      })
    let loadUsers = this.$bind('users', usersRef)
    // set finish loading to true
    Promise.all([loadGroups, loadCheckpoints, loadUsers]).then(() => {
      this.finishLoading = true
    })

    if (localStorage.getItem('userCode')) {
      this.currentRole = localStorage.getItem('userCode')
      this.loggedin = true
    }
  },
  methods: {
    detected(val) {
      if (!this.isOnline && val) {
        window.location.reload()
      }
      this.isOnline = val
    },
    login() {
      if (this.finishLoading) {
        let index = this.users.findIndex(e => e.code === this.userCodeInput)
        if (index >= 0) {
          this.currentRole = this.users[index].role
          this.loggedin = true
          localStorage.setItem('userCode', this.currentRole)
        } else {
          this.alertText = 'No such user'
          this.dismissCountDown = alertFadeTime
        }
        this.userCodeInput = ''
      }
    },
    logout() {
      this.currentRole = ''
      this.loggedin = false
      this.showEditCp = false
      this.showEditGp = false
      localStorage.removeItem('userCode')
    },
    arrive(group, cp) {
      groupsRef.doc(group.id).update({
        occupied: true,
        cpId: cp.id
      })
      checkpointsRef.doc(cp.id).update({
        occupied: true,
        groupId: group.id,
        started: Date.now()
      })
    },
    leave(cp) {
      groupsRef.doc(cp.groupId).update({
        occupied: false,
        cpId: ''
      })
      checkpointsRef.doc(cp.id).update({
        occupied: false,
        groupId: ''
      })
      this.groupInfo[cp.id] = {}
    },
    submitCp() {
      // checkings before submit
      if (!this.formCp.name) {
        this.alertText = 'Please fill in checkpoint name'
        this.dismissCountDown = alertFadeTime
        return
      } else {
        let index
        if (this.editingCp) {
          index = this.checkpoints.findIndex(e => e.name === this.formCp.name && e.name !== this.editingCp.name)
        } else {
          index = this.checkpoints.findIndex(e => e.name === this.formCp.name)
        }
        if (index >= 0) {
          this.alertText = 'Checkpoint name duplicate'
          this.dismissCountDown = alertFadeTime
          return
        }
      }
      // submit checkpoint
      if (this.editingCp) {
        checkpointsRef.doc(this.editingCp.id).update({ ...this.formCp })
        // if cp status change from open to close
        if (this.editingCp.groupId !== '' && this.editingCp.open && !this.formCp.open) {
          checkpointsRef.doc(this.editingCp.id).update({ occupied: false })
          groupsRef.doc(this.editingCp.groupId).update({ cpId: '', occupied: false })
        }
      } else {
        checkpointsRef.add(
          {
            groupId: '',
            started: 0,
            remarks: '',
            occupied: false,
            ...this.formCp
          }).then(docRef => {
            this.watchCheckpoint(docRef.id)
          })
      }
      // toggle display
      this.showCpForm = false
    },
    submitGp() {
      // checkings before submit
      if (!this.formGp.name) {
        this.alertText = 'Please fill in group name'
        this.dismissCountDown = alertFadeTime
        return
      } else {
        let index
        if (this.editingGp) {
          index = this.groups.findIndex(e => e.name === this.formGp.name && e.name !== this.editingGp.name)
        } else {
          index = this.groups.findIndex(e => e.name === this.formGp.name)
        }
        if (index >= 0) {
          this.alertText = 'Group name duplicate'
          this.dismissCountDown = alertFadeTime
          return
        }
      }
      // submit group
      if (this.editingGp) {
        groupsRef.doc(this.editingGp.id).update({ ...this.formGp })
      } else {
        groupsRef.add({ ...this.formGp, occupied: false, cpId: '' })
        .then(docRef => {
          this.watchGroup(docRef.id)
        })
      }
      // toggle displays
      this.editingGp = {}
      this.showGpForm = false
      this.formGp = {}
    },
    deleteCp(cp) {
      if (cp.groupId !== '') {
        groupsRef.doc(cp.groupId).update({ occupied: false, cpId: '' })
      }
      checkpointsRef.doc(cp.id).delete()
    },

    deleteGp(group) {
      if (group.cpId !== '') {
        checkpointsRef.doc(group.cpId).update({ occupied: false, groupId: '', group: {} })
        this.groupInfo[group.cpId] = {}
      }
      groupsRef.doc(group.id).delete()
    },
    setCpInitialTime(cp) {
      if (cp.occupied) {
        console.log('sync timer: ' + cp.name)
        let time = Math.round(((new Date()).getTime() - (new Date(cp.started)).getTime()) / 100)
        // cannot add property directly due to reactivity issue
        this.cpInitialTime = { ...this.cpInitialTime, [cp.id]: time }
      }
    },
    watchGroup(id) {
      groupsRef.doc(id).onSnapshot(gp => {
        // if data exists (not delete)
        if (gp.data() !== undefined) {
          let cpId = gp.data().cpId
          if (cpId !== '') {
            // update group info in related cp when info changes
            this.groupInfo = { ...this.groupInfo, [cpId]: { name: gp.data().name, oc: gp.data().oc } }
          } else {
            this.groupInfo = { ...this.groupInfo, [cpId]: {} }
          }
        }
      })
    },
    watchCheckpoint(id) {
      checkpointsRef.doc(id).onSnapshot(cp => {
        // let source = cp.metadata.hasPendingWrites ? 'Local' : 'Server'
        if (cp.data() === undefined) {
          // if cp is deleted, remove element in cpInitialTime
          delete this.cpInitialTime[id]
        } else {
          if (cp.data().occupied) {
            // sync timer every 20s to prevent delay
            this.setCpInitialTime({ ...cp.data(), id })
            this.intervals[id] = setInterval(() => {
              this.setCpInitialTime({ ...cp.data(), id })
            }, syncTimerInterval * 1000)
          } else {
            // clear sync timer interval
            if (this.intervals[id]) {
              clearInterval(this.intervals[id])
              delete this.intervals[id]
            }
            // clear group info
            console.log('clear group info: ' + cp.data().name)
            this.groupInfo[id] = {}
          }
        }
      })
    },
    countDownChanged(val) {
      this.dismissCountDown = val
    },
    displayEditCp(cp) {
      this.formCp = { ...cp }
      this.editingCp = cp
      this.showCpForm = true
    },
    displayEditGp(group) {
      this.formGp = { ...group }
      this.editingGp = group
      this.showGpForm = true
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
    }
  },
  beforeDestroy() {
    this.intervals.forEach(e => {
      clearInterval(e)
    })
  }
}
</script>

<style scoped>
.user-code-bar {
  margin-bottom: 15px;
  text-align: left;
}
.logout-link {
  float: right;
}
/* .table-top {
  height: 31px;
} */
.table {
  margin-top: 10px;
  /* table-layout: fixed; */
  width: 100%;
}
.table td {
  vertical-align: middle;
  padding: 8px;
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