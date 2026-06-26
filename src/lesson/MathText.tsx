// eslint-disable-next-line react-refresh/only-export-components
export function mathToPlain(s: string): string {
  return s.replace(/\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g, (_, d, i) => d ?? i)
}

import { Fragment } from 'react'
import { Katex } from './Katex'

export function MathText({ children }: { children: string }) {
  const segments: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  const re = /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g

  while ((match = re.exec(children)) !== null) {
    if (match.index > last) {
      segments.push(children.slice(last, match.index))
    }
    const isDisplay = match[1] !== undefined
    const inner = isDisplay ? match[1] : match[2]
    segments.push(<Katex key={match.index} tex={inner} displayMode={isDisplay} />)
    last = match.index + match[0].length
  }

  if (last < children.length) {
    segments.push(children.slice(last))
  }

  return <Fragment>{segments}</Fragment>
}
