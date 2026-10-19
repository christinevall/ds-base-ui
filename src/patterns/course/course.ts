import type { BadgeProps } from '../../components/Badge';

/*
 * Copy for the course sign-up prototype. Neutral demo content: a fictional
 * school and a fictional course, example.com addresses only.
 */

export const course = {
  school: 'Northwind Academy',
  crumb: 'Design systems foundations',
  title: 'Design systems foundations',
  lead: 'Six weeks from scattered styles to a small system your team can use: tokens, components, documentation and a hand-off that holds. For designers who use Figma every day.',
  included:
    'Six live sessions with recordings, weekly exercises with written feedback, and a Figma starter file you keep.',
};

export const tags: { label: string; variant: BadgeProps['variant'] }[] = [
  { label: 'Online', variant: 'accent' },
  { label: '6 weeks', variant: 'neutral' },
  { label: 'Intermediate', variant: 'neutral' },
];

/** How the course can be taken. The price lives here so the card can follow the choice. */
export const formats = [
  {
    value: 'cohort',
    label: 'Live cohort · €390',
    description: 'Weekly live sessions, feedback on your work, a small group of 20.',
    price: '€390',
    note: 'Live cohort · 6 weeks',
  },
  {
    value: 'self-paced',
    label: 'Self-paced · €190',
    description: 'Every recording and exercise, at your own speed. No live feedback.',
    price: '€190',
    note: 'Self-paced · start any time',
  },
] as const;

export type Format = (typeof formats)[number]['value'];

export const cohorts = {
  'nov-3': 'Monday 3 November',
  'jan-12': 'Monday 12 January',
  'mar-2': 'Monday 2 March',
};

export const questions = [
  {
    value: 'level',
    question: 'Do I need to know how to code?',
    answer: 'No. You work in Figma throughout. One session shows how the system looks in code, so you know what to hand over.',
  },
  {
    value: 'missed',
    question: 'What if I miss a live session?',
    answer: 'Every session is recorded and online the same evening. Send your exercise in by the end of the week and it still gets feedback.',
  },
  {
    value: 'refund',
    question: 'Can I get a refund?',
    answer: 'Yes, in full until the first session starts. After that you can move to a later cohort once.',
  },
];

/** An address that is already enrolled, so the error state can be tried. */
export const enrolledEmail = 'jordan.lee@example.com';
