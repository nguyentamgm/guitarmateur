import { findLesson } from '../../lessons';
import type { Block, Session } from '../../sessions';
import { useTheory } from '../context';
import { LessonScene } from '../lessons/LessonScene';

export function SessionBlock({ block }: { session: Session; block: Block }) {
  const { ui, lang } = useTheory();

  switch (block.kind) {
    case 'lesson': {
      const lesson = findLesson(block.lesson);
      const sceneCopy = lesson ? lesson.copy[lang].scene : undefined;
      return <LessonScene slug={block.lesson} step={block.step} copy={sceneCopy} />;
    }
    default:
      return <p className="notice">{ui.session.blockSoon}</p>;
  }
}
