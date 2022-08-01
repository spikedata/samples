import { Grid, GridOptions } from "ag-grid-community";

// document.addEventListener("DOMContentLoaded", () => {
//   init("#myGrid");
// });

export interface Transaction {
  file: string;
  id: number;
  date: string;
  description: string[];
  amount: number;
}

class AmountRenderer {
  // init method gets the details of the cell to be renderer
  init(params) {
    const d = params.data;
    const amt = Rand(d.amount);
    this.eGui = document.createElement("span");
    if (d.amount < 0) {
      this.eGui.innerHTML = `<span class="text-red-600">${amt}</span>`;
    } else {
      this.eGui.innerHTML = `<span class="text-green-600">${amt}</span>`;
    }
  }

  getGui() {
    return this.eGui;
  }

  refresh(params) {
    return false;
  }
}

const columnDefs = [
  { field: "file", width: 160 },
  { field: "id", headerName: "#", width: 60 },
  {
    field: "date",
    width: 120,
    valueGetter(params) {
      const d = params.data;
      // console.log(d);
      return d.date.substring(0, 10);
    },
  },
  {
    field: "description",
    flex: 1,
    valueGetter(params) {
      const d = params.data;
      // console.log(d);
      return d.description.join(",");
    },
  },
  {
    field: "amount",
    width: 120,
    cellRenderer: AmountRenderer,
  },
  /*
  {
    field: "balance",
    width: 120,
    valueGetter(params) {
      const d = params.data;
      // console.log(d);
      return Rand(d.balance);
    },
  },
  */
];
const gridOptions: GridOptions = {
  columnDefs: columnDefs,

  defaultColDef: {
    sortable: true,
    // flex: 1,
    // minWidth: 100,
    filter: true,
    resizable: true,
  },

  // rowClassRules: {
  //   red: function (params) {
  //     return params.data.amount < 0;
  //   },
  //   green: function (params) {
  //     return params.data.amount > 0;
  //   },
  // },
};

export function render(sel) {
  const gridDiv = <HTMLElement>document.querySelector(sel);
  new Grid(gridDiv, gridOptions);
  update([]);
}

export function update(rows) {
  if (gridOptions.api) {
    gridOptions.api.setRowData(rows);
  }
}

export function destroy(): void {
  if (gridOptions.api) {
    gridOptions.api.destroy();
  }
}

export function Rand(num) {
  if (num === undefined) return "";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(num); // R 2 500,00
}
