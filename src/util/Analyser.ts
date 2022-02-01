import { EventEmitter } from 'events'
import { DEFAULT_FFT_SIZE } from './util'

export default class Analyser extends EventEmitter{
    url: string
    dt: number
    ctx = new AudioContext
    src: AudioBufferSourceNode
    analyser: AnalyserNode
    buffer: Uint8Array
    result: Array<[number, number[]]> = []
    active: Boolean = true

    constructor (url, dt = 30, fftSize = DEFAULT_FFT_SIZE) {
        super()

        this.url = url
        this.dt = dt
        this.src = this.ctx.createBufferSource()
        this.analyser = this.ctx.createAnalyser()
        this.analyser.fftSize = fftSize
        this.analyser.smoothingTimeConstant = 0
        this.analyser.minDecibels = -100
        this.buffer = new Uint8Array(this.analyser.frequencyBinCount)

        Object.assign(window, { ctx: this.ctx, src: this.src })

        this.init()
        this.process()

    }

    private async init() {
        const data = await (await fetch(this.url)).arrayBuffer()
        this.src.buffer = await this.ctx.decodeAudioData(data)
        this.src.connect(this.analyser)
        this.analyser.connect(this.ctx.destination)
        this.src.start()
        this.src.onended = () => {
            this.active = false
            this.emit('end')
        }
    }

    
    process = () => {
        if (this.ctx.state === 'running') {
            this.analyser.getByteFrequencyData(this.buffer)
            const d = [Number(this.ctx.currentTime.toFixed(3)), [...this.buffer]] as [number, number[]]
            this.result.push(d)
            this.emit('frame', d)
        }
        if (this.active) {
            setTimeout(this.process, this.dt)
        }
    }
}