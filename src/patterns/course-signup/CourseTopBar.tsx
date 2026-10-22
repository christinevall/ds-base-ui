import { Button } from '../../components/Button';
import styles from '../Patterns.module.css';
import layout from './CourseSignUp.module.css';

/*
 * GAP: the library has no top bar component. This is the app shell's bar
 * (`.topBar` in Patterns.module.css) with a wordmark and a sign-in button.
 * Listed under "Made in this prototype" on the docs page, and in figma/GAPS.md.
 */
export function CourseTopBar({ school }: { school: string }) {
  return (
    <header className={`${styles.topBar} ${layout.topBar}`}>
      <span className={layout.wordmark}>{school}</span>
      <Button variant="ghost" size="sm">
        Sign in
      </Button>
    </header>
  );
}
