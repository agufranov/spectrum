import { sleep, saveTop, D } from './util'

export default class Renderer {
    ctx: CanvasRenderingContext2D

    constructor(canvas) {
        this.ctx = canvas.getContext('2d')
    }

    render(arr: number[], max: number) {
        const { ctx } = this
        const { width, height } = ctx.canvas
        ctx.clearRect(0, 0, width, height)
        ctx.beginPath()
        arr.forEach((value, i) => {
            const x = (i + 0.5) * width / arr.length
            ctx.moveTo(x, height)
            ctx.lineTo(x, height * (1 - value / max))
        })
        ctx.stroke()
    }

    async renderData(data: D, index = 0, timeout = 0) {
        return new Promise(async resolve => {
            const d = saveTop(10, data[index][1])
            this.render([...d], 255)
            if (index < data.length - 1) {
                await sleep((data[index + 1][0] - data[index][0]) * 1000)
                await this.renderData(data, index + 1)
            }
            resolve(undefined)
        })
    }
}