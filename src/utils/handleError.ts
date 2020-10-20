// It does not return anything, it throws an error (see #12129: https://github.com/microsoft/TypeScript/issues/13219)
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function handleError(error: Error) {
  console.error('An error occured while prompting questions');
  const err = new Error(error.message);
  err.stack = error.stack;
  throw err;
}
