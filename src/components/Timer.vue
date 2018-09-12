<template>
  <div class="timer">
    {{ timeDisplay }}
  </div>
</template>

<script>
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
        let min = Math.floor(this.count / 60).toString()
        let sec = (this.count % 60).toString()
        return min.padStart(2, '0') + ':' + sec.padStart(2, '0')
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
        if (this.count >= 3600) {
          clearInterval(this.interval)
          console.log('exceed time limit!')
        } else {
          this.count++
        }
      }, 1000)
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

