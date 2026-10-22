import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Accordion } from '../components/Accordion';
import { Alert } from '../components/Alert';
import { Badge } from '../components/Badge';
import { Breadcrumb } from '../components/Breadcrumb';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Checkbox } from '../components/Checkbox';
import { CheckboxGroup } from '../components/CheckboxGroup';
import { Fieldset } from '../components/Fieldset';
import { Form, FormActions } from '../components/Form';
import type { FormProps } from '../components/Form';
import { RadioGroup, RadioGroupItem } from '../components/RadioGroup';
import { Select } from '../components/Select';
import { TextField } from '../components/TextField';
import { Toast } from '../components/Toast';
import { CourseTopBar } from './course-signup/CourseTopBar';
import { course, plans, questions, startDates, tags, takenEmail } from './course-signup/course';
import type { Plan } from './course-signup/course';
import source from './CourseSignUp.stories.tsx?raw';
import topBarSource from './course-signup/CourseTopBar.tsx?raw';
import layout from './course-signup/CourseSignUp.module.css';
import styles from './Patterns.module.css';
import { prototypeDocs } from './prototypeDocs';

type FieldErrors = NonNullable<FormProps['errors']>;

/** Stands in for the sign-up service. One address is already signed up. */
function fakeSignUp(values: Record<string, unknown>): FieldErrors {
  const email = String(values.email ?? '')
    .trim()
    .toLowerCase();
  if (email === takenEmail) {
    return { email: 'This address is already signed up. Check your inbox for the joining link.' };
  }
  return {};
}

function SignUpPage() {
  const toasts = Toast.useToastManager();
  const [plan, setPlan] = useState<Plan>('live');
  const [errors, setErrors] = useState<FieldErrors>({});
  const chosen = plans.find((p) => p.value === plan) ?? plans[0];

  // Form checks the required fields first, then the fake service; on success a toast.
  const signUp = (values: Record<string, unknown>) => {
    const result = fakeSignUp(values);
    setErrors(result);
    if (Object.keys(result).length === 0) {
      toasts.add({
        type: 'success',
        title: 'You’re signed up',
        description: `We sent the details to ${String(values.email)}.`,
      });
    }
  };

  return (
    <div className={styles.shell}>
      <CourseTopBar school={course.school} />

      <main className={styles.main}>
        {/* "Stack · space/6 — content, max 1024" */}
        <div className={styles.mainInner}>
          <Breadcrumb.Root aria-label="Breadcrumb">
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#courses">Courses</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Current>{course.title}</Breadcrumb.Current>
            </Breadcrumb.Item>
          </Breadcrumb.Root>

          {/* "Stack · space/2 — Page header" */}
          <div className={layout.header}>
            <h1 className={layout.title}>{course.title}</h1>
            <p className={layout.lead}>{course.lead}</p>
            <div className={layout.cluster}>
              {tags.map((tag) => (
                <Badge key={tag.label} variant={tag.variant} size="sm">
                  {tag.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* "Columns · space/8" */}
          <div className={layout.columns}>
            <Form errors={errors} onFormSubmit={signUp}>
              <Fieldset.Root>
                <Fieldset.Legend>About you</Fieldset.Legend>
                <TextField label="Full name" name="name" autoComplete="name" required />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  description="The joining link and the receipt go here."
                  required
                />
              </Fieldset.Root>

              <RadioGroup
                label="How do you want to take it?"
                name="plan"
                value={plan}
                onValueChange={(value) => setPlan(value as Plan)}
              >
                {plans.map((p) => (
                  <RadioGroupItem key={p.value} value={p.value} label={p.label} description={p.description} />
                ))}
              </RadioGroup>

              {/* Only the live group has a start date; self-paced starts any time. */}
              {plan === 'live' ? (
                <Select.Field
                  label="Start date"
                  name="start"
                  items={startDates}
                  defaultValue="nov-10"
                  description="Live sessions on Wednesdays, 18:00 to 19:30 CET."
                >
                  {Object.entries(startDates).map(([value, label]) => (
                    <Select.Item key={value} value={value}>
                      {label}
                    </Select.Item>
                  ))}
                </Select.Field>
              ) : null}

              {/* A Checkbox on its own crashes in code (figma/GAPS.md), so it sits in a group. */}
              <CheckboxGroup label="Updates" name="updates">
                <Checkbox name="next-course" value="next-course" label="Email me when new courses open" />
              </CheckboxGroup>

              <FormActions>
                <Button type="submit">Sign up</Button>
              </FormActions>
            </Form>

            {/* "Stack · space/4 — Aside, 320px" */}
            <aside className={styles.stack} aria-label="About this course">
              <Card.Root variant="elevated">
                <Card.Header>
                  <Card.Title render={<h2 />}>{chosen.price}</Card.Title>
                  <Card.Description>{chosen.note}</Card.Description>
                </Card.Header>
                <Card.Body>{course.included}</Card.Body>
              </Card.Root>

              <Alert variant="info" title="Your employer can pay">
                We make the receipt out in your company’s name. Add the details after you sign up.
              </Alert>
            </aside>
          </div>

          {/* "Stack · space/4 — Section" */}
          <section className={layout.section} aria-labelledby="course-questions">
            <h2 id="course-questions" className={layout.sectionTitle}>
              Questions
            </h2>
            <Accordion.Root>
              {questions.map((item) => (
                <Accordion.Item key={item.value} value={item.value}>
                  <Accordion.Header>
                    <Accordion.Trigger>{item.question}</Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Panel>{item.answer}</Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </section>
        </div>
      </main>
    </div>
  );
}

/**
 * **Prototype.** A sign-up page for a course, built from the design system's
 * real components. Every component and prop was looked up in the Storybook
 * MCP before it was used.
 *
 * **Try it:** switch between *Live group* and *Self-paced*: the price card
 * follows, and the start date disappears for self-paced. *Sign up* checks name
 * and email, then shows a success toast. `sam.rivera@example.com` is already
 * signed up and comes back with an error under the field.
 *
 * **🟠 Built by hand:** the top bar (the library has none), and the layout
 * classes in `course-signup/CourseSignUp.module.css`, one per layout frame.
 *
 * **🔴 Known difference:** *Updates* is a one-option `CheckboxGroup`, because a
 * `Checkbox` on its own crashes in code (see the Gaps page).
 */
function CourseSignUp() {
  return (
    <Toast.Provider>
      <SignUpPage />
      <Toast.Viewport />
    </Toast.Provider>
  );
}

const docs = prototypeDocs([
  { source, fn: 'SignUpPage', section: true },
  { source: topBarSource, fn: 'CourseTopBar' },
]);

const meta = {
  title: 'Prototypes/Course sign-up',
  component: CourseSignUp,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { source: docs.source } },
} satisfies Meta<typeof CourseSignUp>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The empty page, as a visitor first sees it. */
export const Default: Story = { parameters: { docs: { description: docs.description } } };

/** Self-paced picked: the price card shows €140 and the start date is gone. */
export const SelfPaced: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('radio', { name: /Self-paced/ }));
    await expect(canvas.getByRole('heading', { name: '€140' })).toBeVisible();
    await expect(canvas.queryByText('Start date')).toBeNull();
  },
};

/** Name and email filled in, *Sign up* pressed: a success toast. */
export const SignedUp: Story = {
  play: async ({ canvas, canvasElement }) => {
    await userEvent.type(canvas.getByLabelText('Full name'), 'Alex Moreau');
    await userEvent.type(canvas.getByLabelText('Email'), 'alex.moreau@example.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Sign up' }));
    const page = within(canvasElement.ownerDocument.body);
    await expect(await page.findByText('You’re signed up')).toBeVisible();
  },
};

/** Pressed with nothing filled in: both required fields say so, and no toast. */
export const MissingDetails: Story = {
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Sign up' }));
    await expect(canvas.getByLabelText('Full name')).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    await expect(within(canvasElement.ownerDocument.body).queryByText('You’re signed up')).toBeNull();
  },
};

/** An address that is already signed up: the service's error appears under Email. */
export const AlreadySignedUp: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByLabelText('Full name'), 'Sam Rivera');
    await userEvent.type(canvas.getByLabelText('Email'), takenEmail);
    await userEvent.click(canvas.getByRole('button', { name: 'Sign up' }));
    await expect(await canvas.findByText(/already signed up/)).toBeVisible();
  },
};
