import { describe, expect, it } from 'vitest';
import { avoidRules, findAvoided } from './glossary';

const md = `
# Glossary

| English | Tiếng Việt | Avoid (en) | Avoid (vi) |
| --- | --- | --- | --- |
| root | root | \`home note\` | \`nốt gốc\`, \`nhà\` |
| scale | scale | | \`âm giai\` |

Some prose with \`code\` that is not a rule.

| Other | Table |
| --- | --- |
| \`not\` | \`rules\` |
`;

const terms = (md: string) => avoidRules(md).map(({ lang, term, use }) => ({ lang, term, use }));

describe('glossary rules', () => {
  it('reads the backticked terms of the Avoid columns, with the preferred term', () => {
    expect(terms(md)).toEqual([
      { lang: 'en', term: 'home note', use: 'root' },
      { lang: 'vi', term: 'nốt gốc', use: 'root' },
      { lang: 'vi', term: 'nhà', use: 'root' },
      { lang: 'vi', term: 'âm giai', use: 'scale' },
    ]);
  });

  it('reads an Avoid column for any language, with no preferred-term column', () => {
    const fr = '| Français | Avoid (fr) |\n| --- | --- |\n| gamme | `échelle` |';
    expect(terms(fr)).toEqual([{ lang: 'fr', term: 'échelle', use: '' }]);
  });

  it('refuses a table it cannot read, rather than dropping its rules', () => {
    expect(() => avoidRules('| English | *Avoid (vi)* |\n| --- | --- |\n| a | `b` |')).toThrow(/Avoid \(xx\)/);
    expect(() => avoidRules('| English | Avoid (vi) |\n| --- | --- |\n| a | `b` | extra |')).toThrow(/3 cells/);
  });

  it('matches whole words, ignoring case, in the right language only', () => {
    const rules = avoidRules(md);
    expect(findAvoided('Âm Giai & Box', rules, 'vi', 'k').map((m) => m.term)).toEqual(['âm giai']);
    expect(findAvoided('Nhà thứ', rules, 'vi', 'k').map((m) => m.term)).toEqual(['nhà']);
    expect(findAvoided('nhàx, xnhà', rules, 'vi', 'k')).toEqual([]);
    expect(findAvoided('the home note', rules, 'vi', 'k')).toEqual([]);
    expect(findAvoided('The Home Note', rules, 'en', 'title')).toEqual([{ where: 'title', term: 'home note', use: 'root' }]);
  });

  it('matches an English term in the plural', () => {
    expect(findAvoided('Find the home notes', avoidRules(md), 'en', 'k')).toHaveLength(1);
  });

  it('reports each occurrence', () => {
    expect(findAvoided('âm giai, rồi âm giai', avoidRules(md), 'vi', 'k')).toHaveLength(2);
  });

  it('matches text in either Unicode form (precomposed or combining marks)', () => {
    expect(findAvoided('âm giai'.normalize('NFD'), avoidRules(md), 'vi', 'k')).toHaveLength(1);
  });
});
