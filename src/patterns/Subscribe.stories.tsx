import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Alert } from '../components/Alert';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Checkbox } from '../components/Checkbox';
import { CheckboxGroup } from '../components/CheckboxGroup';
import { Form } from '../components/Form';
import type { FormProps } from '../components/Form';
import { RadioGroup, RadioGroupItem } from '../components/RadioGroup';
import { TextField } from '../components/TextField';
import { featured, topics } from './blog/articles';
import { BlogTopBar } from './blog/BlogTopBar';
import { goTo, storyIds } from './blog/prototypeNav';
import topBarSource from './blog/BlogTopBar.tsx?raw';
import source from './Subscribe.stories.tsx?raw';
import blog from './blog/Blog.module.css';
import styles from './Patterns.module.css';
import { prototypeDocs } from './prototypeDocs';

type FieldErrors = NonNullable<FormProps['errors']>;

/* ------------------------------------------------------- fake server round trip */

/** Stands in for the newsletter service, like `fakeSignUp` in the Sign-up form pattern. */
function fakeSubscribe(values: Record<string, unknown>, chosen: string[]): FieldErrors {
  const errors: Record<string, string> = {};
  const email = String(values.email ?? '')
    .trim()
    .toLowerCase();

  if (email === 'reader@example.com') {
    errors.email = 'This address is already subscribed. Check your inbox for the last issue.';
  }
  if (chosen.length === 0) {
    errors.topics = 'Pick at least one topic, or we have nothing to send you.';
  }
  return errors;
}

/* --------------------------------------------------------------- the screen */

function SubscribePage({
  initialErrors = {},
  initialEmail = '',
  subscribed = false,
}: {
  /** Field errors already known before the first submit, keyed by field name. */
  initialErrors?: FieldErrors;
  /** Email pre-filled in the form. */
  initialEmail?: string;
  /** Start on the "check your inbox" state. */
  subscribed?: boolean;
}) {
  const [errors, setErrors] = useState<FieldErrors>(initialErrors);
  const [chosen, setChosen] = useState<string[]>(topics.map((topic) => topic.label));
  const [doneFor, setDoneFor] = useState<string | null>(
    subscribed ? initialEmail || 'alex.reader@example.org' : null,
  );

  return (
    <div className={styles.shell}>
      <BlogTopBar />

      <main className={styles.main}>
        <div className={blog.subscribeLayout}>
          <section className={blog.subscribeIntro}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Get The Journal in your inbox</h1>
              <p className={styles.pageLead}>
                One short email when a new essay is out. Tokens, components, and working with AI
                without drift. No tracking pixels, no sponsors.
              </p>
            </div>

            {/* GAP: a short list of benefits. There is no list component. */}
            <ul className={blog.benefitList}>
              <li>Every new article, the day it is published</li>
              <li>A monthly round-up of what changed in the system</li>
              <li>Unsubscribe with one click, from any email</li>
            </ul>

            <div className={blog.article}>
              <Badge variant="neutral" size="sm">
                Latest issue
              </Badge>
              <Card.Root className={blog.articleCard}>
                <Card.Header>
                  <Card.Title render={<h2 />}>{featured.title}</Card.Title>
                  <Card.Description>{featured.meta}</Card.Description>
                </Card.Header>
                <Card.Body>{featured.excerpt}</Card.Body>
                <Card.Footer>
                  <Button variant="ghost" onClick={goTo(storyIds.article)}>
                    Read it first
                  </Button>
                </Card.Footer>
              </Card.Root>
            </div>
          </section>

          {doneFor ? (
            <Card.Root variant="elevated" className={blog.subscribeCard}>
              <Card.Header>
                <Card.Title render={<h2 />}>You are nearly subscribed</Card.Title>
              </Card.Header>
              <Card.Body>
                <Alert variant="success" title="Check your inbox">
                  We sent a confirmation link to {doneFor}. Click it and the next issue is yours.
                </Alert>
              </Card.Body>
              <Card.Footer>
                <Button onClick={goTo(storyIds.index)}>Back to articles</Button>
                <Button variant="ghost" onClick={() => setDoneFor(null)}>
                  Use a different email
                </Button>
              </Card.Footer>
            </Card.Root>
          ) : (
            <Card.Root variant="elevated" className={blog.subscribeCard}>
              <Card.Header>
                <Card.Title render={<h2 />}>Subscribe</Card.Title>
                <Card.Description>Free. Takes ten seconds.</Card.Description>
              </Card.Header>
              <Card.Body>
                <Form
                  errors={errors}
                  onFormSubmit={(values) => {
                    const result = fakeSubscribe(values, chosen);
                    setErrors(result);
                    if (Object.keys(result).length === 0) setDoneFor(String(values.email));
                  }}
                >
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.org"
                    defaultValue={initialEmail}
                    required
                  />
                  <TextField
                    label="First name"
                    name="firstName"
                    autoComplete="given-name"
                    placeholder="Alex"
                    description="Optional. Only used to say hello."
                  />

                  <CheckboxGroup
                    label="Topics"
                    name="topics"
                    orientation="horizontal"
                    value={chosen}
                    onValueChange={setChosen}
                  >
                    {topics.map((topic) => (
                      // GAP: `value` is required here. Once the group has a `name`,
                      // each box takes the group's name, so `name` no longer tells
                      // them apart: none start ticked and one click ticks them all.
                      <Checkbox
                        key={topic.label}
                        name="topics"
                        value={topic.label}
                        label={topic.label}
                      />
                    ))}
                  </CheckboxGroup>

                  <RadioGroup label="How often" name="frequency" defaultValue="each">
                    <RadioGroupItem value="each" label="Every new article" />
                    <RadioGroupItem value="monthly" label="Monthly round-up only" />
                  </RadioGroup>

                  <Button type="submit" fullWidth>
                    Subscribe
                  </Button>
                </Form>
              </Card.Body>
            </Card.Root>
          )}
        </div>
      </main>
    </div>
  );
}

/**
 * **Prototype, not a pattern.** Built in code first — there is no Figma frame
 * for it yet. It borrows the blog's top bar and content, and the round trip of
 * *Patterns/Sign-up form*: client validation from `Form`, then fake server
 * errors handed back through `errors`, each shown under its own field.
 *
 * Try it: submit `reader@example.com` to see the "already subscribed" error, or
 * untick every topic to see the group error. Any other address goes through.
 *
 * | Part | In code | Status |
 * | --- | --- | --- |
 * | Top bar, Subscribe button | Shared `BlogTopBar` — its Subscribe button now opens this page | Match |
 * | Form card, latest issue card | `Card` elevated / outlined | Match |
 * | Email, first name | `TextField` inside `Form` | Match |
 * | Topics, how often | `CheckboxGroup` + `Checkbox`, `RadioGroup` | Match |
 * | Confirmation message | `Alert variant="success"` | Match |
 * | Page title, lead | Plain `h1` / `p` on the pattern classes | **Gap** — no text component; same as every pattern |
 * | Benefit list | Plain `ul` | **Gap** — no list component |
 * | "Read it first", "Back to articles" | `Button` | **Gap** — these navigate, so they should be links; same `Button` gap as *Blog index* |
 */
const meta = {
  title: 'Prototypes/Subscribe',
  component: SubscribePage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: prototypeDocs([
      { source, fn: 'SubscribePage' },
      { source: topBarSource, fn: 'BlogTopBar' },
    ]),
  },
} satisfies Meta<typeof SubscribePage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The empty form. Fill it in and press **Subscribe**. */
export const Default: Story = {};

/** The address is already on the list — the error a server sends back. */
export const AlreadySubscribed: Story = {
  args: {
    initialEmail: 'reader@example.com',
    initialErrors: {
      email: 'This address is already subscribed. Check your inbox for the last issue.',
    },
  },
};

/** After a successful submit: the double opt-in "check your inbox" state. */
export const Subscribed: Story = {
  args: { subscribed: true, initialEmail: 'alex.reader@example.org' },
};
