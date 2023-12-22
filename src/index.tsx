import { createRoot } from 'react-dom/client'
import App from './components/App/App'
import './index.scss'

const root = document.createElement('div')
root.setAttribute('id', 'root')
document.body.appendChild(root)
createRoot(document.querySelector('#root') as HTMLElement).render(<App />)
