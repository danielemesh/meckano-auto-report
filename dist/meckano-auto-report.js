function main() {
  const skipConfiguredDays = confirm("Skip configured days?\n\nDays with configured checkins and checkouts will be skipped.\nConfigured absences are skipped by default.");
  const tableRows = getRelevantTableRows();
  if (!tableRows) return;
  const dryRunData = composeDryRunData(tableRows, skipConfiguredDays);
  console.table(dryRunData, ["date", "checkIn", "checkOut", "totalHours"]);
  const applyChanges = confirm("Apply changes?\nCheckout the console output");
  if (applyChanges) {
    dryRunData.forEach((item) => {
      const checkInInput = document.getElementById(item.checkInId);
      const checkOutInput = document.getElementById(item.checkOutId);
      if (!checkInInput || !checkOutInput) return;
      checkInInput.value = item.checkIn;
      checkOutInput.value = item.checkOut;
    });
  }
}
function getRelevantTableRows() {
  const dialog = document.getElementById("freeReporting-dialog");
  if (!dialog) {
    alert('Could not find the "Fast edit" dialog.\nPlease click on the fast edit icon and try again');
    return;
  }
  const rows = Array.from(dialog.querySelectorAll("tr:not(.holiday-bg-row)"));
  rows.shift();
  return rows;
}
function getDateText(dateElement) {
  const dateText = dateElement.querySelector(".dateText");
  return (dateText == null ? void 0 : dateText.innerText) || "N/A";
}
function composeDryRunData(tableRows, skipConfiguredDays) {
  const dryRunData = [];
  tableRows.forEach((tableRow) => {
    const date = tableRow.querySelector("td.date") || null;
    if (!date) return;
    if (date.querySelector(".specialDayDescription:not(:empty)")) return;
    const absence = tableRow.querySelector(".select-box");
    if (absence && absence.value !== "0") return;
    const checkIn = tableRow.querySelector("input.checkIn");
    const checkOut = tableRow.querySelector("input.checkOut");
    if (!checkIn || !checkOut) return;
    if (skipConfiguredDays && (checkIn.value || checkOut.value)) return;
    const { checkInTime, checkOutTime, hoursDiff } = composeRandomizedTimeValues();
    const uuid = crypto.randomUUID();
    checkIn.id = `checkIn__${uuid}`;
    checkOut.id = `checkOut__${uuid}`;
    const dateText = getDateText(date);
    dryRunData.push({
      checkInId: checkIn.id,
      checkOutId: checkOut.id,
      date: dateText,
      checkIn: checkInTime,
      checkOut: checkOutTime,
      totalHours: hoursDiff
    });
  });
  return dryRunData;
}
function composeRandomizedTimeValues() {
  const checkInBaseTime = (/* @__PURE__ */ new Date("1/1/1970 08:30")).getTime();
  const checkOutBaseTime = (/* @__PURE__ */ new Date("1/1/1970 17:30")).getTime();
  const hoursDiff = /* @__PURE__ */ new Date("1/1/1970 00:00");
  const checkInMillisToAdd = Math.round(Math.random() * 60 * 60 * 1e3);
  const checkOutMillisToAdd = Math.round(Math.random() * 60 * 60 * 1e3) + checkInMillisToAdd;
  const checkInRandomDate = /* @__PURE__ */ new Date();
  const checkOutRandomDate = /* @__PURE__ */ new Date();
  checkInRandomDate.setTime(checkInBaseTime + checkInMillisToAdd);
  checkOutRandomDate.setTime(checkOutBaseTime + checkOutMillisToAdd);
  const totalHoursInMillis = checkOutRandomDate.getTime() - checkInRandomDate.getTime();
  hoursDiff.setTime(hoursDiff.getTime() + totalHoursInMillis);
  const dtf = new Intl.DateTimeFormat(void 0, { timeStyle: "short", hour12: false });
  return {
    checkInTime: dtf.format(checkInRandomDate),
    checkOutTime: dtf.format(checkOutRandomDate),
    hoursDiff: dtf.format(hoursDiff)
  };
}
function applyToAllAbsence(absenceId = "66952") {
  const tableRows = getRelevantTableRows();
  if (!tableRows) return;
  tableRows.forEach((tableRow) => {
    const date = tableRow.querySelector("td.date") || null;
    if (!date) return;
    if (date.querySelector(".specialDayDescription:not(:empty)")) return;
    const absence = tableRow.querySelector(".select-box");
    if (!absence) return;
    if (absence.value !== "0") return;
    absence.value = absenceId;
  });
}
window.runMeckanoAutoReport = main;
window.applyToAllAbsence = applyToAllAbsence;
