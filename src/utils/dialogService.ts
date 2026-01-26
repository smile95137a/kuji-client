// src/utils/dialogService.ts
export type { DialogController } from './dialog/createDialog';
export type { DialogOptions as InfoDialogOptions } from './dialog/infoDialog';
export type { DialogOptions as ConfirmDialogOptions } from './dialog/confirmDialog';
export type { ObjDialogOptions } from './dialog/objDialog';

export { openInfoDialog, infoDialog } from './dialog/infoDialog';

export { openConfirmDialog, confirmDialog } from './dialog/confirmDialog';

export { objDialog } from './dialog/objDialog';
