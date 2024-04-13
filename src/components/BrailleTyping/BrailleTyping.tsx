import { CSSProperties, MouseEventHandler, ReactNode, useState } from 'react'
import classNames from 'classnames'
import styles from './BrailleTyping.module.scss'

const brailles = {
    あ: '⠁',
    い: '⠃',
    う: '⠉',
    え: '⠋',
    お: '⠊',
    か: '⠡',
    き: '⠣',
    く: '⠩',
    け: '⠫',
    こ: '⠪',
    さ: '⠱',
    し: '⠳',
    す: '⠹',
    せ: '⠻',
    そ: '⠺',
    た: '⠕',
    ち: '⠗',
    つ: '⠝',
    て: '⠟',
    と: '⠞',
    な: '⠅',
    に: '⠇',
    ぬ: '⠍',
    ね: '⠏',
    の: '⠎',
    は: '⠥',
    ひ: '⠧',
    ふ: '⠭',
    へ: '⠯',
    ほ: '⠮',
    ま: '⠵',
    み: '⠷',
    む: '⠽',
    め: '⠿',
    も: '⠾',
    や: '⠌',
    ゆ: '⠬',
    よ: '⠜',
    ら: '⠑',
    り: '⠓',
    る: '⠙',
    れ: '⠛',
    ろ: '⠚',
    わ: '⠄',
    を: '⠔',
    ん: '⠴',
    っ: '⠂',
    ー: '⠒',
    '0': '⠼⠁',
    '1': '⠼⠃',
    '2': '⠼⠉',
    '3': '⠼⠙',
    '4': '⠼⠑',
    '5': '⠼⠋',
    '6': '⠼⠛',
    '7': '⠼⠓',
    '8': '⠼⠊',
    '9': '⠼⠚',
    a: '⠰⠁',
    b: '⠰⠃',
    c: '⠰⠉',
    d: '⠰⠙',
    e: '⠰⠑',
    f: '⠰⠋',
    g: '⠰⠛',
    h: '⠰⠓',
    i: '⠰⠊',
    j: '⠰⠚',
    k: '⠰⠅',
    l: '⠰⠇',
    m: '⠰⠍',
    n: '⠰⠝',
    o: '⠰⠕',
    p: '⠰⠏',
    q: '⠰⠟',
    r: '⠰⠗',
    s: '⠰⠎',
    t: '⠰⠞',
    u: '⠰⠥',
    v: '⠰⠧',
    w: '⠰⠺',
    x: '⠰⠭',
    y: '⠰⠽',
    z: '⠰⠵',
}

const kanaToBraille = (kana: string) => {
    return brailles[kana] || '⠀'
}

const getRandomKana = () => {
    const kanas = Object.keys(brailles)
    return kanas[Math.floor(Math.random() * kanas.length)]
}

const getRandomBraille = () => {
    return kanaToBraille(getRandomKana())
}

interface Props {
    children?: ReactNode
    className?: string
    style?: CSSProperties
    onClick?: MouseEventHandler<HTMLDivElement>
}

function BrailleTyping({ children, className, style, onClick }: Props): JSX.Element {
    const [brailleText, setBrailleText] = useState<string>(() => getRandomBraille())
    const [typingText, setTypingText] = useState<string>('')

    // Render
    return (
        <div className={classNames(styles.BrailleTyping, className)} style={style} onClick={(e) => onClick && (e.target as HTMLElement).classList.contains(styles.BrailleTyping) && onClick(e)}>
            <div className={classNames(styles.BrailleTyping__Braille)}>{brailleText}</div>
            <div>
                <input
                    type="text"
                    value={typingText}
                    onChange={(e) => {
                        const kana = (e.target as HTMLInputElement).value
                        if (brailleText === kanaToBraille(kana)) {
                            setBrailleText(getRandomBraille())
                            setTypingText('')
                        } else {
                            setTypingText(kana)
                        }
                    }}
                />
            </div>
            {children}
        </div>
    )
}

export default BrailleTyping
