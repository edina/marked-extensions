import type { RendererExtension, RendererThis } from 'marked'
import type { Footnotes } from './types.js'

/**
 * Returns an extension object for rendering the list of footnotes.
 */
export function createFootnotes(prefixId: string, useLabels: boolean) {
  return {
    name: 'footnotes',
    renderer(this: RendererThis, { raw, items = [] }: Footnotes) {
      if (items.length === 0) return ''

      let startIndex: string = '';

      const footnotesItemsHTML = items.reduce(
        (acc, { label, content, refs }) => {
          const encodedLabel = encodeURIComponent(label)
          const parsedContent = this.parser.parse(content).trimEnd()
          const isEndsWithP = parsedContent.endsWith('</p>')

          let footnoteItem = `<li id="${prefixId + encodedLabel}">\n`
          footnoteItem += isEndsWithP
            ? parsedContent.replace(/<\/p>$/, '')
            : parsedContent

          refs.forEach((_, i) => {
            if (!startIndex) startIndex = label;
            const labelText = useLabels ? label : (i + 1);
            const linkText = i > 0 ? `↩<sup>${labelText}</sup>` : '↩';
            footnoteItem += ` <a href="#${prefixId}ref-${encodedLabel}" data-${prefixId}backref aria-label="Back to reference ${label}">${linkText}</a>`
          })

          footnoteItem += isEndsWithP ? '</p>\n' : '\n'
          footnoteItem += '</li>\n'

          return acc + footnoteItem
        },
        ''
      )

      const olStart = useLabels ? `start="${startIndex}"` : '';
      let footnotesHTML = '<section class="footnotes" data-footnotes>\n'
      footnotesHTML += `<h2 id="${prefixId}label" class="sr-only">${raw.trimEnd()}</h2>\n`
      footnotesHTML += `<ol ${olStart}>\n${footnotesItemsHTML}</ol>\n`
      footnotesHTML += '</section>\n'

      return footnotesHTML
    }
  } as RendererExtension
}
