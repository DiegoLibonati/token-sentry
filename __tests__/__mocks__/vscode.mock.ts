// --- window ---
const mockShowInformationMessage = jest.fn();
const mockShowWarningMessage = jest.fn();
const mockShowErrorMessage = jest.fn();
const mockShowInputBox = jest.fn();
const mockShowQuickPick = jest.fn();
const mockCreateOutputChannelAppendLine = jest.fn();
const mockCreateOutputChannelAppend = jest.fn();
const mockCreateOutputChannelClear = jest.fn();
const mockCreateOutputChannelShow = jest.fn();
const mockCreateOutputChannelHide = jest.fn();
const mockCreateOutputChannelDispose = jest.fn();

const mockCreateOutputChannel = jest.fn(() => ({
  appendLine: mockCreateOutputChannelAppendLine,
  append: mockCreateOutputChannelAppend,
  clear: mockCreateOutputChannelClear,
  show: mockCreateOutputChannelShow,
  hide: mockCreateOutputChannelHide,
  dispose: mockCreateOutputChannelDispose,
}));

export const window = {
  showInformationMessage: mockShowInformationMessage,
  showWarningMessage: mockShowWarningMessage,
  showErrorMessage: mockShowErrorMessage,
  showInputBox: mockShowInputBox,
  showQuickPick: mockShowQuickPick,
  createOutputChannel: mockCreateOutputChannel,
};

// --- commands ---
const mockRegisterCommand = jest.fn();
const mockExecuteCommand = jest.fn();

export const commands = {
  registerCommand: mockRegisterCommand,
  executeCommand: mockExecuteCommand,
};

// --- workspace ---
const mockGetConfigurationGet = jest.fn();
const mockGetConfigurationHas = jest.fn();
const mockGetConfigurationUpdate = jest.fn();
const mockGetConfigurationInspect = jest.fn();

const mockGetConfiguration = jest.fn(() => ({
  get: mockGetConfigurationGet,
  has: mockGetConfigurationHas,
  update: mockGetConfigurationUpdate,
  inspect: mockGetConfigurationInspect,
}));

const mockOnDidChangeConfiguration = jest.fn();

const mockWorkspaceGetWorkspaceFolder = jest.fn();

export const workspace = {
  getConfiguration: mockGetConfiguration,
  workspaceFolders: undefined as undefined | { uri: { fsPath: string } }[],
  getWorkspaceFolder: mockWorkspaceGetWorkspaceFolder,
  onDidChangeConfiguration: mockOnDidChangeConfiguration,
};

// --- Uri ---
export const Uri = {
  file: jest.fn((path: string) => ({ fsPath: path, scheme: "file", path })),
  parse: jest.fn((value: string) => ({
    fsPath: value,
    scheme: "file",
    path: value,
  })),
  joinPath: jest.fn((base: { fsPath: string }, ...parts: string[]) => ({
    fsPath: [base.fsPath, ...parts].join("/"),
    scheme: "file",
    path: [base.fsPath, ...parts].join("/"),
  })),
};
