export function getLocalDayQuery(): string {
  const date = new Date().toLocaleDateString("en-CA");
  const offset = new Date().getTimezoneOffset();
  return `date=${date}&offset=${offset}`;
}
