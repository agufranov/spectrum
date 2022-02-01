import * as R from 'ramda'

export const DEFAULT_FFT_SIZE = 32768

export type D = [[timestamp: number, spectrum: Uint8Array]]

const range = n => [...Array(n).keys()]

const A1 = 440
const startFreq = A1 / 2 ** 3

export const toFreq = (note: number) => startFreq * 2 ** (note / 12)

export const toNote = (freq: number) => Math.round(12 * Math.log(freq / startFreq) / Math.log(2))

export const sleep = t => new Promise(resolve => setTimeout(resolve, t))

const cut = (spectrum: Uint8Array, threshold: number) => {
    return spectrum.map(v => v >= threshold ? v : 0)
}

const zipSpectrum = (spectrum: Uint8Array) => {
    const result = []
    spectrum.forEach((value, freq) => {
        if (value > 0) result.push([freq, value])
    })
    return result
}

export const zipData = (data: D) => {
    // TODO ramda lens?
    const result = data.map(([timestamp, spectrum]) => [timestamp, zipSpectrum(cut(spectrum, 70))])
    console.log(`Original: ${JSON.stringify(data).length}, zipped: ${JSON.stringify(result).length}`)
    return result
}

const getRawFreqIntervals = (noteRange: number, sampleRate: number, fftSize: number = DEFAULT_FFT_SIZE) => {
    const pitchFreqIntervals = range(noteRange).map(note => [toFreq(note - 0.5), toFreq(note + 0.5)])
    const rawFreqs = range(fftSize / 2).map(i => i * (sampleRate / fftSize))
    let i = rawFreqs.findIndex(f => f >= pitchFreqIntervals[0][0])
    const indices = [i]
    pitchFreqIntervals.forEach(([from, to]) => {
        while (i < rawFreqs.length && rawFreqs[i] < to) i++
        indices.push(i)
    })
    const rawFreqIntervals = R.zip(indices, R.tail(indices).map(i => i - 1))
    return rawFreqIntervals
}

const rawFreqIntervals = getRawFreqIntervals(5 * 12, 44000)

export const rawToPitch = (buffer: Uint8Array) => {
    const intervals = rawFreqIntervals.map(([fromIndex, toIndex]) => buffer.slice(fromIndex, toIndex + 1))
    return intervals.map(interval => {
        const m = Math.round(interval.length / 2)
        // const d = R.sum([...interval.map((v, i) => 255 / Math.max(Math.abs(i - m), 1))])
        // return R.sum([...interval.map((v, i) => v / Math.max(Math.abs(i - m), 1))]) * 255 / d
        return R.sum([...interval]) / interval.length
    })
}

export const saveTop = (n, arr) => {
  const tops = R.pipe(
    R.toPairs,
    R.sortBy(([k, v]) => v),
    R.takeLast(n)
  )(arr)
  const result = new Uint8Array(arr.length)
  tops.forEach(([k, v]) => result[k] = v)
  return result
}