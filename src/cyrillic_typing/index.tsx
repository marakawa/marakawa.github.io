import React, { useEffect, useState } from 'react'
import { EN_TO_RU_LIST, WORDS } from './words'
import { createRoot } from 'react-dom/client'
import './style.css'

function shuffle<T>(original: T[]): T[] {
    const array = [...original]
    let currentIndex = array.length
    while (currentIndex !== 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--
        ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }
    return array
}

function enToRu(en: string) {
    Object.keys(EN_TO_RU_LIST).forEach((e) => {
        en = en.replaceAll(e, EN_TO_RU_LIST[e])
    })
    const ru = en
    return ru
}

function getNewWord() {
    let en: string
    do {
        en = shuffle(WORDS)[0]
    } while (en.match(/[jqwx]/))
    const ru = enToRu(en)
    return ru
}

function App() {
    const [question, setQuestion] = useState(() => getNewWord())
    const [answer, setAnswer] = useState('')

    useEffect(() => {
        if (answer === question || enToRu(answer) === question) {
            const word = getNewWord()
            setAnswer('')
            setQuestion(word)
        }
    }, [answer])

    return (
        <div className="app">
            <p className="app__question">{question}</p>
            <div>
                <input className="app__answer" type="text" value={answer} placeholder="Your Answer" onChange={(event) => setAnswer(event.target.value)} />
            </div>
        </div>
    )
}

function main() {
    const container = document.createElement('div')
    document.body.appendChild(container)

    if (container) {
        container.id = 'root'
        const root = createRoot(container)
        root.render(<App />)
    }
}

window.addEventListener('load', main)
