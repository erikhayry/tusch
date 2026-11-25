// Revoking at once can cancel the save in some browsers, so the URL lives a while.
const REVOKE_DELAY_MS = 10_000;

/** Saves a blob as a file through a temporary `<a download>` link. */
export function saveFile(fileName: string, blob: Blob): void {
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.append(link);
	link.click();
	link.remove();

	setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}
