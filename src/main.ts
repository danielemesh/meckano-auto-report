interface Row {
  checkIn: string;
  checkInId: string;
  checkOutId: string;
  date: string;
  checkOut: string;
  totalHours: string;
}

function main() {
  const skipConfiguredDays = confirm('Skip configured days?\n\nDays with configured checkins and checkouts will be skipped.\nConfigured absences are skipped by default.');

  const tableRows = getRelevantTableRows();

  if (!tableRows) return;

  const dryRunData = composeDryRunData(tableRows, skipConfiguredDays);

  console.table(dryRunData, ['date', 'checkIn', 'checkOut', 'totalHours']);

  const applyChanges = confirm('Apply changes?\nCheckout the console output');

  if (applyChanges) {
    dryRunData.forEach((item) => {
      const checkInInput = document.getElementById(item.checkInId) as HTMLInputElement | null;
      const checkOutInput = document.getElementById(item.checkOutId) as HTMLInputElement | null;

      if (!checkInInput || !checkOutInput) return;

      checkInInput.value = item.checkIn;
      checkOutInput.value = item.checkOut;
    });
  }
}

function getRelevantTableRows() {
  const dialog = document.getElementById('freeReporting-dialog');

  if (!dialog) {
    alert('Could not find the "Fast edit" dialog.\nPlease click on the fast edit icon and try again');
    return;
  }

  const rows = Array.from(dialog.querySelectorAll('tr:not(.holiday-bg-row)'));

  // Remove the first row is since it's the header
  rows.shift();

  return rows;
}

function composeDryRunData(tableRows: Element[], skipConfiguredDays: boolean) {
  const dryRunData: Row[] = [];

  tableRows.forEach((tableRow) => {
    const date = tableRow.querySelector('td.date') as HTMLTableCellElement || null;

    if (!date) return;

    // Skip special event days (Holiday, Holiday Eve)
    if (date.querySelector('.specialDayDescription:not(:empty)')) return;

    const absence = tableRow.querySelector('.select-box') as HTMLSelectElement | null;

    // Skip days with configured absence
    if (absence && absence.value !== '0') return;

    const checkIn = tableRow.querySelector('input.checkIn') as HTMLInputElement | null;
    const checkOut = tableRow.querySelector('input.checkOut') as HTMLInputElement | null;

    if (!checkIn || !checkOut) return;

    if (skipConfiguredDays && (checkIn.value || checkOut.value)) return;

    const {checkInTime, checkOutTime, hoursDiff} = composeRandomizedTimeValues();

    const uuid = crypto.randomUUID();

    // Inject ids so we could later reference the inputs and apply the changes
    checkIn.id = `checkIn__${uuid}`;
    checkOut.id = `checkOut__${uuid}`;

    const dateText = (date.querySelector('.dateText') as HTMLElement | null)?.innerText || 'N/A'

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
  const checkInBaseTime = new Date('1/1/1970 08:30').getTime(); // Use 08:30 as the base check-in time
  const checkOutBaseTime = new Date('1/1/1970 17:30').getTime(); // Use 17:30 as the base check-out time
  const hoursDiff = new Date('1/1/1970 00:00'); // Used for calculating the total number of hours

  const checkInMillisToAdd = Math.round(Math.random() * 60 * 60 * 1000);
  const checkOutMillisToAdd = Math.round(Math.random() * 60 * 60 * 1000) + checkInMillisToAdd;

  const checkInRandomDate = new Date();
  const checkOutRandomDate = new Date();

  checkInRandomDate.setTime(checkInBaseTime + checkInMillisToAdd);
  checkOutRandomDate.setTime(checkOutBaseTime + checkOutMillisToAdd);

  // Calculate total number of hours
  const totalHoursInMillis = checkOutRandomDate.getTime() - checkInRandomDate.getTime()
  hoursDiff.setTime(hoursDiff.getTime() + totalHoursInMillis);

  const dtf = new Intl.DateTimeFormat(undefined, {timeStyle: 'short', hour12: false});

  return {
    checkInTime: dtf.format(checkInRandomDate),
    checkOutTime: dtf.format(checkOutRandomDate),
    hoursDiff: dtf.format(hoursDiff)
  };
}

window.runMeckanoAutoReport = main;

declare global {
  interface Window {
    runMeckanoAutoReport: typeof main

  }
}

