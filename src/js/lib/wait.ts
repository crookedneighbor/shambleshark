export default function wait(time = 1): Promise<void> {
  return new Promise((resolve) => {
    global.setTimeout(resolve, time);
  });
}
