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
import { Textarea } from '../components/Textarea';
import { Toast } from '../components/Toast';
import { cohorts, course, enrolledEmail, formats, questions, tags } from './course/course';
import type { Format } from './course/course';
import source from './CourseSignUp.stories.tsx?raw';
import layout from './course/Course.module.css';
import styles from './Patterns.module.css';
import { prototypeDocs } from './prototypeDocs';

type FieldErrors = NonNullable<FormProps['errors']>;

/** Stands in for the enrolment service. One address is already on the course. */
function fakeEnrol(values: Record<string, unknown>): FieldErrors {
  const email = String(values.email ?? '')
    .trim()
    .toLowerCase();
  if (email === enrolledEmail) {
    return { email: 'This address is already enrolled. Check your inbox for the joining link.' };
  }
  return {};
}

/* GAP: no top bar component; this is the shell's bar from the App shell pattern. */
function CourseTopBar() {
  return (
    <header className={`${styles.topBar} ${layout.topBar}`}>
      <span className={layout.wordmark}>{course.school}</span>
      <Button variant="ghost" size="sm">
        Sign in
      </Button>
    </header>
  );
}

function CoursePage() {
  const toasts = Toast.useToastManager();
  const [format, setFormat] = useState<Format>('cohort');
  const [errors, setErrors] = useState<FieldErrors>({});
  const chosen = formats.find((f) => f.value === format) ?? formats[0];

  // Checks the required fields first (Form), then the fake service; on success a toast.
  const reserve = (values: Record<string, unknown>) => {
    const result = fakeEnrol(values);
    setErrors(result);
    if (Object.keys(result).length === 0) {
      toasts.add({
        type: 'success',
        title: 'Your place is reserved',
        description: `We sent the details to ${String(values.email)}.`,
      });
    }
  };

  return (
    <div className={styles.shell}>
      <CourseTopBar />

      <main className={styles.main}>
        {/* "Stack · space/6 — content, max 1024" */}
        <div className={styles.mainInner}>
          <Breadcrumb.Root aria-label="Breadcrumb">
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#courses">Courses</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Current>{course.crumb}</Breadcrumb.Current>
            </Breadcrumb.Item>
          </Breadcrumb.Root>

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
            <Form errors={errors} onFormSubmit={reserve}>
              <Fieldset.Root>
                <Fieldset.Legend>About you</Fieldset.Legend>
                <TextField label="Full name" name="name" autoComplete="name" required />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  description="The joining link and the invoice go here."
                  required
                />
              </Fieldset.Root>

              <RadioGroup
                label="How do you want to take it?"
                name="format"
                value={format}
                onValueChange={(value) => setFormat(value as Format)}
              >
                {formats.map((f) => (
                  <RadioGroupItem key={f.value} value={f.value} label={f.label} description={f.description} />
                ))}
              </RadioGroup>

              {/* Only the live cohort has a start date; self-paced starts any time. */}
              {format === 'cohort' ? (
                <Select.Field
                  label="Cohort start"
                  name="cohort"
                  items={cohorts}
                  defaultValue="nov-3"
                  description="Live sessions on Tuesdays, 17:00 to 18:30 CET."
                >
                  {Object.entries(cohorts).map(([value, label]) => (
                    <Select.Item key={value} value={value}>
                      {label}
                    </Select.Item>
                  ))}
                </Select.Field>
              ) : null}

              <Textarea
                label="Anything we should know?"
                name="notes"
                placeholder="Your role, your team, what you want to get out of it…"
                rows={3}
              />

              {/* A Checkbox on its own crashes in code (figma/GAPS.md), so it sits in a group. */}
              <CheckboxGroup label="Updates" name="updates">
                <Checkbox name="next-cohort" value="next-cohort" label="Email me when the next cohort opens" />
              </CheckboxGroup>

              <FormActions>
                <Button type="submit">Reserve my place</Button>
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
                We send the invoice in your company’s name. Add the details after you reserve.
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
 * **Prototype.** A course sign-up page, built from the design system's real
 * components through the Storybook MCP: every component and prop was looked up
 * in the MCP's docs before it was used.
 *
 * **Try it:** switch between *Live cohort* and *Self-paced*: the price card
 * follows, and the cohort date disappears for self-paced. *Reserve my place*
 * checks name and email, then shows a success toast. The address
 * `jordan.lee@example.com` is already enrolled and comes back with an error
 * under the field.
 *
 * **🟠 Built by hand:** the top bar and wordmark (no component), and the layout
 * classes in `course/Course.module.css`, one per layout frame.
 *
 * **🔴 Known difference:** *Updates* is a one-option `CheckboxGroup`, because a
 * `Checkbox` on its own crashes in code (see the Gaps page).
 */
function CourseSignUp() {
  return (
    <Toast.Provider>
      <CoursePage />
      <Toast.Viewport />
    </Toast.Provider>
  );
}

const docs = prototypeDocs([
  { source, fn: 'CoursePage' },
  { source, fn: 'CourseTopBar' },
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

/** Self-paced picked: the price card shows €190 and the cohort date is gone. */
export const SelfPaced: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('radio', { name: /Self-paced/ }));
    await expect(canvas.getByRole('heading', { name: '€190' })).toBeVisible();
    await expect(canvas.queryByText('Cohort start')).toBeNull();
  },
};

/** Name and email filled in, *Reserve my place* pressed: a success toast. */
export const PlaceReserved: Story = {
  play: async ({ canvas, canvasElement }) => {
    await userEvent.type(canvas.getByLabelText('Full name'), 'Alex Moreau');
    await userEvent.type(canvas.getByLabelText('Email'), 'alex.moreau@example.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Reserve my place' }));
    const page = within(canvasElement.ownerDocument.body);
    await expect(await page.findByText('Your place is reserved')).toBeVisible();
  },
};

/** Pressed with nothing filled in: both required fields say so, and no toast. */
export const MissingDetails: Story = {
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Reserve my place' }));
    await expect(canvas.getByLabelText('Full name')).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    await expect(within(canvasElement.ownerDocument.body).queryByText('Your place is reserved')).toBeNull();
  },
};

/** An address that is already enrolled: the service's error appears under Email. */
export const AlreadyEnrolled: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByLabelText('Full name'), 'Jordan Lee');
    await userEvent.type(canvas.getByLabelText('Email'), 'jordan.lee@example.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Reserve my place' }));
    await expect(await canvas.findByText(/already enrolled/)).toBeVisible();
  },
};
