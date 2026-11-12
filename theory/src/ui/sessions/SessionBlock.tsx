import { findLesson } from '../../lessons';
import { DRILLS } from '../../sessions/drills';
import type { Block, ListenCopy, RevealCopy, Session } from '../../sessions/types';
import { useTheory } from '../context';
import { LessonScene } from '../lessons/LessonScene';
import { ChordCards } from './ChordCards';
import { ListenDrill } from './ListenDrill';
import { Reveal } from './Reveal';
import { StrumAlong } from './StrumAlong';

export function SessionBlock({ session, block }: { session: Session; block: Block }) {
  const { lang } = useTheory();

  switch (block.kind) {
    case 'lesson': {
      const lesson = findLesson(block.lesson);
      const sceneCopy = lesson ? lesson.copy[lang].scene : undefined;
      return <LessonScene slug={block.lesson} step={block.step} copy={sceneCopy} />;
    }
    case 'listen': {
      const copy = session.copy[lang].blocks[block.key] as ListenCopy;
      const drill = DRILLS[block.drill]!;
      return <ListenDrill drill={drill} copy={copy} />;
    }
    case 'reveal': {
      const copy = session.copy[lang].blocks[block.key] as RevealCopy;
      const drill = DRILLS[block.drill]!;
      return <Reveal drill={drill} copy={copy} />;
    }
    case 'chords': {
      const { in: key, chords } = block;
      return <ChordCards in={key} chords={chords} />;
    }
    case 'strumAlong':
      return <StrumAlong block={block} />;
  }
}
