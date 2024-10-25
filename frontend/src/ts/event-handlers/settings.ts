import * as ShareCustomThemeModal from "../modals/share-custom-theme";
import * as CookiesModal from "../modals/cookies";
import * as EditPresetPopup from "../modals/edit-preset";
import * as EditTagPopup from "../modals/edit-tag";
import Config from "../config";
import * as Misc from "../utils/misc";
import * as JSONData from "../utils/json-data";
import * as TestWords from "../test/test-words";

import * as Notifications from "../elements/notifications";

const stenoKeys: JSONData.Layout = {
  keymapShowTopRow: true,
  type: "matrix",
  keys: {
    row1: [],
    row2: ["sS", "tT", "pP", "hH", "**", "fF", "pP", "lL", "tT", "dD"],
    row3: ["sS", "kK", "wW", "rR", "**", "rR", "bB", "gG", "sS", "zZ"],
    row4: ["aA", "oO", "eE", "uU"],
    row5: [],
  },
};

export async function refresh(
  layoutName: string = Config.layout, containerName = "#keymap"
): Promise<void> {
  //if (Config.keymapMode === "off") return;
  // if (ActivePage.get() !== "test") return;
  if (!layoutName) return;
  try {
    let layouts;
    try {
      layouts = await JSONData.getLayoutsList();
    } catch (e) {
      Notifications.add(
        Misc.createErrorMessage(e, "Failed to refresh keymap"),
        -1
      );
      return;
    }

    let lts = layouts[layoutName]; //layout to show

    let layoutString = layoutName;
    if (Config.keymapLayout === "overrideSync") {
      if (Config.layout === "default") {
        lts = layouts["qwerty"];
        layoutString = "default";
      } else {
        lts = layouts[Config.layout];
        layoutString = Config.layout;
      }
    } else {
      lts = layouts[Config.keymapLayout];
      layoutString = Config.keymapLayout;
    }

    const showTopRow =
      (TestWords.hasNumbers && Config.keymapMode === "next") ||
      Config.keymapShowTopRow === "always" ||
      ((lts as (typeof layouts)["qwerty"]).keymapShowTopRow &&
        Config.keymapShowTopRow !== "never");

    const isMatrix =
      Config.keymapStyle === "matrix" || Config.keymapStyle === "split_matrix";

    const isSteno =
      Config.keymapStyle === "steno" || Config.keymapStyle === "steno_matrix";

    if (isSteno) {
      lts = stenoKeys;
    }

    if (lts === undefined) {
      throw new Error("Failed to refresh keymap: layout not found");
    }

    const isISO = lts.type === "iso";

    let keymapElement = "";

    // ( as (keyof MonkeyTypes.Keys)[]).forEach(
    //   (row, index) => {

    const rowIds = Object.keys(lts.keys);

    for (let index = 0; index < rowIds.length; index++) {
      const row = rowIds[index] as keyof JSONData.Keys;
      let rowKeys = lts.keys[row];
      if (row === "row1" && (isMatrix || Config.keymapStyle === "staggered")) {
        rowKeys = rowKeys.slice(1);
      }
      let rowElement = "";
      if (row === "row1" && (!showTopRow || isSteno)) {
        continue;
      }

      if (
        (row === "row2" || row === "row3" || row === "row4") &&
        !isMatrix &&
        !isSteno
      ) {
        rowElement += "<div></div>";
      }

      if (row === "row4" && !isISO && !isMatrix && !isSteno) {
        rowElement += "<div></div>";
      }

      if (isMatrix) {
        if (row !== "row5" && lts.matrixShowRightColumn) {
          rowElement += `<div class="keymapKey"></div>`;
        } else {
          rowElement += `<div></div>`;
        }
      }

      if (row === "row5") {
        if (isSteno) continue;
        const layoutDisplay = layoutString.replace(/_/g, " ");
        let letterStyle = "";
        if (Config.keymapLegendStyle === "blank") {
          letterStyle = `style="display: none;"`;
        }
        rowElement += "<div></div>";
        rowElement += `<div class="keymapKey keySpace">
          <div class="letter keymapKey" ${letterStyle}>${layoutDisplay}</div>
        </div>`;
        rowElement += `<div class="keymapSplitSpacer"></div>`;
        rowElement += `<div class="keymapKey keySplitSpace">
          <div class="letter"></div>
        </div>`;
      } else {
        for (let i = 0; i < rowKeys.length; i++) {
          if (row === "row2" && i === 12) continue;
          if (row === "row4" && isMatrix && isISO && i === 0) continue;

          let colLimit = 10;
          if (lts.matrixShowRightColumn) {
            colLimit = 11;
          }
          if (row === "row4" && isMatrix && isISO) {
            colLimit += 1;
          }

          if (
            (Config.keymapStyle === "matrix" ||
              Config.keymapStyle === "split_matrix") &&
            i >= colLimit
          ) {
            continue;
          }
          const key = rowKeys[i] as string;
          const bump = row === "row3" && (i === 3 || i === 6) ? true : false;
          let keyDisplay = key[0] as string;
          let letterStyle = "";
          if (Config.keymapLegendStyle === "blank") {
            letterStyle = `style="display: none;"`;
          } else if (Config.keymapLegendStyle === "uppercase") {
            keyDisplay = keyDisplay.toUpperCase();
          }
          let hide = "";
          if (
            row === "row1" &&
            i === 0 &&
            !isMatrix &&
            Config.keymapStyle !== "staggered"
          ) {
            hide = ` invisible`;
          }

          const keyElement = `<div class="keymapKey${hide}" data-key="${key.replace(
            '"',
            "&quot;"
          )}">
              <input type="text" maxlength="1" class="letter" value="${keyDisplay}" ${letterStyle}></input>
              ${bump ? "<div class='bump'></div>" : ""}
          </div>`;

          let splitSpacer = "";
          if (
            Config.keymapStyle === "split" ||
            Config.keymapStyle === "split_matrix" ||
            Config.keymapStyle === "alice" ||
            isSteno
          ) {
            if (row === "row4" && isSteno && (i === 0 || i === 2 || i === 4)) {
              splitSpacer += `<div class="keymapSplitSpacer"></div>`;
            } else if (
              row === "row4" &&
              (Config.keymapStyle === "split" ||
                Config.keymapStyle === "alice") &&
              isISO
            ) {
              if (i === 6) {
                splitSpacer += `<div class="keymapSplitSpacer"></div>`;
              }
            } else if (
              row === "row1" &&
              (Config.keymapStyle === "split" || Config.keymapStyle === "alice")
            ) {
              if (i === 7) {
                splitSpacer += `<div class="keymapSplitSpacer"></div>`;
              }
            } else if (row === "row4" && isMatrix && isISO) {
              if (i === 6) {
                splitSpacer += `<div class="keymapSplitSpacer"></div>`;
              }
            } else {
              if (i === 5) {
                splitSpacer += `<div class="keymapSplitSpacer"></div>`;
              }
            }
          }

          if (Config.keymapStyle === "alice" && row === "row4") {
            if ((isISO && i === 6) || (!isISO && i === 5)) {
              splitSpacer += `<div class="extraKey"><span class="letter"></span></div>`;
            }
          }

          rowElement += splitSpacer + keyElement;
        }
      }

      keymapElement += `<div class="row r${index + 1}">${rowElement}</div>`;
    }
    // );
    $(containerName).html(keymapElement);

    $(containerName).removeClass("staggered");
    $(containerName).removeClass("matrix");
    $(containerName).removeClass("split");
    $(containerName).removeClass("split_matrix");
    $(containerName).removeClass("alice");
    $(containerName).removeClass("steno");
    $(containerName).removeClass("steno_matrix");
    $(containerName).addClass(Config.keymapStyle);
  } catch (e) {
    if (e instanceof Error) {
      console.log(
        "something went wrong when changing layout, resettings: " + e.message
      );
      // UpdateConfig.setKeymapLayout("qwerty", true);
    }
  }
}

const settingsPage = document.querySelector("#pageSettings");

settingsPage
  ?.querySelector("#shareCustomThemeButton")
  ?.addEventListener("click", () => {
    ShareCustomThemeModal.show();
  });

void refresh(Config.layout, "#customKeymap")


settingsPage
  ?.querySelector(".section.updateCookiePreferences button")
  ?.addEventListener("click", () => {
    CookiesModal.show(true);
  });

settingsPage
  ?.querySelector(".section.presets")
  ?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("addPresetButton")) {
      EditPresetPopup.show("add");
    } else if (target.classList.contains("editButton")) {
      const presetid = target.parentElement?.getAttribute("data-id");
      const name = target.parentElement?.getAttribute("data-display");
      if (
        presetid === undefined ||
        name === undefined ||
        presetid === "" ||
        name === "" ||
        presetid === null ||
        name === null
      ) {
        Notifications.add(
          "Failed to edit preset: Could not find preset id or name",
          -1
        );
        return;
      }
      EditPresetPopup.show("edit", presetid, name);
    } else if (target.classList.contains("removeButton")) {
      const presetid = target.parentElement?.getAttribute("data-id");
      const name = target.parentElement?.getAttribute("data-display");
      if (
        presetid === undefined ||
        name === undefined ||
        presetid === "" ||
        name === "" ||
        presetid === null ||
        name === null
      ) {
        Notifications.add(
          "Failed to remove preset: Could not find preset id or name",
          -1
        );
        return;
      }
      EditPresetPopup.show("remove", presetid, name);
    }
  });

settingsPage?.querySelector(".section.tags")?.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (target.classList.contains("addTagButton")) {
    EditTagPopup.show("add");
  } else if (target.classList.contains("editButton")) {
    const tagid = target.parentElement?.getAttribute("data-id");
    const name = target.parentElement?.getAttribute("data-display");
    if (
      tagid === undefined ||
      name === undefined ||
      tagid === "" ||
      name === "" ||
      tagid === null ||
      name === null
    ) {
      Notifications.add(
        "Failed to edit tag: Could not find tag id or name",
        -1
      );
      return;
    }
    EditTagPopup.show("edit", tagid, name);
  } else if (target.classList.contains("clearPbButton")) {
    const tagid = target.parentElement?.getAttribute("data-id");
    const name = target.parentElement?.getAttribute("data-display");
    if (
      tagid === undefined ||
      name === undefined ||
      tagid === "" ||
      name === "" ||
      tagid === null ||
      name === null
    ) {
      Notifications.add(
        "Failed to clear tag PB: Could not find tag id or name",
        -1
      );
      return;
    }
    EditTagPopup.show("clearPb", tagid, name);
  } else if (target.classList.contains("removeButton")) {
    const tagid = target.parentElement?.getAttribute("data-id");
    const name = target.parentElement?.getAttribute("data-display");
    if (
      tagid === undefined ||
      name === undefined ||
      tagid === "" ||
      name === "" ||
      tagid === null ||
      name === null
    ) {
      Notifications.add(
        "Failed to remove tag: Could not find tag id or name",
        -1
      );
      return;
    }
    EditTagPopup.show("remove", tagid, name);
  }
});
