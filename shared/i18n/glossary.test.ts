import { describe, expect, it } from 'vitest';
import { avoidRules, findAvoided } from './glossary';

const md = `
# Glossary

| English | Tiếng Việt | Avoid (en) | Avoid (vi) |
| --- | --- | --- | --- |
| root | root | \`home note\` | \`nốt gốc\`, \`gốc\` |
| scale | scale | | \`âm giai\` |

Some prose with \`code\` that is not a rule.

| Other | Table |
| --- | --- |
| \`not\` | \`rules\` |
`;

describe('glossary rules', () => {
  it('reads the backticked terms of the Avoid columns, with the preferred term', () => {
    expect(avoidRules(md)).toEqual([
      { lang: 'en', term: 'home note', use: 'root' },
      { lang: 'vi', term: 'nốt gốc', use: 'root' },
      { lang: 'vi', term: 'gốc', use: 'root' },
      { lang: 'vi', term: 'âm giai', use: 'scale' },
    ]);
  });

  it('matches whole words, ignoring case, in the right language only', () => {
    const rules = avoidRules(md);
    expect(findAvoided('Âm Giai & Box', rules, 'vi', 'k').map((m) => m.term)).toEqual(['âm giai']);
    expect(findAvoided('Gốc', rules, 'vi', 'k').map((m) => m.term)).toEqual(['gốc']);
    expect(findAvoided('gốcx, xgốc', rules, 'vi', 'k')).toEqual([]);
    expect(findAvoided('the home note', rules, 'vi', 'k')).toEqual([]);
    expect(findAvoided('The Home Note', rules, 'en', 'title')).toEqual([{ where: 'title', term: 'home note', use: 'root' }]);
  });

  it('matches text in either Unicode form (precomposed or combining marks)', () => {
    const rules = avoidRules(md);
    expect(findAvoided('âm giai'.normalize('NFD'), rules, 'vi', 'k')).toHaveLength(1);
  });
});
