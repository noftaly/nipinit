export default function handleError(error) {
  console.error('An error occured while prompting questions');
  const err = new Error(error);
  err.stack = error.stack;
  throw err;
}
