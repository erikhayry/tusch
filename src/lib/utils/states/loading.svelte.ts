export class LoadingState {
	private pendingCount = $state(0);

	get isLoading() {
		return this.pendingCount > 0;
	}

	start() {
		this.pendingCount += 1;
	}

	stop() {
		this.pendingCount = Math.max(0, this.pendingCount - 1);
	}
}

export const globalLoading = new LoadingState();
