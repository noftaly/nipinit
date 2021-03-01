import { stripIndent } from 'common-tags';

export default function keepOneIndent(strings: TemplateStringsArray): string {
  return stripIndent(strings).split('\n').map(line => (line.length > 0 ? `\t${line}` : '')).join('\n');
}
