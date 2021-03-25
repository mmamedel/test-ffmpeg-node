import * as R from 'ramda'
import * as fs from 'fs'
import * as path from 'path'
import { SUBTITLE_FOLDER } from './paths'
import { spawnSync } from 'child_process'

console.time('create')
const pngs = fs.readdirSync(SUBTITLE_FOLDER)
    .filter(entry => path.extname(entry) === '.png')

const pngChunks = R.splitEvery(100, pngs)

const movFormat = '-c:v prores_ks -pix_fmt yuva444p10le -alpha_bits 16 -profile:v 4444 -f mov'.split(' ')

for (const chunk of pngChunks) {
    const ffmpegArgs =  [
        ...chunk.map((png) => ['-i', png]).flat(),
        ...chunk.map((png, index) => [
            ...movFormat,
            '-map',
            `${index}:v`,
            path.join('output', `${path.parse(png).name}-frame.mov`),
        ]).flat()
    ]
    spawnSync('ffmpeg', ffmpegArgs, { cwd: SUBTITLE_FOLDER })
}

for (const chunk of pngChunks) {
    const ffmpegArgs =  [
        ...chunk.map((png) => ['-stream_loop','-1','-i', path.join('output', `${path.parse(png).name}-frame.mov`)]).flat(),
        ...chunk.map((png, index) => [
            '-c',
            'copy',
            '-frames',
            '200',
            '-map',
            `${index}:v`,
            path.join('output', `${path.parse(png).name}.mov`),
        ]).flat()
    ]
    spawnSync('ffmpeg', ffmpegArgs, { cwd: SUBTITLE_FOLDER })
}

console.timeEnd('create')