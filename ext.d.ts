declare module '*.png'

declare module '*.md'
declare module '*.txt'
declare module '*.xml'
declare module '*.gltf'

declare module '*.svg' {
    const content: React.FC<React.SVGProps<SVGElement>>
    export default content
}

declare module '*.css'
declare module '*.scss'
