<template>
  <div class="p-6 max-w-5xl min-h-screen m-auto bg-white flex flex-col space-y-6">
    <h1 class="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
      Upload a pdf
    </h1>
    <div class="text-sm">
      note: this demo uses <span class="underline font-bold">/pdftest</span> which only extracts the 1st 10 transactions
    </div>

    <!-- drag n drop -->
    <div class="px-4 py-8 sm:px-0">
      <div
        class="flex flex-col items-center justify-center gap-1 border-4 border-dashed border-gray-200 rounded-lg h-48"
        :class="hover ? 'bg-gray-300' : ''"
        id="drop-area"
      >
        <p> Drag and drop files here, or click the button below to pick files </p>
        <input type="file" id="fileElem" class="hidden" multiple accept="application/pdf" />
        <label
          class="px-6 py-3 w-40 bg-blue-600 rounded-md text-white font-medium tracking-wide hover:bg-blue-500"
          for="fileElem"
        >
          Choose files
        </label>
      </div>
    </div>

    <!-- files grid -->
    <div v-if="_allFiles.length">
      <h2 class="text-2xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-2xl sm:leading-10"> Files </h2>
      <div class="flex flex-col">
        <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-blue-600">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      File
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      State
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Parser
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Error
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="u in _allFiles" :key="u.requestId">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">
                        {{ u.filename }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">
                        {{ u.state }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">
                        <a
                          v-if="_allResults[u.requestId] && _allResults[u.requestId].data?.parser"
                          :href="parserUrl(_allResults[u.requestId].data)"
                          target="_blank"
                          class="text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          {{ _allResults[u.requestId].data.parser }}
                        </a>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">
                        <a
                          href="https://docs.spikedata.co.za/user-guides/app/web-converter/understand-the-results/#type"
                          target="_blank"
                        >
                          <LibraryIconOutline
                            v-if="
                              _allResults[u.requestId] &&
                              _allResults[u.requestId].data?.type === PdfDataType.BankStatementNoBalance
                            "
                            class="h-4 w-4 text-blue-600 focus:outline-none"
                            aria-hidden="true"
                          />
                          <LibraryIconSolid
                            v-if="
                              _allResults[u.requestId] &&
                              _allResults[u.requestId].data?.type === PdfDataType.BankStatementNormal
                            "
                            class="h-4 w-4 text-blue-600 focus:outline-none"
                            aria-hidden="true"
                          />
                          <CreditCardIconOutline
                            v-if="
                              _allResults[u.requestId] &&
                              _allResults[u.requestId].data?.type === PdfDataType.CreditCardSimple
                            "
                            class="h-4 w-4 text-orange-600 focus:outline-none"
                            aria-hidden="true"
                          />
                          <CreditCardIconSolid
                            v-if="
                              _allResults[u.requestId] &&
                              _allResults[u.requestId].data?.type === PdfDataType.CreditCardBreakdown
                            "
                            class="h-4 w-4 text-orange-600 focus:outline-none"
                            aria-hidden="true"
                          />
                          <CreditCardIconSolid
                            v-if="
                              _allResults[u.requestId] &&
                              _allResults[u.requestId].data?.type === PdfDataType.CreditCardBreakdownMultiUser
                            "
                            class="h-4 w-4 text-orange-600 focus:outline-none"
                            aria-hidden="true"
                          />
                        </a>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">
                        <a
                          v-if="_allResults[u.requestId]?.type === TYPES.ERROR"
                          :href="getApiErrorCodeUrl(_allResults[u.requestId].code)"
                          target="_blank"
                          class="text-red-600 hover:text-red-900"
                        >
                          {{ displayCode(_allResults[u.requestId].code) }}
                        </a>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- transactions grid -->
    <div>
      <h2 class="text-2xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-2xl sm:leading-10">
        Transactions
      </h2>
      <div id="myGrid" style="w-full; height: 600px" class="ag-theme-alpine"></div>
    </div>
  </div>
  <ModalInvalidPdf ref="modalInvalidPdf" />
  <ModalPassRequired ref="modalPassRequired" />
  <ModalPassIncorrect ref="modalPassIncorrect" />
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { CreditCardIcon as CreditCardIconOutline, LibraryIcon as LibraryIconOutline } from "@heroicons/vue/outline";
import { CreditCardIcon as CreditCardIconSolid, LibraryIcon as LibraryIconSolid } from "@heroicons/vue/solid";
import { TYPES } from "@spike/api-statements/src/constants.js";
import { CommonStatement, PdfDataType } from "@spike/api-statements/src/response.js";
import { ref, onMounted, reactive, nextTick } from "vue";
import ModalInvalidPdf from "../components/converter/ModalInvalidPdf.vue";
import ModalPassRequired from "../components/converter/ModalPassRequired.vue";
import ModalPassIncorrect from "../components/converter/ModalPassIncorrect.vue";
import * as MainGrid from "../components/mainGrid";
import * as SpikePdf from "../lib/spikePdf";
import DropArea from "../lib/dropArea";
import { TOKEN } from "../config";

onMounted(() => {
  MainGrid.render("#myGrid");
  initDropZone();
});

//#region state

enum State {
  pending = "pending",
  cancelled = "cancelled",
  uploading = "uploading",
  success = "success",
  fail = "fail",
}

interface PdfFile {
  id: number;
  filename: string;
  buffer: string;
  password?: string;
  state: State;
  requestId?: string;
}

const ApiErrorUrl = "https://docs.spikedata.co.za/product/support/errors/codes/{code}/";

function getApiErrorCodeUrl(code) {
  return ApiErrorUrl.replace("{code}", code);
}

function displayCode(code) {
  return basename(code);
}

function basename(code: string): string {
  // HACK: use own implementation, not node:path in order to ensure code works in vite
  // otherwise we need path-browserify => https://dev.to/0xbf/vite-module-path-has-been-externalized-for-browser-compatibility-2bo6

  // read backwards to last slash
  // nb not correct for linux paths with windows slashes in name or vice versa
  const lastUnixSlash = code.lastIndexOf("/");
  if (lastUnixSlash !== -1) {
    return code.slice(lastUnixSlash + 1);
  }
  return code;
}

function parserUrl(responseData: CommonStatement) {
  let anchor = responseData.parser.replace(/_/g, "-").toLowerCase();
  if (
    responseData.type === PdfDataType.BankStatementNoBalance ||
    responseData.type === PdfDataType.BankStatementNormal
  ) {
    return `https://docs.spikedata.co.za/statements/debit/#${anchor}`;
  } else {
    // CreditCardBreakdown, CreditCardSimple
    return `https://docs.spikedata.co.za/statements/credit/#${anchor}`;
  }
}

function result(id: number, response: SpikePdf.ApiResult) {
  const file = _allFiles.find((x) => x.id === id);
  if (!file) {
    console.error("can't find file: " + id);
    return;
  }

  // update file
  let { requestId } = response;
  file.requestId = requestId;
  if (response.type === "localError") {
    file.state = State.fail;
  } else {
    if (response.type === TYPES.SUCCESS) {
      file.state = State.success;
    } else {
      file.state = State.fail;
    }
  }

  // results
  _allResults[requestId] = response;
  _requestIdToFile[requestId] = file;

  // transactions
  if (response.type === TYPES.SUCCESS && response.data?.transactions?.length) {
    updateTransactions();
  }
}

function updateTransactions() {
  _transactions = Object.values(_allResults)
    .filter((response) => response.data?.transactions?.length)
    .map((response) => {
      const requestId = response.requestId;
      const file = _requestIdToFile[requestId]?.filename;
      return response.data?.transactions.map((t) => {
        const { id, date, description, amount } = t;
        return {
          file,
          id,
          date,
          description,
          amount,
        } as MainGrid.Transaction;
      });
    })
    .flat();
  console.log(_transactions);

  setTimeout(() => {
    MainGrid.update(_transactions);
  }, 100);
}

const _allFiles = reactive<PdfFile[]>([]);
const _requestIdToFile: Record<string, PdfFile> = {};
const _allResults = reactive<Record<string, SpikePdf.ApiResult>>({});
let _allFilesSeed = _allFiles.length;
let _transactions: MainGrid.Transaction[] = [];

function addFile(obj) {
  obj.id = ++_allFilesSeed;
  _allFiles.push(obj);
}

//#endregion

//#region drag-n-drop

const hover = ref(false);

function initDropZone() {
  new DropArea("drop-area", onDrop, onHover, onUnhover);
  document?.getElementById("fileElem")?.addEventListener("change", onChoosePdfs, false);
}

function onDrop(files: FileList) {
  // console.log("onDrop");
  handleFiles(files);
}

function onHover() {
  // console.log("onHover");
  hover.value = true;
}

function onUnhover() {
  // console.log("onUnhover");
  hover.value = false;
}

function onChoosePdfs(e) {
  handleFiles(e.target.files);
}

async function handleFiles(list: FileList) {
  //@ts-ignore
  const files = [...list];
  let i = 0;
  for (let file of files) {
    await readFile(i++, file);
  }
  uploadPending();
}

function readFile(i, file) {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = async function (event) {
      if (!event.target) {
        console.error(`couldn't read file ${file.name}`);
        return reject();
      }
      const base64Txt = (event.target.result as string).replace(/^data:application\/pdf;base64,/, "");
      await addPdf(i, file, base64Txt);
      resolve(); // don't bother with reject() - errors already handled by addPdf()
    };
    reader.readAsDataURL(file);
  });
}

const allPriorSuccessfulPasswords = new Set<string>();
enum PrevPasswordCheckResult {
  notEncrypted,
  invalid,
  found,
  notFound,
  unexpected,
}

async function tryNoPasswordOrPreviousPasswords(base64Txt) {
  // check notEncrypted
  let passwordCheck = await SpikePdf.isEncrypted(base64Txt, undefined);
  switch (passwordCheck) {
    case SpikePdf.PasswordCheck.NotEncrypted:
      return { result: PrevPasswordCheckResult.notEncrypted };
    case SpikePdf.PasswordCheck.InvalidPdf:
      return { result: PrevPasswordCheckResult.invalid };
    case SpikePdf.PasswordCheck.CheckFailed:
    case SpikePdf.PasswordCheck.PasswordCorrect:
    case SpikePdf.PasswordCheck.PasswordIncorrect:
      return { result: PrevPasswordCheckResult.unexpected, passwordCheck };
    case SpikePdf.PasswordCheck.PasswordRequired:
      // try next prev password below
      break;
    default:
      return { result: PrevPasswordCheckResult.unexpected, passwordCheck };
  }

  // PasswordRequired - check prev
  const prev = [...allPriorSuccessfulPasswords];
  for (let prevPassword of prev) {
    passwordCheck = await SpikePdf.isEncrypted(base64Txt, prevPassword);
    switch (passwordCheck) {
      case SpikePdf.PasswordCheck.InvalidPdf:
      case SpikePdf.PasswordCheck.NotEncrypted:
      case SpikePdf.PasswordCheck.CheckFailed:
        return { result: PrevPasswordCheckResult.unexpected, passwordCheck };
      case SpikePdf.PasswordCheck.PasswordCorrect:
        // found prev password
        return { result: PrevPasswordCheckResult.found, passwordCheck, prevPassword };
      case SpikePdf.PasswordCheck.PasswordRequired:
      case SpikePdf.PasswordCheck.PasswordIncorrect:
        // try next prev password
        continue;
      default:
        return { result: PrevPasswordCheckResult.unexpected, passwordCheck };
    }
  }
  return { result: PrevPasswordCheckResult.notFound };
}

const modalPassRequired = ref(null);
const modalPassIncorrect = ref(null);
const modalInvalidPdf = ref(null);

async function addPdf(i, file, base64Txt) {
  // console.log(`${i} ${file.name}`);
  // console.log(`uploading ${file.name}: POST ${UploadUrl} ...`);
  // const res = await proxy(base64Txt, file.name, _pass);
  const obj = {
    filename: file.name,
    password: null,
    state: State.pending,
    buffer: base64Txt,
    requestId: "",
    // requestId: "18e1425c-46ad-4a71-8269-5582c563edb1",
  };

  // try previous passwords
  let t = await tryNoPasswordOrPreviousPasswords(base64Txt);
  switch (t.result) {
    case PrevPasswordCheckResult.notEncrypted:
      addFile(obj);
      return;
    case PrevPasswordCheckResult.invalid:
      await modalInvalidPdf.value.show(file.name);
      return;
    case PrevPasswordCheckResult.found:
      // console.log("re-use pass");
      obj.password = t.prevPassword;
      addFile(obj);
      return;
    case PrevPasswordCheckResult.notFound:
      // let user enter pass below
      break;
    case PrevPasswordCheckResult.unexpected:
      alert("PrevPasswordCheckResult unexpected result: " + t.passwordCheck);
      return;
    default:
      alert("code out of date: PrevPasswordCheckResult: " + t.result);
      return;
  }

  // PasswordRequired and not one of the prev passwords
  let { result, password } = await modalPassRequired.value.show(file.name);
  if (result === 2) {
    // console.log("skip:", file.name);
    return;
  }

  // loop - in case user needs multiple attempts to enter correct password
  do {
    let passwordCheck = await SpikePdf.isEncrypted(base64Txt, password);
    switch (passwordCheck) {
      // unexpected
      case SpikePdf.PasswordCheck.NotEncrypted:
      case SpikePdf.PasswordCheck.InvalidPdf:
      case SpikePdf.PasswordCheck.PasswordRequired:
      case SpikePdf.PasswordCheck.CheckFailed:
        alert("PasswordCheck unexpected result: " + passwordCheck);
        return;

      // correct
      case SpikePdf.PasswordCheck.PasswordCorrect:
        allPriorSuccessfulPasswords.add(password);
        obj.password = password;
        addFile(obj);
        return;

      // incorrect
      case SpikePdf.PasswordCheck.PasswordIncorrect:
        ({ result, password } = await modalPassIncorrect.value.show(file.name));
        if (result === 2) {
          // console.log("skip:", file.name);
          return;
        }
        break; // try again

      default:
        alert("code out of date with PasswordCheck: " + passwordCheck);
        return;
    }
  } while (true);
}

//#endregion

//#region convert pdf

let uploadInProgress = false;
async function uploadPending() {
  let p;
  try {
    if (uploadInProgress) {
      // handle re-entrant code (i.e. drag n drop files #1, then drag n drop files #2 whilst uploadInProgress)
      return;
    }
    uploadInProgress = true;
    let pending = _allFiles.filter((x) => x.state === State.pending);
    while (pending.length) {
      p = pending[0];
      p.state = State.uploading;
      let spikeResponse = await SpikePdf.request(TOKEN, p.buffer, p.filename, p.password);
      result(p.id, spikeResponse);

      // render - update _allFiles grid for the pdf we just uploaded
      await nextTick();

      pending = _allFiles.filter((x) => x.state === State.pending);
    }
  } catch (e) {
    console.error("upload exception:", p?.filename, e);
  } finally {
    uploadInProgress = false;
  }
}

//#endregion
</script>
