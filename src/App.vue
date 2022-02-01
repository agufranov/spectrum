<script setup>
import * as R from 'ramda'
import { onMounted } from 'vue'
import data from './assets/data.json'
import { toFreq, toNote, zipData, rawToPitch, saveTop } from './util/util'
import Analyser from './util/Analyser'
import Renderer from './util/Renderer'

Object.assign(window, { toFreq, toNote, zipData })
const p = data.map(([timestamp, buffer]) => [timestamp, rawToPitch(buffer)])
const notes = 'a a# h c c# d d# e f f# g g#'.split(' ')

const arr = new Uint8Array([5,1,2,7])

console.log(saveTop(2, arr))

onMounted(async () => {
  // const analyser = new Analyser('/src/assets/spec (2).mp3')
  // analyser.on('frame', ([timestamp, spectrum]) => {
  //   renderer.render(spectrum, 255)
  // })
  // analyser.on('end', () => {
  //   console.log(JSON.stringify(analyser.result))
  // })
  let i = 0
  const renderer = new Renderer(document.getElementById('canvas'))
  // console.log(data[i][1])
  console.log(data)
  const l = await renderer.renderData(data)
  console.log('rendered', l)
})
</script>

<template>
  <canvas id="canvas" width="800" height="600" />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

canvas {
  border: 1px solid red;
}
</style>
