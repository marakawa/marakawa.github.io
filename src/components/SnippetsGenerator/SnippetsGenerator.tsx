import { CSSProperties, MouseEventHandler, ReactNode, useState } from 'react'
import classNames from 'classnames'
import styles from './SnippetsGenerator.module.scss'

interface Props {
    children?: ReactNode
    className?: string
    style?: CSSProperties
    onClick?: MouseEventHandler<HTMLDivElement>
}

function SnippetsGenerator({ children, className, style, onClick }: Props): JSX.Element {
    const [result, setResult] = useState<string>('')

    //
    const onKeyupInput = (e: any) => {
        const inputText = e.target.value.trim() as string
        const outputJson = {
            scope: 'javascript,typescript,typescriptreact',
            prefix: '_',
            body: inputText.split('\n').map((line) => line.replace('"', '\\"').replace('$', '\\$')),
        }
        setResult(JSON.stringify(outputJson, undefined, 4))
    }

    // Render
    return (
        <div className={classNames(styles.SnippetsGenerator, className)} style={style} onClick={(e) => onClick && (e.target as HTMLElement).classList.contains(styles.SnippetsGenerator) && onClick(e)}>
            <textarea id="input" cols={20} rows={10} placeholder="code" onKeyUp={onKeyupInput}></textarea>
            <textarea id="output" cols={20} rows={10} readOnly value={result}></textarea>
            {children}
        </div>
    )
}

export default SnippetsGenerator
