import { findLesson } from '../../lessons';
import { DRILLS } from '../../sessions/drills';
import type {
  Block,
  ChangeTapCopy,
  FillBarsCopy,
  ListenCopy,
  MelodyEchoCopy,
  RevealCopy,
  Session,
  SongCopy,
  TransposeCopy,
} from '../../sessions/types';
import { useTheory } from '../context';
import { LessonScene } from '../lessons/LessonScene';
import { BackingTrack } from './BackingTrack';
import { BoxEcho } from './BoxEcho';
import { ChangeTap } from './ChangeTap';
import { ChordCards } from './ChordCards';
import { FillBars } from './FillBars';
import { ListenDrill } from './ListenDrill';
import { MelodyEcho } from './MelodyEcho';
import { Reveal } from './Reveal';
import { SongBench } from './SongBench';
import { StrumAlong } from './StrumAlong';
import { TransposeTable } from './TransposeTable';

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
    case 'backingTrack':
      return <BackingTrack block={block} label={session.copy[lang].blocks[block.key]!.intro} />;
    case 'boxEcho':
      return <BoxEcho block={block} copy={session.copy[lang].blocks[block.key] as MelodyEchoCopy} />;
    case 'melodyEcho': {
      const copy = session.copy[lang].blocks[block.key] as MelodyEchoCopy;
      return <MelodyEcho block={block} copy={copy} />;
    }
    case 'changeTap': {
      const copy = session.copy[lang].blocks[block.key] as ChangeTapCopy;
      return <ChangeTap block={block} copy={copy} />;
    }
    case 'fillBars': {
      const copy = session.copy[lang].blocks[block.key] as FillBarsCopy;
      return <FillBars block={block} copy={copy} />;
    }
    case 'song': {
      const copy = session.copy[lang].blocks[block.key] as SongCopy;
      return <SongBench block={block} copy={copy} />;
    }
    case 'transpose': {
      const copy = session.copy[lang].blocks[block.key] as TransposeCopy;
      return <TransposeTable block={block} copy={copy} />;
    }
  }
}
