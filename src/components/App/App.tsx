import { CSSProperties, MouseEventHandler, ReactNode, useState } from 'react'
import classNames from 'classnames'
import styles from './App.module.scss'
import LumaSrt from '../LumaSrt/LumaSrt'
import SnippetsGenerator from '../SnippetsGenerator/SnippetsGenerator'
import Text2Vsqx from '../Text2Vsqx/Text2Vsqx'
import TextureGenerator from '../TextureGenerator/TextureGenerator'
import BrailleTyping from '../BrailleTyping/BrailleTyping'

interface Props {
    children?: ReactNode
    className?: string
    style?: CSSProperties
    onClick?: MouseEventHandler<HTMLDivElement>
}

function App({ children, className, style, onClick }: Props): JSX.Element {
    const [tool, setTool] = useState<string>('BrailleTyping')

    // Render
    return (
        <div className={classNames(styles.App, className)} style={style} onClick={(e) => onClick && (e.target as HTMLElement).classList.contains(styles.App) && onClick(e)}>
            <h1>marakawa.github.io</h1>
            <div className={classNames(styles.App__Links)}>
                <a href="geo.html">geo</a>
                <label>
                    <input type="radio" name="tool" onClick={() => setTool('LumaSrt')} />
                    luma-srt
                </label>
                <label>
                    <input type="radio" name="tool" onClick={() => setTool('SnippetsGenerator')} />
                    snippets
                </label>
                <label>
                    <input type="radio" name="tool" onClick={() => setTool('Text2Vsqx')} />
                    text2vsqx
                </label>
                <label>
                    <input type="radio" name="tool" onClick={() => setTool('TextureGenerator')} />
                    texture
                </label>
                <label>
                    <input type="radio" name="tool" onClick={() => setTool('BrailleTyping')} />
                    braille
                </label>
            </div>
            <div>
                {tool === 'LumaSrt' ? (
                    <LumaSrt></LumaSrt>
                ) : tool === 'SnippetsGenerator' ? (
                    <SnippetsGenerator></SnippetsGenerator>
                ) : tool === 'Text2Vsqx' ? (
                    <Text2Vsqx></Text2Vsqx>
                ) : tool === 'TextureGenerator' ? (
                    <TextureGenerator></TextureGenerator>
                ) : tool === 'BrailleTyping' ? (
                    <BrailleTyping></BrailleTyping>
                ) : (
                    <div></div>
                )}
            </div>
            {children}
        </div>
    )
}

export default App
