<template>
  <div class="app">
    <router-view/>
  </div>
</template>

<script>
import Hello from './components/ApiData'
import HelloWorld from './components/HelloWorld'

export default {
  name: 'test',
  components: {
      Hello,
      HelloWorld
  }
}
</script>

<style>
  .app {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50.5rem;
    width: 50.5rem;
  }
</style>
