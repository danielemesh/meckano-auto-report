const dialog = document.getElementById('freeReporting-dialog');
const rows = Array.from(dialog.querySelectorAll('tr:not(.holiday-bg-row)'));
rows.shift();

const OVERRIDE_EXISTING_DATA = confirm('Override existing data?\nFilled inputs will be overridden');

/**
 * @type {{checkIn: string; checkInId: string; checkOutId: string; date: string; checkIn: string; checkOut: string; totalHours}[]} items - An array of items to process.
 */
const dryRunData = [];

rows.forEach((row) => {
  const date = row.querySelector('td.date');
  const checkIn = row.querySelector('input.checkIn');
  const checkOut = row.querySelector('input.checkOut');
  const missing = row.querySelector('.select-box');

  if (!date) return;

  if (date.querySelector('.specialDayDescription:not(:empty)')) {
    return;
  }

  if (missing && missing.value !== '0') {
    return;
  }

  if (checkIn && OVERRIDE_EXISTING_DATA) {
    const { checkInTime, checkOutTime, hoursDiff } = getRandomCheckInTime();

    const uuid = crypto.randomUUID();

    checkIn.id = `checkIn__${uuid}`;
    checkOut.id = `checkOut__${uuid}`;

    dryRunData.push({
      checkInId: checkIn.id,
      checkOutId: checkOut.id,
      date: date.querySelector('.dateText').innerText,
      checkIn: checkInTime,
      checkOut: checkOutTime,
      totalHours: hoursDiff
    });
  }
});


function getRandomCheckInTime() {
  const checkInTime = new Date('1/1/1970 08:30').getTime();
  const checkOutTime = new Date('1/1/1970 17:30').getTime();
  const diffTime = new Date('1/1/1970 00:00');

  const checkInMinutesToAdd = Math.round(Math.random() * 60 * 60 * 1000);
  const checkoutTimeToAdd = Math.round(Math.random() * 60 * 60 * 1000) + checkInMinutesToAdd;

  const checkIn = new Date();
  const checkOut = new Date();

  checkIn.setTime(checkInTime + checkInMinutesToAdd);
  checkOut.setTime(checkOutTime + checkoutTimeToAdd);
  diffTime.setTime(diffTime.getTime() + (checkOut - checkIn));

  const dtf = new Intl.DateTimeFormat(undefined, { timeStyle: 'short', hour12: false });

  return {
    checkInTime: dtf.format(checkIn),
    checkOutTime: dtf.format(checkOut),
    hoursDiff: dtf.format(diffTime)
  };
}

console.table(dryRunData, ['date', 'checkIn', 'checkOut', 'totalHours']);

const applyChanges = confirm(`Apply changes?
Checkout the console output`);

if (applyChanges) {
  dryRunData.forEach((item) => {
    document.getElementById(item.checkInId).value = item.checkIn;
    document.getElementById(item.checkOutId).value = item.checkOut;
  });
}