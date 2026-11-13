const DONE_VISIBLE_MS = 3000;

type Submission = { id: number; label: string; startedAt: number };

export class LoadingState {
	private submissions = $state<Submission[]>([]);
	private now = $state(Date.now());
	private nextId = 0;
	private interval: ReturnType<typeof setInterval> | undefined;
	private doneTimeout: ReturnType<typeof setTimeout> | undefined;

	/** True after the latest submission succeeded; announced as "Done" until the next one starts. */
	succeeded = $state(false);

	get isLoading() {
		return this.submissions.length > 0;
	}

	/** The most recently started submission that is still running. */
	private get current() {
		return this.submissions.at(-1);
	}

	get label() {
		return this.current?.label;
	}

	get elapsedSeconds() {
		const current = this.current;
		return current ? Math.max(0, Math.floor((this.now - current.startedAt) / 1000)) : 0;
	}

	start(label: string) {
		const id = this.nextId++;
		this.now = Date.now();
		this.succeeded = false;
		clearTimeout(this.doneTimeout);
		this.submissions.push({ id, label, startedAt: this.now });
		// Elapsed time derives from the start timestamp, so a throttled tab still shows the right value.
		this.interval ??= setInterval(() => (this.now = Date.now()), 1000);
		return id;
	}

	stop(id: number, succeeded = false) {
		this.submissions = this.submissions.filter((submission) => submission.id !== id);
		this.succeeded = succeeded;
		clearTimeout(this.doneTimeout);
		// "Done" only needs to be announced once; don't leave it lingering on the page.
		if (succeeded) this.doneTimeout = setTimeout(() => (this.succeeded = false), DONE_VISIBLE_MS);
		if (this.submissions.length === 0 && this.interval !== undefined) {
			clearInterval(this.interval);
			this.interval = undefined;
		}
	}
}

export const globalLoading = new LoadingState();
