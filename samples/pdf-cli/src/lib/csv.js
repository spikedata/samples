/* eslint-disable quotes */
const fs = require("fs");
const dateExt = require("./dateExt");
const Sort = require("./sort");

exports.objectArrayToCsvHeaders = function (rows) {
  // NOTE: union cols from all rows. Using first row cols will exclude missing cols e.g. row[0].amount = undefined
  let cols = [];
  rows.forEach(function (t) {
    const currentCols = Object.keys(t);
    cols = [...new Set(cols.concat(currentCols))]; // merge unique
  });
  return cols;
};

exports.objectArrayToCsvRows = function (rows, cols = undefined, truncateDateTime = false, quoted = false) {
  // col headers
  if (!cols) {
    cols = exports.objectArrayToCsvHeaders(rows);
  }

  const csvRows = [];

  // header row
  let header;
  if (quoted) {
    // quotes inside cell must be escaped as ""
    header = cols.map((x) => `"${x.replace(/\"/g, '""')}"`).join(",");
  } else {
    header = `"${cols.join('","')}"`;
  }
  csvRows.push(header);

  // rows
  rows.forEach(function (t) {
    let comma = "";
    let csvRow = "";
    cols.forEach(function (c) {
      let x = t[c];
      // if (c === "numDebug") {
      //   debugger;
      // }
      if (x === undefined || x === null) {
        x = "";
      } else if (Array.isArray(x)) {
        x = x.join("\n");
      } else if (x instanceof Date) {
        x = isNaN(+x) ? "NaN" : x.toISOString();
        if (truncateDateTime) {
          // remove time: '2018-07-10T23:16:36.715Z' => '2018-07-10'
          x = x.substr(0, 10);
        }
      } else if (truncateDateTime && dateExt.isIsoDateString(x)) {
        // remove time: '2018-07-10T23:16:36.715Z' => '2018-07-10'
        x = x.substr(0, 10);
      }
      // NOTE: ATM all body cells are quoted even if quoted=false
      // quotes inside cell must be escaped as ""
      csvRow += `${comma}"${x ? x.toString().replace(/\"/g, '""') : x}"`;
      comma = ",";
    });
    csvRows.push(csvRow);
  });
  return csvRows;
};

// create .csv from array of objects
exports.csvBuffer = function (
  rows,
  cols = undefined,
  truncateDateTime = false,
  quoted = false,
  sort = undefined, // name of column to sort by
  sortOrder = Sort.SortOrder.ASC
) {
  if (!rows || rows.length === 0) {
    const buffer = "";
    return buffer;
  }

  if (sort) {
    const header = rows.shift();
    rows = Sort.fuzzySort(rows, sort, sortOrder);
    rows.unshift(header);
  }
  const csvRows = exports.objectArrayToCsvRows(rows, cols, truncateDateTime, quoted);
  const buffer = csvRows.join("\n");
  return buffer;
};

exports.writeCsv = function (
  path,
  rows,
  cols = undefined,
  truncateDateTime = false,
  quoted = false,
  sort = undefined, // name of column to sort by
  sortOrder = Sort.SortOrder.ASC
) {
  const buffer = exports.csvBuffer(rows, cols, truncateDateTime, quoted, sort, sortOrder);
  fs.writeFileSync(path, buffer);
  return buffer;
};

exports.csvRowsToObjectArray = function (rows, hasHeader = true, cols = undefined) {
  if (!hasHeader && !cols) {
    throw new Error("must supply cols if not in header");
  }

  if (!cols && hasHeader) {
    // read cols from header row
    const header = rows[0];
    cols = header.substr(1, header.length - 2).split('","'); // assumes it's quoted
  }

  let r = hasHeader ? 1 : 0;
  const objArr = [];
  for (; r < rows.length; ++r) {
    const row = rows[r];
    if (!row || row === '""') {
      continue;
    }
    const obj = {};
    const cells = row.substr(1, row.length - 2).split('","'); // assumes it's quoted
    for (let c = 0; c < cols.length; ++c) {
      const val = cells[c];
      // if (cols[c] === "detected") {
      //   debugger;
      // }
      // undefined values will be written as "" in quoted .csvs
      // NOTE: keep changes in sync with deserialize() functions e.g. pdfResult.deserialize()
      obj[cols[c]] = val === "" ? undefined : val;
    }
    objArr.push(obj);
  }

  return objArr;
};

// NOTE:
//  - this function only works with csv's that use quoted cells (to handle \n's in cells)
//  - it handles any EOL though (i.e.\n or \r\n or mixed)
exports.readCsv = function (csvPath) {
  const allText = fs.readFileSync(csvPath, "utf8");
  const rows = splitQuotedCsvIntoRows(csvPath, allText);
  if (rows.length === 0) {
    return [];
  }
  return exports.csvRowsToObjectArray(rows, true);
};

function splitQuotedCsvIntoRows(csvPath, allText) {
  // This function exists to handle the case where there might be \n's within a cell on a row
  let rows = allText.split("\n");
  if (rows.length < 2) {
    console.error("csv does not have a header row:", csvPath);
    process.exit(-1);
  }
  // strip \r if CRLF \r\n was used
  rows = rows.map((x) => (x.endsWith("\r") ? x.substr(0, x.length - 1) : x));

  // join rows which span multiple lines - i.e. quoted text with \n's
  const joined = [];
  let cur = undefined;

  function startLine(r) {
    // "one","two",...
    // "" <= special case = empty line
    return r && r[0] === '"' && (r.length > 2 || r[1] !== '"');
  }

  function endLine(r) {
    // handle special case = end with blank column e.g.
    // "one","two"
    // "1","2"
    // "1","" <= special case
    return r && r[r.length - 1] === '"' && (r[r.length - 2] !== '"' || r[r.length - 3] === ",");
  }

  for (const r of rows) {
    const start = startLine(r);
    const end = endLine(r);
    if (start && end) {
      // full row on single line
      joined.push(r);
    } else if (start) {
      // assert(cur === undefined)
      cur = r;
    } else if (end) {
      // last row of multi line
      cur = cur ? cur + "\n" + r : r;
      joined.push(cur);
      cur = undefined;
    } else {
      // assert(cur)
      cur = cur + "\n" + r;
    }
  }

  return joined;
}
