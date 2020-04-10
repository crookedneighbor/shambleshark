export default function wait(time = 1) {
  return new Promise((resolve) => {
    global.setTimeout(resolve, time);
  });
}
