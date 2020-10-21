export default function handleError(error: Error): void {
  console.error('An error occured while prompting questions');
  const err = new Error(error.message);
  err.stack = error.stack;
  throw err;
}
