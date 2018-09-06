import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  checkpoints: [
    { id: 0, name: '1/F', oc: 'Nicole', groupId: -1, time: '', remarks: '', occupied: false, open: true },
    { id: 1, name: '2/F', oc: 'Helen', groupId: -1, time: '', remarks: '', occupied: false, open: true },
    { id: 2, name: '3/F', oc: 'Becky', groupId: -1, time: '', remarks: 'waiting for scissors pleeeeeease', occupied: false, open: false, _rowVariant: 'closed' },
    { id: 3, name: '4/F', oc: 'Kelvin', groupId: -1, time: '', remarks: '', occupied: false, open: true }
  ],
  groups: [
    { id: 0, name: 'ABC', oc: 'Apple', cpId: -1, occupied: false },
    { id: 1, name: 'BTO', oc: 'Jack', cpId: -1, occupied: false },
    { id: 2, name: 'FFL', oc: 'Joseph', cpId: -1, occupied: false }
  ]
}

const getters = {
  checkpointById: (id) => state.checkpoints[id],
  groupById: (id) => state.groups[id]
}

function clearGroup(cp) {
  if (cp.groupId >= 0) {
    state.groups[cp.groupId].cpId = -1
    state.groups[cp.groupId].occupied = false
  }
}
function clearCheckpoint(gp) {
  if (gp.cpId >= 0) {
    state.checkpoints[gp.cpId].groupId = -1
    state.checkpoints[gp.cpId].occupied = false
  }
}

const mutations = {
  addCheckpoint(state, val) {
    state.checkpoints.push(val)
  },
  removeCheckpoint(state, val) {
    clearGroup(val)
    state.checkpoints.splice(val.id, 1)
  },
  updateCheckpoint(state, val) {
    state.checkpoints[val.id] = val
    if (!val.open) {
      clearGroup()
    }
  },
  addGroup(state, val) {
    state.groups.push(val)
  },
  removeGroup(state, val) {
    clearCheckpoint(val)
    state.groups.splice(val.id, 1)
  },
  updateGroup(state, val) {
    state.groups[val.id] = val
  }
}

const actions = {

}

const store = new Vuex.Store({
  state,
  getters,
  actions,
  mutations
})

export default store
