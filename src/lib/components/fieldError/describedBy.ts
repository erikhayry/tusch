/**
 * The `aria-describedby` of a field: its hint ids, plus its error id while the server
 * rejects the field (REQ-201-1). Shared so every form links errors the same way.
 */
export function describedBy(hintIds: string[], errorId: string, message: string | undefined) {
	return (message ? [...hintIds, errorId] : hintIds).join(' ');
}
