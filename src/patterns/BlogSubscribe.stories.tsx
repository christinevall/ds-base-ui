import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Checkbox } from '../components/Checkbox';
import { CheckboxGroup } from '../components/CheckboxGroup';
import { Form } from '../components/Form';
import type { FormProps } from '../components/Form';
import { RadioGroup, RadioGroupItem } from '../components/RadioGroup';
import { TextField } from '../components/TextField';
import { topics } from './blog/articles';
import { BlogTopBar } from './blog/BlogTopBar';
import { goTo, storyIds } from './blog/prototypeNav';
import topBarSource from './blog/BlogTopBar.tsx?raw';
import source from './BlogSubscribe.stories.tsx?raw';
import blog from './blog/Blog.module.css';
import styles from './Patterns.module.css';
import { prototypeDocs } from './prototypeDocs';

type FieldErrors = NonNullable<FormProps['errors']>;

/** Stands in for the newsletter service. One address is already on the list. */
function fakeSubscribe(values: Record<string, unknown>): FieldErrors {
  const email = String(values.email ?? '')
    .trim()
    .toLowerCase();
  if (email === 'sam.rivera@example.com') {
    return { email: 'This address is already subscribed. Check your inbox for the last issue.' };
  }
  return {};
}

/* --------------------------------------------------------------- the screen */

function BlogSubscribe({ initialSubscribed = false }: { initialSubscribed?: boolean }) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [subscribedAs, setSubscribedAs] = useState<string | null>(
    initialSubscribed ? 'alex.moreau@example.com' : null,
  );

  return (
    <div className={styles.shell}>
      <BlogTopBar />

      <main className={styles.main}>
        <div className={blog.subscribePage}>
          <Card.Root variant="elevated" className={styles.authCard}>
            <Card.Header>
              <Card.Title render={<h1 />}>Get The Journal by email</Card.Title>
              <Card.Description>
                One short essay on tokens, components and AI. No tracking pixels, and you can
                leave with one click.
              </Card.Description>
            </Card.Header>

            <Card.Body>
              {subscribedAs ? (
                <div className={styles.stack}>
                  <Alert variant="success" title="Almost there">
                    We sent a confirmation link to {subscribedAs}. Open it to start receiving
                    the Journal.
                  </Alert>
                  <Button variant="secondary" fullWidth onClick={goTo(storyIds.index)}>
                    Back to articles
                  </Button>
                </div>
              ) : (
                <Form
                  errors={errors}
                  onFormSubmit={(values) => {
                    const result = fakeSubscribe(values);
                    setErrors(result);
                    if (Object.keys(result).length === 0) setSubscribedAs(String(values.email));
                  }}
                >
                  <TextField
                    label="Email address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    description="We only use it to send the Journal."
                  />

                  <CheckboxGroup
                    label="Topics"
                    description="Untick what you would rather skip."
                    orientation="horizontal"
                    defaultValue={topics.map((topic) => topic.label)}
                  >
                    {topics.map((topic) => (
                      <Checkbox key={topic.label} name={topic.label} label={topic.label} />
                    ))}
                  </CheckboxGroup>

                  <RadioGroup label="How often" name="frequency" defaultValue="weekly">
                    <RadioGroupItem value="weekly" label="Weekly" />
                    <RadioGroupItem value="monthly" label="Monthly digest" />
                  </RadioGroup>

                  <Button type="submit" fullWidth>
                    Subscribe
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card.Root>
        </div>
      </main>
    </div>
  );
}

const docs = prototypeDocs([
  { source, fn: 'BlogSubscribe' },
  { source: topBarSource, fn: 'BlogTopBar' },
]);

/**
 * **Prototype, not a pattern.** The page behind the blog's **Subscribe**
 * button. Built from the Storybook MCP's component docs, with no Figma frame
 * behind it yet.
 *
 * | Part | In code | Status |
 * | --- | --- | --- |
 * | Form card | `Card` elevated, title rendered as the page `h1` | Match |
 * | Email, topics, frequency | `TextField`, `CheckboxGroup` + `Checkbox`, `RadioGroup` inside `Form` | Match |
 * | Confirmation | `Alert` success, in place of the form | Match |
 * | Top bar | Shared `BlogTopBar`; its Subscribe button now opens this page | Match |
 * | Centring the card | `Blog.module.css` `.subscribePage` | Page layout |
 * | Topics in the submitted values | `CheckboxGroup` | **Unverified**: the fake service ignores them, so nothing checks that they arrive |
 *
 * Try `sam.rivera@example.com`: the fake service says it is already on the
 * list, and the message appears under the field through `Form`'s `errors`.
 */
const meta = {
  title: 'Prototypes/Blog subscribe',
  component: BlogSubscribe,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { source: docs.source } },
} satisfies Meta<typeof BlogSubscribe>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The empty form, as reached from the top bar. */
export const Default: Story = {
  parameters: { docs },
};

/** After a successful submit: the form is replaced by the confirmation. */
export const Subscribed: Story = {
  args: { initialSubscribed: true },
};
