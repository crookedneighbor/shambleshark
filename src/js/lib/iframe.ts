type CreateOptions = {
  src: string;
  id: string;
};

export async function create({ src, id }: CreateOptions): Promise<void> {
  const iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.id = id;
  iframe.style.width = "0px";
  iframe.style.height = "0px";
  iframe.style.opacity = "0";

  return new Promise((resolve) => {
    iframe.addEventListener("load", () => resolve());
    document.body.appendChild(iframe);
  });
}

export function isInsideIframe(): boolean {
  return window.location !== window.parent.location;
}

export default {
  create,
  isInsideIframe,
};
