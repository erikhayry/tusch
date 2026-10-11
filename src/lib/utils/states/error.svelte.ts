type Error = { isError: true; message: string } | { isError: false };

class ErrorState {
	private isErrorState = $state<Error>({ isError: false });

	get error() {
		return this.isErrorState;
	}

	set(message: string) {
		this.isErrorState = { isError: true, message };
	}

	reset() {
		this.isErrorState = { isError: false };
	}
}

export const globalError = new ErrorState();
