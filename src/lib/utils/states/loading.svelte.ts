class LoadingState {
	private isLoadingState = $state(false);

	get isLoading() {
		return this.isLoadingState;
	}

	start() {
		this.isLoadingState = true;
	}

	stop() {
		this.isLoadingState = false;
	}
}

export const globalLoading = new LoadingState();
