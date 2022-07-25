import { Grid, GridOptions } from "ag-grid-community";

const columnDefs = [{ field: "make" }, { field: "model" }, { field: "price" }];

const rowData = [
  { make: "Toyota", model: "Celica", price: 35000 },
  { make: "Ford", model: "Mondeo", price: 32000 },
  { make: "Porsche", model: "Boxter", price: 72000 },
];

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  rowData: rowData,
};

// document.addEventListener("DOMContentLoaded", () => {
//   init("#myGrid");
// });

export function init(sel) {
  const gridDiv = <HTMLElement>document.querySelector(sel);
  new Grid(gridDiv, gridOptions);
}
