<template>
  <div class="timer">
    {{ timeDisplay }}
  </div>
</template>

<script>
const limit = 36000

export default {
  props: {
    initial: { type: Number, default: 0 },
    isCounting: { required: true, default: false }
  },
  data() {
    return {
      count: 0,
      interval: null
    }
  },
  watch: {
    isCounting(val) {
      if (!val) {
        this.stopTimer()
      } else {
        this.startTimer()
      }
    },
    initial(val) {
      this.count = this.initial
    }
  },
  computed: {
    timeDisplay() {
      if (this.isCounting) {
        if (this.count < limit) {
          let min = Math.floor(this.count / 600).toString()
          let sec = Math.floor(this.count % 600 / 10).toString()
          return min.padStart(2, '0') + ':' + sec.padStart(2, '0')
        } else {
          return '60:00'
        }
      } else {
        return '00:00'
      }
    }
  },
  created() {
    if (this.isCounting) {
      this.startTimer()
    } else {
      this.stopTimer()
    }
  },
  methods: {
    startTimer() {
      // console.log('startTimer')
      this.count = this.initial
      this.interval = setInterval(() => {
        if (this.count >= limit) {
          clearInterval(this.interval)
          console.log('exceed time limit!')
        } else {
          this.count++
        }
      }, 100)
    },
    stopTimer() {
      // console.log('stopTimer')
      this.$emit('stopTimer')
      clearInterval(this.interval)
      this.count = 0
    }
  },
  beforeDestroy() {
    clearInterval(this.$options.interval)
  }
}
</script>

