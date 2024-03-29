import { CSSProperties, MouseEventHandler, ReactNode, useState } from 'react'
import classNames from 'classnames'
import styles from './LumaSrt.module.scss'

interface Marker {
    start: number
    text: string
}

interface Props {
    children?: ReactNode
    className?: string
    style?: CSSProperties
    onClick?: MouseEventHandler<HTMLDivElement>
}

function LumaSrt({ children, className, style, onClick }: Props): JSX.Element {
    const [markers, setMarkers] = useState<Marker[]>([])
    const [clipEnd, setClipEnd] = useState<number>(3600 * 10)

    //
    const onChangeInput = (e: any) => {
        const files = (e.target as HTMLInputElement).files
        if (!files || !files[0]) {
            return
        }
        const file = files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
            if (!e.target) {
                return
            }
            const text = `${e.target.result || ''}`.trim()
            if (text.length === 0) {
                return
            }
            const regex = /offset="([\d\./]+)s" duration="([\d\./]+)s"|<marker start="([\d\./]+)s" value="([^"]+)"/
            const matches = text.match(new RegExp(regex, 'g'))
            if (!matches || matches.length === 0) {
                return
            }
            const calc = (str: string) => {
                if (str.indexOf('/') >= 0) {
                    const tmp = str.split('/')
                    return Number(tmp[0]) / Number(tmp[1])
                } else {
                    return Number(str)
                }
            }
            let currentSec = 0
            const markers = []
            let clipEnd = 3600 * 10
            matches.forEach((str) => {
                const matches = str.match(regex)
                if (!matches) {
                    return
                }
                // Offset
                if (matches[1] && matches[2]) {
                    currentSec = calc(matches[1])
                    clipEnd = calc(matches[1]) + calc(matches[2])
                }
                // Marker
                if (matches[3] && matches[4]) {
                    currentSec += calc(matches[3])
                    markers.push({
                        start: currentSec,
                        text: matches[4],
                    })
                }
            })
            setMarkers(markers)
            setClipEnd(clipEnd)
        }
        reader.readAsText(file)
    }

    // Export
    const exportSrt = () => {
        if (markers.length === 0) {
            return
        }
        const formatSecToSrtTime = (sec: number) => {
            const hours = Math.floor(sec / 3600)
            sec %= 3600
            const minutes = Math.floor(sec / 60)
            sec %= 60
            return `${('00' + hours).slice(-2)}:${('00' + minutes).slice(-2)}:${('00' + sec.toFixed(3)).slice(-6)}`
        }
        let srtText = ''
        let startSec = markers[0].start
        let startText = markers[0].text
        for (let i = 1; i < markers.length; i++) {
            const marker = markers[i]
            srtText += [i, `${formatSecToSrtTime(startSec)} --> ${formatSecToSrtTime(marker.start)}`, startText].join('\n') + '\n\n'
            startSec = marker.start
            startText = marker.text
        }
        srtText += [markers.length, `${formatSecToSrtTime(startSec)} --> ${formatSecToSrtTime(clipEnd)}`, startText].join('\n')
        // Download
        const a = document.createElement('a')
        a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(srtText)
        a.download = 'srt'
        a.click()
    }

    // Render
    return (
        <div className={classNames(styles.LumaSrt, className)} style={style} onClick={(e) => onClick && (e.target as HTMLElement).classList.contains(styles.LumaSrt) && onClick(e)}>
            <input type="file" onChange={onChangeInput} />
            <button onClick={exportSrt}>Export</button>
            {children}
        </div>
    )
}

export default LumaSrt
