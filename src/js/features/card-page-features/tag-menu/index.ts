import Feature from "Feature";
import { FEATURE_IDS as ids, FEATURE_SECTIONS as sections } from "Constants";
import createElement from "Lib/create-element";
import { requestTags, TagInfo, TaggerLookupData } from "Lib/tagger-bridge";
import { ready as elementReady } from "Lib/mutation";
import TaggerIcon from "Ui/tagger-icon";
import "./index.css";

function createViewMoreTagsRow(link: string): HTMLTableRowElement {
  const tr = document.createElement("tr");
  const td = document.createElement("td");
  const a = document.createElement("a");

  td.setAttribute("colspan", "4");
  a.href = link;
  a.innerText = "View more tags →";

  td.appendChild(a);
  tr.appendChild(td);

  return tr;
}

function createTagRow(tag: TagInfo): HTMLTableRowElement {
  const tr = document.createElement("tr");
  const td = document.createElement("td");
  const a = document.createElement("a");
  const icon = new TaggerIcon(tag.tagType).element;

  tr.classList.add("tag-menu-row");
  a.setAttribute("data-component", "card-tooltip");
  a.href = tag.link;
  a.appendChild(icon);
  a.appendChild(createElement(`<span>${tag.name}</span>`));

  td.appendChild(a);
  tr.appendChild(td);

  return tr;
}

function createTable(
  payload: TagInfo[],
  name: string,
  link: string
): HTMLTableElement {
  const table = createElement<HTMLTableElement>(`<table class="tags-table prints-table">
      <thead>
        <tr>
          <th>
            <a href="${link}">${name}</a>
          </th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    </table>`);

  return table;
}

// TODO add option to show card previews for relationships
class TagMenu extends Feature {
  static metadata = {
    id: ids.TagMenu,
    title: "Tag Menu",
    section: sections.CARD_PAGE,
    description: "Display tags for card inline on the page.",
    futureFeature: false,
  };

  static settingsDefaults = {
    enabled: true,
    artTags: true,
    cardTags: true,
  };

  static settingDefinitions = [
    {
      id: "artTags",
      label: "Show a card's art tags.",
      input: "checkbox",
    },
    {
      id: "cardTags",
      label: "Show a card's card tags.",
      input: "checkbox",
    },
  ];

  container: HTMLDivElement;

  constructor() {
    super();

    this.container = document.createElement("div");
    this.container.classList.add("tag-menu-container");
  }

  async run(): Promise<void> {
    const settings = await TagMenu.getSettings();
    const payload = await requestTags(this.getTaggerData());

    elementReady<HTMLDivElement>(".prints-table:last-of-type", (element) => {
      if (this.container.parentNode) {
        // the container has already been inserted,
        // so this new element is the very element
        // we are adding!
        return;
      }
      (element.parentNode as HTMLDivElement).insertBefore(
        this.container,
        element.nextSibling
      );

      if (settings.artTags && payload.art.length > 0) {
        this.addTags(payload.art, "Art Tags", payload.taggerLink);
      }

      if (settings.cardTags && payload.oracle.length > 0) {
        this.addTags(payload.oracle, "Card Tags", payload.taggerLink);
      }
    });
  }

  getTaggerData(): TaggerLookupData {
    const taggerUrl = "https://tagger.scryfall.com/card/";
    const taggerButton = document.querySelector(
      `a[href^="${taggerUrl}"]`
    ) as HTMLAnchorElement;
    const parts = taggerButton.href.split(taggerUrl)[1].split("/");

    return {
      set: parts[0],
      number: parts[1],
    };
  }

  addTags(payload: TagInfo[], tableLabel: string, link: string): void {
    const rows = payload.reduce(
      (rows: HTMLTableRowElement[], tag: TagInfo, index: number) => {
        if (index > 6) {
          return rows;
        }

        if (index === 6) {
          rows.push(createViewMoreTagsRow(link));

          return rows;
        }

        rows.push(createTagRow(tag));

        return rows;
      },
      []
    );
    const table = createTable(payload, tableLabel, link);
    const tbody = table.querySelector("tbody") as HTMLTableSectionElement;

    rows.forEach((row) => tbody.appendChild(row));

    this.container.appendChild(table);
  }
}

export default TagMenu;
