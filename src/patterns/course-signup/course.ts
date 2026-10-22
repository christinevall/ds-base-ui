import type { BadgeProps } from '../../components/Badge';

/*
 * Copy for the course sign-up prototype. Neutral demo content: a fictional
 * school and a fictional course, example.com addresses only.
 */

export const course = {
  school: 'Fernhill School',
  title: 'Writing for interfaces',
  lead: 'Four weeks on the words inside a product: buttons, errors, empty states and onboarding. For designers who want their screens to say clearly what happens next.',
  included: 'Four live sessions with recordings, a weekly writing exercise with feedback, and a checklist you keep.',
};

export const tags: { label: string; variant: BadgeProps['variant'] }[] = [
  { label: 'Online', variant: 'accent' },
  { label: '4 weeks', variant: 'neutral' },
  { label: 'Beginner friendly', variant: 'neutral' },
];

/** The two ways to take the course. The price lives here so the card follows the choice. */
export const plans = [
  {
    value: 'live',
    label: 'Live group · €290',
    description: 'Weekly live sessions and feedback on your exercises, in a group of 16.',
    price: '€290',
    note: 'Live group · 4 weeks',
  },
  {
    value: 'self-paced',
    label: 'Self-paced · €140',
    description: 'All recordings and exercises, at your own speed. No live feedback.',
    price: '€140',
    note: 'Self-paced · start any time',
  },
] as const;

export type Plan = (typeof plans)[number]['value'];

/** Start dates for the live group, as `Select.Field` items. */
export const startDates = {
  'nov-10': 'Monday 10 November',
  'jan-19': 'Monday 19 January',
  'mar-9': 'Monday 9 March',
};

export const questions = [
  {
    value: 'experience',
    question: 'Do I need writing experience?',
    answer: 'No. The course starts from the screens you already design and works from there.',
  },
  {
    value: 'missed',
    question: 'What if I miss a live session?',
    answer: 'Every session is recorded and online the same day. Send your exercise by the end of the week and it still gets feedback.',
  },
  {
    value: 'refund',
    question: 'Can I get a refund?',
    answer: 'Yes, in full until the first session. After that you can move to a later group once.',
  },
];

/** An address that is already signed up, so the error state can be tried. */
export const takenEmail = 'sam.rivera@example.com';
