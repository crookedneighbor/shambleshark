// https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/

function freezeBodyBehindDialog(): void {
  const body = document.body;
  const calculatedScrollYPosition = `${window.scrollY}px`;

  body.style.width = "100%";
  body.style.position = "fixed";
  body.style.top = `-${calculatedScrollYPosition}`;
}

function resetBody(): void {
  const body = document.body;
  const scrollY = body.style.top;

  body.style.width = "";
  body.style.position = "";
  body.style.top = "";

  if (scrollY) {
    window.scrollTo(0, parseInt(scrollY) * -1);
  }
}

export default function (locked?: boolean): void {
  locked ? freezeBodyBehindDialog() : resetBody();
}
