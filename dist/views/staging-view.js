"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _eventKit = require("event-kit");

var _electron = require("electron");

var _atom = require("atom");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _path = _interopRequireDefault(require("path"));

var _propTypes2 = require("../prop-types");

var _filePatchListItemView = _interopRequireDefault(require("./file-patch-list-item-view"));

var _observeModel = _interopRequireDefault(require("./observe-model"));

var _mergeConflictListItemView = _interopRequireDefault(require("./merge-conflict-list-item-view"));

var _compositeListSelection = _interopRequireDefault(require("../models/composite-list-selection"));

var _resolutionProgress = _interopRequireDefault(require("../models/conflicts/resolution-progress"));

var _commitView = _interopRequireDefault(require("./commit-view"));

var _refHolder = _interopRequireDefault(require("../models/ref-holder"));

var _changedFileItem = _interopRequireDefault(require("../items/changed-file-item"));

var _commands = _interopRequireWildcard(require("../atom/commands"));

var _helpers = require("../helpers");

var _reporterProxy = require("../reporter-proxy");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const {
  Menu,
  MenuItem
} = _electron.remote;

const debounce = (fn, wait) => {
  let timeout;
  return (...args) => {
    return new Promise(resolve => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        resolve(fn(...args));
      }, wait);
    });
  };
};

function calculateTruncatedLists(lists) {
  return Object.keys(lists).reduce((acc, key) => {
    const list = lists[key];
    acc.source[key] = list;

    if (list.length <= MAXIMUM_LISTED_ENTRIES) {
      acc[key] = list;
    } else {
      acc[key] = list.slice(0, MAXIMUM_LISTED_ENTRIES);
    }

    return acc;
  }, {
    source: {}
  });
}

const noop = () => {};

const MAXIMUM_LISTED_ENTRIES = 1000;

class StagingView extends _react.default.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "undoLastDiscardFromCoreUndo", () => {
      this.undoLastDiscard({
        eventSource: {
          command: 'core:undo'
        }
      });
    });

    _defineProperty(this, "undoLastDiscardFromCommand", () => {
      this.undoLastDiscard({
        eventSource: {
          command: 'github:undo-last-discard-in-git-tab'
        }
      });
    });

    _defineProperty(this, "undoLastDiscardFromButton", () => {
      this.undoLastDiscard({
        eventSource: 'button'
      });
    });

    _defineProperty(this, "undoLastDiscardFromHeaderMenu", () => {
      this.undoLastDiscard({
        eventSource: 'header-menu'
      });
    });

    _defineProperty(this, "discardChangesFromCommand", () => {
      this.discardChanges({
        eventSource: {
          command: 'github:discard-changes-in-selected-files'
        }
      });
    });

    _defineProperty(this, "discardAllFromCommand", () => {
      this.discardAll({
        eventSource: {
          command: 'github:discard-all-changes'
        }
      });
    });

    _defineProperty(this, "confirmSelectedItems", async () => {
      const itemPaths = this.getSelectedItemFilePaths();
      await this.props.attemptFileStageOperation(itemPaths, this.state.selection.getActiveListKey());
      await new Promise(resolve => {
        this.setState(prevState => ({
          selection: prevState.selection.coalesce()
        }), resolve);
      });
    });

    (0, _helpers.autobind)(this, 'dblclickOnItem', 'contextMenuOnItem', 'mousedownOnItem', 'mousemoveOnItem', 'mouseup', 'registerItemElement', 'renderBody', 'openFile', 'discardChanges', 'activateNextList', 'activatePreviousList', 'activateLastList', 'stageAll', 'unstageAll', 'stageAllMergeConflicts', 'discardAll', 'confirmSelectedItems', 'selectAll', 'selectFirst', 'selectLast', 'diveIntoSelection', 'showDiffView', 'showBulkResolveMenu', 'showActionsMenu', 'resolveCurrentAsOurs', 'resolveCurrentAsTheirs', 'quietlySelectItem', 'didChangeSelectedItems');
    this.subs = new _eventKit.CompositeDisposable(atom.config.observe('github.keyboardNavigationDelay', value => {
      if (value === 0) {
        this.debouncedDidChangeSelectedItem = this.didChangeSelectedItems;
      } else {
        this.debouncedDidChangeSelectedItem = debounce(this.didChangeSelectedItems, value);
      }
    }));
    this.state = _objectSpread2({}, calculateTruncatedLists({
      unstagedChanges: this.props.unstagedChanges,
      stagedChanges: this.props.stagedChanges,
      mergeConflicts: this.props.mergeConflicts
    }), {
      selection: new _compositeListSelection.default({
        listsByKey: [['unstaged', this.props.unstagedChanges], ['conflicts', this.props.mergeConflicts], ['staged', this.props.stagedChanges]],
        idForItem: item => item.filePath
      })
    });
    this.mouseSelectionInProgress = false;
    this.listElementsByItem = new WeakMap();
    this.refRoot = new _refHolder.default();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let nextState = {};

    if (['unstagedChanges', 'stagedChanges', 'mergeConflicts'].some(key => prevState.source[key] !== nextProps[key])) {
      const nextLists = calculateTruncatedLists({
        unstagedChanges: nextProps.unstagedChanges,
        stagedChanges: nextProps.stagedChanges,
        mergeConflicts: nextProps.mergeConflicts
      });
      nextState = _objectSpread2({}, nextLists, {
        selection: prevState.selection.updateLists([['unstaged', nextLists.unstagedChanges], ['conflicts', nextLists.mergeConflicts], ['staged', nextLists.stagedChanges]])
      });
    }

    return nextState;
  }

  componentDidMount() {
    window.addEventListener('mouseup', this.mouseup);
    this.subs.add(new _eventKit.Disposable(() => window.removeEventListener('mouseup', this.mouseup)), this.props.workspace.onDidChangeActivePaneItem(() => {
      this.syncWithWorkspace();
    }));

    if (this.isPopulated(this.props)) {
      this.syncWithWorkspace();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const isRepoSame = prevProps.workingDirectoryPath === this.props.workingDirectoryPath;
    const hasSelectionsPresent = prevState.selection.getSelectedItems().size > 0 && this.state.selection.getSelectedItems().size > 0;
    const selectionChanged = this.state.selection !== prevState.selection;

    if (isRepoSame && hasSelectionsPresent && selectionChanged) {
      this.debouncedDidChangeSelectedItem();
    }

    const headItem = this.state.selection.getHeadItem();

    if (headItem) {
      const element = this.listElementsByItem.get(headItem);

      if (element) {
        element.scrollIntoViewIfNeeded();
      }
    }

    if (!this.isPopulated(prevProps) && this.isPopulated(this.props)) {
      this.syncWithWorkspace();
    }
  }

  render() {
    return _react.default.createElement(_observeModel.default, {
      model: this.props.resolutionProgress,
      fetchData: noop
    }, this.renderBody);
  }

  renderBody() {
    const selectedItems = this.state.selection.getSelectedItems();
    return _react.default.createElement("div", {
      ref: this.refRoot.setter,
      className: `github-StagingView ${this.state.selection.getActiveListKey()}-changes-focused`,
      tabIndex: "-1"
    }, this.renderCommands(), _react.default.createElement("div", {
      className: `github-StagingView-group github-UnstagedChanges ${this.getFocusClass('unstaged')}`
    }, _react.default.createElement("header", {
      className: "github-StagingView-header"
    }, _react.default.createElement("span", {
      className: "icon icon-list-unordered"
    }), _react.default.createElement("span", {
      className: "github-StagingView-title"
    }, "Unstaged Changes"), this.renderActionsMenu(), _react.default.createElement("button", {
      className: "github-StagingView-headerButton icon icon-move-down",
      disabled: this.props.unstagedChanges.length === 0,
      onClick: this.stageAll
    }, "Stage All")), _react.default.createElement("div", {
      className: "github-StagingView-list github-FilePatchListView github-StagingView-unstaged"
    }, this.state.unstagedChanges.map(filePatch => _react.default.createElement(_filePatchListItemView.default, {
      key: filePatch.filePath,
      registerItemElement: this.registerItemElement,
      filePatch: filePatch,
      onDoubleClick: event => this.dblclickOnItem(event, filePatch),
      onContextMenu: event => this.contextMenuOnItem(event, filePatch),
      onMouseDown: event => this.mousedownOnItem(event, filePatch),
      onMouseMove: event => this.mousemoveOnItem(event, filePatch),
      selected: selectedItems.has(filePatch)
    }))), this.renderTruncatedMessage(this.props.unstagedChanges)), this.renderMergeConflicts(), _react.default.createElement("div", {
      className: `github-StagingView-group github-StagedChanges ${this.getFocusClass('staged')}`
    }, _react.default.createElement("header", {
      className: "github-StagingView-header"
    }, _react.default.createElement("span", {
      className: "icon icon-tasklist"
    }), _react.default.createElement("span", {
      className: "github-StagingView-title"
    }, "Staged Changes"), _react.default.createElement("button", {
      className: "github-StagingView-headerButton icon icon-move-up",
      disabled: this.props.stagedChanges.length === 0,
      onClick: this.unstageAll
    }, "Unstage All")), _react.default.createElement("div", {
      className: "github-StagingView-list github-FilePatchListView github-StagingView-staged"
    }, this.state.stagedChanges.map(filePatch => _react.default.createElement(_filePatchListItemView.default, {
      key: filePatch.filePath,
      filePatch: filePatch,
      registerItemElement: this.registerItemElement,
      onDoubleClick: event => this.dblclickOnItem(event, filePatch),
      onContextMenu: event => this.contextMenuOnItem(event, filePatch),
      onMouseDown: event => this.mousedownOnItem(event, filePatch),
      onMouseMove: event => this.mousemoveOnItem(event, filePatch),
      selected: selectedItems.has(filePatch)
    }))), this.renderTruncatedMessage(this.props.stagedChanges)));
  }

  renderCommands() {
    return _react.default.createElement(_react.Fragment, null, _react.default.createElement(_commands.default, {
      registry: this.props.commands,
      target: ".github-StagingView"
    }, _react.default.createElement(_commands.Command, {
      command: "core:move-up",
      callback: () => this.selectPrevious()
    }), _react.default.createElement(_commands.Command, {
      command: "core:move-down",
      callback: () => this.selectNext()
    }), _react.default.createElement(_commands.Command, {
      command: "core:move-left",
      callback: this.diveIntoSelection
    }), _react.default.createElement(_commands.Command, {
      command: "github:show-diff-view",
      callback: this.showDiffView
    }), _react.default.createElement(_commands.Command, {
      command: "core:select-up",
      callback: () => this.selectPrevious(true)
    }), _react.default.createElement(_commands.Command, {
      command: "core:select-down",
      callback: () => this.selectNext(true)
    }), _react.default.createElement(_commands.Command, {
      command: "core:select-all",
      callback: this.selectAll
    }), _react.default.createElement(_commands.Command, {
      command: "core:move-to-top",
      callback: this.selectFirst
    }), _react.default.createElement(_commands.Command, {
      command: "core:move-to-bottom",
      callback: this.selectLast
    }), _react.default.createElement(_commands.Command, {
      command: "core:select-to-top",
      callback: () => this.selectFirst(true)
    }), _react.default.createElement(_commands.Command, {
      command: "core:select-to-bottom",
      callback: () => this.selectLast(true)
    }), _react.default.createElement(_commands.Command, {
      command: "core:confirm",
      callback: this.confirmSelectedItems
    }), _react.default.createElement(_commands.Command, {
      command: "github:activate-next-list",
      callback: this.activateNextList
    }), _react.default.createElement(_commands.Command, {
      command: "github:activate-previous-list",
      callback: this.activatePreviousList
    }), _react.default.createElement(_commands.Command, {
      command: "github:jump-to-file",
      callback: this.openFile
    }), _react.default.createElement(_commands.Command, {
      command: "github:resolve-file-as-ours",
      callback: this.resolveCurrentAsOurs
    }), _react.default.createElement(_commands.Command, {
      command: "github:resolve-file-as-theirs",
      callback: this.resolveCurrentAsTheirs
    }), _react.default.createElement(_commands.Command, {
      command: "github:discard-changes-in-selected-files",
      callback: this.discardChangesFromCommand
    }), _react.default.createElement(_commands.Command, {
      command: "core:undo",
      callback: this.undoLastDiscardFromCoreUndo
    })), _react.default.createElement(_commands.default, {
      registry: this.props.commands,
      target: "atom-workspace"
    }, _react.default.createElement(_commands.Command, {
      command: "github:stage-all-changes",
      callback: this.stageAll
    }), _react.default.createElement(_commands.Command, {
      command: "github:unstage-all-changes",
      callback: this.unstageAll
    }), _react.default.createElement(_commands.Command, {
      command: "github:discard-all-changes",
      callback: this.discardAllFromCommand
    }), _react.default.createElement(_commands.Command, {
      command: "github:undo-last-discard-in-git-tab",
      callback: this.undoLastDiscardFromCommand
    })));
  }

  renderActionsMenu() {
    if (this.props.unstagedChanges.length || this.props.hasUndoHistory) {
      return _react.default.createElement("button", {
        className: "github-StagingView-headerButton github-StagingView-headerButton--iconOnly icon icon-ellipses",
        onClick: this.showActionsMenu
      });
    } else {
      return null;
    }
  }

  renderUndoButton() {
    return _react.default.createElement("button", {
      className: "github-StagingView-headerButton github-StagingView-headerButton--fullWidth icon icon-history",
      onClick: this.undoLastDiscardFromButton
    }, "Undo Discard");
  }

  renderTruncatedMessage(list) {
    if (list.length > MAXIMUM_LISTED_ENTRIES) {
      return _react.default.createElement("div", {
        className: "github-StagingView-group-truncatedMsg"
      }, "List truncated to the first ", MAXIMUM_LISTED_ENTRIES, " items");
    } else {
      return null;
    }
  }

  renderMergeConflicts() {
    const mergeConflicts = this.state.mergeConflicts;

    if (mergeConflicts && mergeConflicts.length > 0) {
      const selectedItems = this.state.selection.getSelectedItems();
      const resolutionProgress = this.props.resolutionProgress;
      const anyUnresolved = mergeConflicts.map(conflict => _path.default.join(this.props.workingDirectoryPath, conflict.filePath)).some(conflictPath => resolutionProgress.getRemaining(conflictPath) !== 0);
      const bulkResolveDropdown = anyUnresolved ? _react.default.createElement("span", {
        className: "inline-block icon icon-ellipses",
        onClick: this.showBulkResolveMenu
      }) : null;
      return _react.default.createElement("div", {
        className: `github-StagingView-group github-MergeConflictPaths ${this.getFocusClass('conflicts')}`
      }, _react.default.createElement("header", {
        className: "github-StagingView-header"
      }, _react.default.createElement("span", {
        className: 'github-FilePatchListView-icon icon icon-alert status-modified'
      }), _react.default.createElement("span", {
        className: "github-StagingView-title"
      }, "Merge Conflicts"), bulkResolveDropdown, _react.default.createElement("button", {
        className: "github-StagingView-headerButton icon icon-move-down",
        disabled: anyUnresolved,
        onClick: this.stageAllMergeConflicts
      }, "Stage All")), _react.default.createElement("div", {
        className: "github-StagingView-list github-FilePatchListView github-StagingView-merge"
      }, mergeConflicts.map(mergeConflict => {
        const fullPath = _path.default.join(this.props.workingDirectoryPath, mergeConflict.filePath);

        return _react.default.createElement(_mergeConflictListItemView.default, {
          key: fullPath,
          mergeConflict: mergeConflict,
          remainingConflicts: resolutionProgress.getRemaining(fullPath),
          registerItemElement: this.registerItemElement,
          onDoubleClick: event => this.dblclickOnItem(event, mergeConflict),
          onContextMenu: event => this.contextMenuOnItem(event, mergeConflict),
          onMouseDown: event => this.mousedownOnItem(event, mergeConflict),
          onMouseMove: event => this.mousemoveOnItem(event, mergeConflict),
          selected: selectedItems.has(mergeConflict)
        });
      })), this.renderTruncatedMessage(mergeConflicts));
    } else {
      return _react.default.createElement("noscript", null);
    }
  }

  componentWillUnmount() {
    this.subs.dispose();
  }

  getSelectedItemFilePaths() {
    return Array.from(this.state.selection.getSelectedItems(), item => item.filePath);
  }

  getSelectedConflictPaths() {
    if (this.state.selection.getActiveListKey() !== 'conflicts') {
      return [];
    }

    return this.getSelectedItemFilePaths();
  }

  openFile() {
    const filePaths = this.getSelectedItemFilePaths();
    return this.props.openFiles(filePaths);
  }

  discardChanges({
    eventSource
  } = {}) {
    const filePaths = this.getSelectedItemFilePaths();
    (0, _reporterProxy.addEvent)('discard-unstaged-changes', {
      package: 'github',
      component: 'StagingView',
      fileCount: filePaths.length,
      type: 'selected',
      eventSource
    });
    return this.props.discardWorkDirChangesForPaths(filePaths);
  }

  activateNextList() {
    return new Promise(resolve => {
      let advanced = false;
      this.setState(prevState => {
        const next = prevState.selection.activateNextSelection();

        if (prevState.selection === next) {
          return {};
        }

        advanced = true;
        return {
          selection: next.coalesce()
        };
      }, () => resolve(advanced));
    });
  }

  activatePreviousList() {
    return new Promise(resolve => {
      let retreated = false;
      this.setState(prevState => {
        const next = prevState.selection.activatePreviousSelection();

        if (prevState.selection === next) {
          return {};
        }

        retreated = true;
        return {
          selection: next.coalesce()
        };
      }, () => resolve(retreated));
    });
  }

  activateLastList() {
    return new Promise(resolve => {
      let emptySelection = false;
      this.setState(prevState => {
        const next = prevState.selection.activateLastSelection();
        emptySelection = next.getSelectedItems().size > 0;

        if (prevState.selection === next) {
          return {};
        }

        return {
          selection: next.coalesce()
        };
      }, () => resolve(emptySelection));
    });
  }

  stageAll() {
    if (this.props.unstagedChanges.length === 0) {
      return null;
    }

    return this.props.attemptStageAllOperation('unstaged');
  }

  unstageAll() {
    if (this.props.stagedChanges.length === 0) {
      return null;
    }

    return this.props.attemptStageAllOperation('staged');
  }

  stageAllMergeConflicts() {
    if (this.props.mergeConflicts.length === 0) {
      return null;
    }

    const filePaths = this.props.mergeConflicts.map(conflict => conflict.filePath);
    return this.props.attemptFileStageOperation(filePaths, 'unstaged');
  }

  discardAll({
    eventSource
  } = {}) {
    if (this.props.unstagedChanges.length === 0) {
      return null;
    }

    const filePaths = this.props.unstagedChanges.map(filePatch => filePatch.filePath);
    (0, _reporterProxy.addEvent)('discard-unstaged-changes', {
      package: 'github',
      component: 'StagingView',
      fileCount: filePaths.length,
      type: 'all',
      eventSource
    });
    return this.props.discardWorkDirChangesForPaths(filePaths);
  }

  getNextListUpdatePromise() {
    return this.state.selection.getNextUpdatePromise();
  }

  selectPrevious(preserveTail = false) {
    return new Promise(resolve => {
      this.setState(prevState => ({
        selection: prevState.selection.selectPreviousItem(preserveTail).coalesce()
      }), resolve);
    });
  }

  selectNext(preserveTail = false) {
    return new Promise(resolve => {
      this.setState(prevState => ({
        selection: prevState.selection.selectNextItem(preserveTail).coalesce()
      }), resolve);
    });
  }

  selectAll() {
    return new Promise(resolve => {
      this.setState(prevState => ({
        selection: prevState.selection.selectAllItems().coalesce()
      }), resolve);
    });
  }

  selectFirst(preserveTail = false) {
    return new Promise(resolve => {
      this.setState(prevState => ({
        selection: prevState.selection.selectFirstItem(preserveTail).coalesce()
      }), resolve);
    });
  }

  selectLast(preserveTail = false) {
    return new Promise(resolve => {
      this.setState(prevState => ({
        selection: prevState.selection.selectLastItem(preserveTail).coalesce()
      }), resolve);
    });
  }

  async diveIntoSelection() {
    const selectedItems = this.state.selection.getSelectedItems();

    if (selectedItems.size !== 1) {
      return;
    }

    const selectedItem = selectedItems.values().next().value;
    const stagingStatus = this.state.selection.getActiveListKey();

    if (stagingStatus === 'conflicts') {
      this.showMergeConflictFileForPath(selectedItem.filePath, {
        activate: true
      });
    } else {
      await this.showFilePatchItem(selectedItem.filePath, this.state.selection.getActiveListKey(), {
        activate: true
      });
    }
  }

  async syncWithWorkspace() {
    const item = this.props.workspace.getActivePaneItem();

    if (!item) {
      return;
    }

    const realItemPromise = item.getRealItemPromise && item.getRealItemPromise();
    const realItem = await realItemPromise;

    if (!realItem) {
      return;
    }

    const isFilePatchItem = realItem.isFilePatchItem && realItem.isFilePatchItem();
    const isMatch = realItem.getWorkingDirectory && realItem.getWorkingDirectory() === this.props.workingDirectoryPath;

    if (isFilePatchItem && isMatch) {
      this.quietlySelectItem(realItem.getFilePath(), realItem.getStagingStatus());
    }
  }

  async showDiffView() {
    const selectedItems = this.state.selection.getSelectedItems();

    if (selectedItems.size !== 1) {
      return;
    }

    const selectedItem = selectedItems.values().next().value;
    const stagingStatus = this.state.selection.getActiveListKey();

    if (stagingStatus === 'conflicts') {
      this.showMergeConflictFileForPath(selectedItem.filePath);
    } else {
      await this.showFilePatchItem(selectedItem.filePath, this.state.selection.getActiveListKey());
    }
  }

  showBulkResolveMenu(event) {
    const conflictPaths = this.props.mergeConflicts.map(c => c.filePath);
    event.preventDefault();
    const menu = new Menu();
    menu.append(new MenuItem({
      label: 'Resolve All as Ours',
      click: () => this.props.resolveAsOurs(conflictPaths)
    }));
    menu.append(new MenuItem({
      label: 'Resolve All as Theirs',
      click: () => this.props.resolveAsTheirs(conflictPaths)
    }));
    menu.popup(_electron.remote.getCurrentWindow());
  }

  showActionsMenu(event) {
    event.preventDefault();
    const menu = new Menu();
    const selectedItemCount = this.state.selection.getSelectedItems().size;
    const pluralization = selectedItemCount > 1 ? 's' : '';
    menu.append(new MenuItem({
      label: 'Discard All Changes',
      click: () => this.discardAll({
        eventSource: 'header-menu'
      }),
      enabled: this.props.unstagedChanges.length > 0
    }));
    menu.append(new MenuItem({
      label: 'Discard Changes in Selected File' + pluralization,
      click: () => this.discardChanges({
        eventSource: 'header-menu'
      }),
      enabled: !!(this.props.unstagedChanges.length && selectedItemCount)
    }));
    menu.append(new MenuItem({
      label: 'Undo Last Discard',
      click: () => this.undoLastDiscard({
        eventSource: 'header-menu'
      }),
      enabled: this.props.hasUndoHistory
    }));
    menu.popup(_electron.remote.getCurrentWindow());
  }

  resolveCurrentAsOurs() {
    this.props.resolveAsOurs(this.getSelectedConflictPaths());
  }

  resolveCurrentAsTheirs() {
    this.props.resolveAsTheirs(this.getSelectedConflictPaths());
  } // Directly modify the selection to include only the item identified by the file path and stagingStatus tuple.
  // Re-render the component, but don't notify didSelectSingleItem() or other callback functions. This is useful to
  // avoid circular callback loops for actions originating in FilePatchView or TextEditors with merge conflicts.


  quietlySelectItem(filePath, stagingStatus) {
    return new Promise(resolve => {
      this.setState(prevState => {
        const item = prevState.selection.findItem((each, key) => each.filePath === filePath && key === stagingStatus);

        if (!item) {
          // FIXME: make staging view display no selected item
          // eslint-disable-next-line no-console
          console.log(`Unable to find item at path ${filePath} with staging status ${stagingStatus}`);
          return null;
        }

        return {
          selection: prevState.selection.selectItem(item)
        };
      }, resolve);
    });
  }

  getSelectedItems() {
    const stagingStatus = this.state.selection.getActiveListKey();
    return Array.from(this.state.selection.getSelectedItems(), item => {
      return {
        filePath: item.filePath,
        stagingStatus
      };
    });
  }

  didChangeSelectedItems(openNew) {
    const selectedItems = Array.from(this.state.selection.getSelectedItems());

    if (selectedItems.length === 1) {
      this.didSelectSingleItem(selectedItems[0], openNew);
    }
  }

  async didSelectSingleItem(selectedItem, openNew = false) {
    if (!this.hasFocus()) {
      return;
    }

    if (this.state.selection.getActiveListKey() === 'conflicts') {
      if (openNew) {
        await this.showMergeConflictFileForPath(selectedItem.filePath, {
          activate: true
        });
      }
    } else {
      if (openNew) {
        // User explicitly asked to view diff, such as via click
        await this.showFilePatchItem(selectedItem.filePath, this.state.selection.getActiveListKey(), {
          activate: false
        });
      } else {
        const panesWithStaleItemsToUpdate = this.getPanesWithStalePendingFilePatchItem();

        if (panesWithStaleItemsToUpdate.length > 0) {
          // Update stale items to reflect new selection
          await Promise.all(panesWithStaleItemsToUpdate.map(async pane => {
            await this.showFilePatchItem(selectedItem.filePath, this.state.selection.getActiveListKey(), {
              activate: false,
              pane
            });
          }));
        } else {
          // Selection was changed via keyboard navigation, update pending item in active pane
          const activePane = this.props.workspace.getCenter().getActivePane();
          const activePendingItem = activePane.getPendingItem();

          const activePaneHasPendingFilePatchItem = activePendingItem && activePendingItem.getRealItem && activePendingItem.getRealItem() instanceof _changedFileItem.default;

          if (activePaneHasPendingFilePatchItem) {
            await this.showFilePatchItem(selectedItem.filePath, this.state.selection.getActiveListKey(), {
              activate: false,
              pane: activePane
            });
          }
        }
      }
    }
  }

  getPanesWithStalePendingFilePatchItem() {
    // "stale" meaning there is no longer a changed file associated with item
    // due to changes being fully staged/unstaged/stashed/deleted/etc
    return this.props.workspace.getPanes().filter(pane => {
      const pendingItem = pane.getPendingItem();

      if (!pendingItem || !pendingItem.getRealItem) {
        return false;
      }

      const realItem = pendingItem.getRealItem();

      if (!(realItem instanceof _changedFileItem.default)) {
        return false;
      } // We only want to update pending diff views for currently active repo


      const isInActiveRepo = realItem.getWorkingDirectory() === this.props.workingDirectoryPath;
      const isStale = !this.changedFileExists(realItem.getFilePath(), realItem.getStagingStatus());
      return isInActiveRepo && isStale;
    });
  }

  changedFileExists(filePath, stagingStatus) {
    return this.state.selection.findItem((item, key) => {
      return key === stagingStatus && item.filePath === filePath;
    });
  }

  async showFilePatchItem(filePath, stagingStatus, {
    activate,
    pane
  } = {
    activate: false
  }) {
    const uri = _changedFileItem.default.buildURI(filePath, this.props.workingDirectoryPath, stagingStatus);

    const changedFileItem = await this.props.workspace.open(uri, {
      pending: true,
      activatePane: activate,
      activateItem: activate,
      pane
    });

    if (activate) {
      const itemRoot = changedFileItem.getElement();
      const focusRoot = itemRoot.querySelector('[tabIndex]');

      if (focusRoot) {
        focusRoot.focus();
      }
    } else {
      // simply make item visible
      this.props.workspace.paneForItem(changedFileItem).activateItem(changedFileItem);
    }
  }

  async showMergeConflictFileForPath(relativeFilePath, {
    activate
  } = {
    activate: false
  }) {
    const absolutePath = _path.default.join(this.props.workingDirectoryPath, relativeFilePath);

    if (await this.fileExists(absolutePath)) {
      return this.props.workspace.open(absolutePath, {
        activatePane: activate,
        activateItem: activate,
        pending: true
      });
    } else {
      this.props.notificationManager.addInfo('File has been deleted.');
      return null;
    }
  }

  fileExists(absolutePath) {
    return new _atom.File(absolutePath).exists();
  }

  dblclickOnItem(event, item) {
    return this.props.attemptFileStageOperation([item.filePath], this.state.selection.listKeyForItem(item));
  }

  async contextMenuOnItem(event, item) {
    if (!this.state.selection.getSelectedItems().has(item)) {
      event.stopPropagation();
      event.persist();
      await new Promise(resolve => {
        this.setState(prevState => ({
          selection: prevState.selection.selectItem(item, event.shiftKey)
        }), resolve);
      });
      const newEvent = new MouseEvent(event.type, event);
      requestAnimationFrame(() => {
        if (!event.target.parentNode) {
          return;
        }

        event.target.parentNode.dispatchEvent(newEvent);
      });
    }
  }

  async mousedownOnItem(event, item) {
    const windows = process.platform === 'win32';

    if (event.ctrlKey && !windows) {
      return;
    } // simply open context menu


    if (event.button === 0) {
      this.mouseSelectionInProgress = true;
      event.persist();
      await new Promise(resolve => {
        if (event.metaKey || event.ctrlKey && windows) {
          this.setState(prevState => ({
            selection: prevState.selection.addOrSubtractSelection(item)
          }), resolve);
        } else {
          this.setState(prevState => ({
            selection: prevState.selection.selectItem(item, event.shiftKey)
          }), resolve);
        }
      });
    }
  }

  async mousemoveOnItem(event, item) {
    if (this.mouseSelectionInProgress) {
      await new Promise(resolve => {
        this.setState(prevState => ({
          selection: prevState.selection.selectItem(item, true)
        }), resolve);
      });
    }
  }

  async mouseup() {
    const hadSelectionInProgress = this.mouseSelectionInProgress;
    this.mouseSelectionInProgress = false;
    await new Promise(resolve => {
      this.setState(prevState => ({
        selection: prevState.selection.coalesce()
      }), resolve);
    });

    if (hadSelectionInProgress) {
      this.didChangeSelectedItems(true);
    }
  }

  undoLastDiscard({
    eventSource
  } = {}) {
    if (!this.props.hasUndoHistory) {
      return;
    }

    (0, _reporterProxy.addEvent)('undo-last-discard', {
      package: 'github',
      component: 'StagingView',
      eventSource
    });
    this.props.undoLastDiscard();
  }

  getFocusClass(listKey) {
    return this.state.selection.getActiveListKey() === listKey ? 'is-focused' : '';
  }

  registerItemElement(item, element) {
    this.listElementsByItem.set(item, element);
  }

  getFocus(element) {
    return this.refRoot.map(root => root.contains(element)).getOr(false) ? StagingView.focus.STAGING : null;
  }

  setFocus(focus) {
    if (focus === this.constructor.focus.STAGING) {
      this.refRoot.map(root => root.focus());
      return true;
    }

    return false;
  }

  async advanceFocusFrom(focus) {
    if (focus === this.constructor.focus.STAGING) {
      if (await this.activateNextList()) {
        // There was a next list to activate.
        return this.constructor.focus.STAGING;
      } // We were already on the last list.


      return _commitView.default.firstFocus;
    }

    return null;
  }

  async retreatFocusFrom(focus) {
    if (focus === _commitView.default.firstFocus) {
      await this.activateLastList();
      return this.constructor.focus.STAGING;
    }

    if (focus === this.constructor.focus.STAGING) {
      await this.activatePreviousList();
      return this.constructor.focus.STAGING;
    }

    return false;
  }

  hasFocus() {
    return this.refRoot.map(root => root.contains(document.activeElement)).getOr(false);
  }

  isPopulated(props) {
    return props.workingDirectoryPath != null && (props.unstagedChanges.length > 0 || props.mergeConflicts.length > 0 || props.stagedChanges.length > 0);
  }

}

exports.default = StagingView;

_defineProperty(StagingView, "propTypes", {
  unstagedChanges: _propTypes.default.arrayOf(_propTypes2.FilePatchItemPropType).isRequired,
  stagedChanges: _propTypes.default.arrayOf(_propTypes2.FilePatchItemPropType).isRequired,
  mergeConflicts: _propTypes.default.arrayOf(_propTypes2.MergeConflictItemPropType),
  workingDirectoryPath: _propTypes.default.string,
  resolutionProgress: _propTypes.default.object,
  hasUndoHistory: _propTypes.default.bool.isRequired,
  commands: _propTypes.default.object.isRequired,
  notificationManager: _propTypes.default.object.isRequired,
  workspace: _propTypes.default.object.isRequired,
  openFiles: _propTypes.default.func.isRequired,
  attemptFileStageOperation: _propTypes.default.func.isRequired,
  discardWorkDirChangesForPaths: _propTypes.default.func.isRequired,
  undoLastDiscard: _propTypes.default.func.isRequired,
  attemptStageAllOperation: _propTypes.default.func.isRequired,
  resolveAsOurs: _propTypes.default.func.isRequired,
  resolveAsTheirs: _propTypes.default.func.isRequired
});

_defineProperty(StagingView, "defaultProps", {
  mergeConflicts: [],
  resolutionProgress: new _resolutionProgress.default()
});

_defineProperty(StagingView, "focus", {
  STAGING: Symbol('staging')
});

_defineProperty(StagingView, "firstFocus", StagingView.focus.STAGING);

_defineProperty(StagingView, "lastFocus", StagingView.focus.STAGING);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi92aWV3cy9zdGFnaW5nLXZpZXcuanMiXSwibmFtZXMiOlsiTWVudSIsIk1lbnVJdGVtIiwicmVtb3RlIiwiZGVib3VuY2UiLCJmbiIsIndhaXQiLCJ0aW1lb3V0IiwiYXJncyIsIlByb21pc2UiLCJyZXNvbHZlIiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsImNhbGN1bGF0ZVRydW5jYXRlZExpc3RzIiwibGlzdHMiLCJPYmplY3QiLCJrZXlzIiwicmVkdWNlIiwiYWNjIiwia2V5IiwibGlzdCIsInNvdXJjZSIsImxlbmd0aCIsIk1BWElNVU1fTElTVEVEX0VOVFJJRVMiLCJzbGljZSIsIm5vb3AiLCJTdGFnaW5nVmlldyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInVuZG9MYXN0RGlzY2FyZCIsImV2ZW50U291cmNlIiwiY29tbWFuZCIsImRpc2NhcmRDaGFuZ2VzIiwiZGlzY2FyZEFsbCIsIml0ZW1QYXRocyIsImdldFNlbGVjdGVkSXRlbUZpbGVQYXRocyIsImF0dGVtcHRGaWxlU3RhZ2VPcGVyYXRpb24iLCJzdGF0ZSIsInNlbGVjdGlvbiIsImdldEFjdGl2ZUxpc3RLZXkiLCJzZXRTdGF0ZSIsInByZXZTdGF0ZSIsImNvYWxlc2NlIiwic3VicyIsIkNvbXBvc2l0ZURpc3Bvc2FibGUiLCJhdG9tIiwiY29uZmlnIiwib2JzZXJ2ZSIsInZhbHVlIiwiZGVib3VuY2VkRGlkQ2hhbmdlU2VsZWN0ZWRJdGVtIiwiZGlkQ2hhbmdlU2VsZWN0ZWRJdGVtcyIsInVuc3RhZ2VkQ2hhbmdlcyIsInN0YWdlZENoYW5nZXMiLCJtZXJnZUNvbmZsaWN0cyIsIkNvbXBvc2l0ZUxpc3RTZWxlY3Rpb24iLCJsaXN0c0J5S2V5IiwiaWRGb3JJdGVtIiwiaXRlbSIsImZpbGVQYXRoIiwibW91c2VTZWxlY3Rpb25JblByb2dyZXNzIiwibGlzdEVsZW1lbnRzQnlJdGVtIiwiV2Vha01hcCIsInJlZlJvb3QiLCJSZWZIb2xkZXIiLCJnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMiLCJuZXh0UHJvcHMiLCJuZXh0U3RhdGUiLCJzb21lIiwibmV4dExpc3RzIiwidXBkYXRlTGlzdHMiLCJjb21wb25lbnREaWRNb3VudCIsIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJtb3VzZXVwIiwiYWRkIiwiRGlzcG9zYWJsZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ3b3Jrc3BhY2UiLCJvbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtIiwic3luY1dpdGhXb3Jrc3BhY2UiLCJpc1BvcHVsYXRlZCIsImNvbXBvbmVudERpZFVwZGF0ZSIsInByZXZQcm9wcyIsImlzUmVwb1NhbWUiLCJ3b3JraW5nRGlyZWN0b3J5UGF0aCIsImhhc1NlbGVjdGlvbnNQcmVzZW50IiwiZ2V0U2VsZWN0ZWRJdGVtcyIsInNpemUiLCJzZWxlY3Rpb25DaGFuZ2VkIiwiaGVhZEl0ZW0iLCJnZXRIZWFkSXRlbSIsImVsZW1lbnQiLCJnZXQiLCJzY3JvbGxJbnRvVmlld0lmTmVlZGVkIiwicmVuZGVyIiwicmVzb2x1dGlvblByb2dyZXNzIiwicmVuZGVyQm9keSIsInNlbGVjdGVkSXRlbXMiLCJzZXR0ZXIiLCJyZW5kZXJDb21tYW5kcyIsImdldEZvY3VzQ2xhc3MiLCJyZW5kZXJBY3Rpb25zTWVudSIsInN0YWdlQWxsIiwibWFwIiwiZmlsZVBhdGNoIiwicmVnaXN0ZXJJdGVtRWxlbWVudCIsImV2ZW50IiwiZGJsY2xpY2tPbkl0ZW0iLCJjb250ZXh0TWVudU9uSXRlbSIsIm1vdXNlZG93bk9uSXRlbSIsIm1vdXNlbW92ZU9uSXRlbSIsImhhcyIsInJlbmRlclRydW5jYXRlZE1lc3NhZ2UiLCJyZW5kZXJNZXJnZUNvbmZsaWN0cyIsInVuc3RhZ2VBbGwiLCJjb21tYW5kcyIsInNlbGVjdFByZXZpb3VzIiwic2VsZWN0TmV4dCIsImRpdmVJbnRvU2VsZWN0aW9uIiwic2hvd0RpZmZWaWV3Iiwic2VsZWN0QWxsIiwic2VsZWN0Rmlyc3QiLCJzZWxlY3RMYXN0IiwiY29uZmlybVNlbGVjdGVkSXRlbXMiLCJhY3RpdmF0ZU5leHRMaXN0IiwiYWN0aXZhdGVQcmV2aW91c0xpc3QiLCJvcGVuRmlsZSIsInJlc29sdmVDdXJyZW50QXNPdXJzIiwicmVzb2x2ZUN1cnJlbnRBc1RoZWlycyIsImRpc2NhcmRDaGFuZ2VzRnJvbUNvbW1hbmQiLCJ1bmRvTGFzdERpc2NhcmRGcm9tQ29yZVVuZG8iLCJkaXNjYXJkQWxsRnJvbUNvbW1hbmQiLCJ1bmRvTGFzdERpc2NhcmRGcm9tQ29tbWFuZCIsImhhc1VuZG9IaXN0b3J5Iiwic2hvd0FjdGlvbnNNZW51IiwicmVuZGVyVW5kb0J1dHRvbiIsInVuZG9MYXN0RGlzY2FyZEZyb21CdXR0b24iLCJhbnlVbnJlc29sdmVkIiwiY29uZmxpY3QiLCJwYXRoIiwiam9pbiIsImNvbmZsaWN0UGF0aCIsImdldFJlbWFpbmluZyIsImJ1bGtSZXNvbHZlRHJvcGRvd24iLCJzaG93QnVsa1Jlc29sdmVNZW51Iiwic3RhZ2VBbGxNZXJnZUNvbmZsaWN0cyIsIm1lcmdlQ29uZmxpY3QiLCJmdWxsUGF0aCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwiZGlzcG9zZSIsIkFycmF5IiwiZnJvbSIsImdldFNlbGVjdGVkQ29uZmxpY3RQYXRocyIsImZpbGVQYXRocyIsIm9wZW5GaWxlcyIsInBhY2thZ2UiLCJjb21wb25lbnQiLCJmaWxlQ291bnQiLCJ0eXBlIiwiZGlzY2FyZFdvcmtEaXJDaGFuZ2VzRm9yUGF0aHMiLCJhZHZhbmNlZCIsIm5leHQiLCJhY3RpdmF0ZU5leHRTZWxlY3Rpb24iLCJyZXRyZWF0ZWQiLCJhY3RpdmF0ZVByZXZpb3VzU2VsZWN0aW9uIiwiYWN0aXZhdGVMYXN0TGlzdCIsImVtcHR5U2VsZWN0aW9uIiwiYWN0aXZhdGVMYXN0U2VsZWN0aW9uIiwiYXR0ZW1wdFN0YWdlQWxsT3BlcmF0aW9uIiwiZ2V0TmV4dExpc3RVcGRhdGVQcm9taXNlIiwiZ2V0TmV4dFVwZGF0ZVByb21pc2UiLCJwcmVzZXJ2ZVRhaWwiLCJzZWxlY3RQcmV2aW91c0l0ZW0iLCJzZWxlY3ROZXh0SXRlbSIsInNlbGVjdEFsbEl0ZW1zIiwic2VsZWN0Rmlyc3RJdGVtIiwic2VsZWN0TGFzdEl0ZW0iLCJzZWxlY3RlZEl0ZW0iLCJ2YWx1ZXMiLCJzdGFnaW5nU3RhdHVzIiwic2hvd01lcmdlQ29uZmxpY3RGaWxlRm9yUGF0aCIsImFjdGl2YXRlIiwic2hvd0ZpbGVQYXRjaEl0ZW0iLCJnZXRBY3RpdmVQYW5lSXRlbSIsInJlYWxJdGVtUHJvbWlzZSIsImdldFJlYWxJdGVtUHJvbWlzZSIsInJlYWxJdGVtIiwiaXNGaWxlUGF0Y2hJdGVtIiwiaXNNYXRjaCIsImdldFdvcmtpbmdEaXJlY3RvcnkiLCJxdWlldGx5U2VsZWN0SXRlbSIsImdldEZpbGVQYXRoIiwiZ2V0U3RhZ2luZ1N0YXR1cyIsImNvbmZsaWN0UGF0aHMiLCJjIiwicHJldmVudERlZmF1bHQiLCJtZW51IiwiYXBwZW5kIiwibGFiZWwiLCJjbGljayIsInJlc29sdmVBc091cnMiLCJyZXNvbHZlQXNUaGVpcnMiLCJwb3B1cCIsImdldEN1cnJlbnRXaW5kb3ciLCJzZWxlY3RlZEl0ZW1Db3VudCIsInBsdXJhbGl6YXRpb24iLCJlbmFibGVkIiwiZmluZEl0ZW0iLCJlYWNoIiwiY29uc29sZSIsImxvZyIsInNlbGVjdEl0ZW0iLCJvcGVuTmV3IiwiZGlkU2VsZWN0U2luZ2xlSXRlbSIsImhhc0ZvY3VzIiwicGFuZXNXaXRoU3RhbGVJdGVtc1RvVXBkYXRlIiwiZ2V0UGFuZXNXaXRoU3RhbGVQZW5kaW5nRmlsZVBhdGNoSXRlbSIsImFsbCIsInBhbmUiLCJhY3RpdmVQYW5lIiwiZ2V0Q2VudGVyIiwiZ2V0QWN0aXZlUGFuZSIsImFjdGl2ZVBlbmRpbmdJdGVtIiwiZ2V0UGVuZGluZ0l0ZW0iLCJhY3RpdmVQYW5lSGFzUGVuZGluZ0ZpbGVQYXRjaEl0ZW0iLCJnZXRSZWFsSXRlbSIsIkNoYW5nZWRGaWxlSXRlbSIsImdldFBhbmVzIiwiZmlsdGVyIiwicGVuZGluZ0l0ZW0iLCJpc0luQWN0aXZlUmVwbyIsImlzU3RhbGUiLCJjaGFuZ2VkRmlsZUV4aXN0cyIsInVyaSIsImJ1aWxkVVJJIiwiY2hhbmdlZEZpbGVJdGVtIiwib3BlbiIsInBlbmRpbmciLCJhY3RpdmF0ZVBhbmUiLCJhY3RpdmF0ZUl0ZW0iLCJpdGVtUm9vdCIsImdldEVsZW1lbnQiLCJmb2N1c1Jvb3QiLCJxdWVyeVNlbGVjdG9yIiwiZm9jdXMiLCJwYW5lRm9ySXRlbSIsInJlbGF0aXZlRmlsZVBhdGgiLCJhYnNvbHV0ZVBhdGgiLCJmaWxlRXhpc3RzIiwibm90aWZpY2F0aW9uTWFuYWdlciIsImFkZEluZm8iLCJGaWxlIiwiZXhpc3RzIiwibGlzdEtleUZvckl0ZW0iLCJzdG9wUHJvcGFnYXRpb24iLCJwZXJzaXN0Iiwic2hpZnRLZXkiLCJuZXdFdmVudCIsIk1vdXNlRXZlbnQiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJ0YXJnZXQiLCJwYXJlbnROb2RlIiwiZGlzcGF0Y2hFdmVudCIsIndpbmRvd3MiLCJwcm9jZXNzIiwicGxhdGZvcm0iLCJjdHJsS2V5IiwiYnV0dG9uIiwibWV0YUtleSIsImFkZE9yU3VidHJhY3RTZWxlY3Rpb24iLCJoYWRTZWxlY3Rpb25JblByb2dyZXNzIiwibGlzdEtleSIsInNldCIsImdldEZvY3VzIiwicm9vdCIsImNvbnRhaW5zIiwiZ2V0T3IiLCJTVEFHSU5HIiwic2V0Rm9jdXMiLCJhZHZhbmNlRm9jdXNGcm9tIiwiQ29tbWl0VmlldyIsImZpcnN0Rm9jdXMiLCJyZXRyZWF0Rm9jdXNGcm9tIiwiZG9jdW1lbnQiLCJhY3RpdmVFbGVtZW50IiwiUHJvcFR5cGVzIiwiYXJyYXlPZiIsIkZpbGVQYXRjaEl0ZW1Qcm9wVHlwZSIsImlzUmVxdWlyZWQiLCJNZXJnZUNvbmZsaWN0SXRlbVByb3BUeXBlIiwic3RyaW5nIiwib2JqZWN0IiwiYm9vbCIsImZ1bmMiLCJSZXNvbHV0aW9uUHJvZ3Jlc3MiLCJTeW1ib2wiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7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c2FibGV9IGZyb20gJ2V2ZW50LWtpdCc7XG5pbXBvcnQge3JlbW90ZX0gZnJvbSAnZWxlY3Ryb24nO1xuY29uc3Qge01lbnUsIE1lbnVJdGVtfSA9IHJlbW90ZTtcbmltcG9ydCB7RmlsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgUmVhY3QsIHtGcmFnbWVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge0ZpbGVQYXRjaEl0ZW1Qcm9wVHlwZSwgTWVyZ2VDb25mbGljdEl0ZW1Qcm9wVHlwZX0gZnJvbSAnLi4vcHJvcC10eXBlcyc7XG5pbXBvcnQgRmlsZVBhdGNoTGlzdEl0ZW1WaWV3IGZyb20gJy4vZmlsZS1wYXRjaC1saXN0LWl0ZW0tdmlldyc7XG5pbXBvcnQgT2JzZXJ2ZU1vZGVsIGZyb20gJy4vb2JzZXJ2ZS1tb2RlbCc7XG5pbXBvcnQgTWVyZ2VDb25mbGljdExpc3RJdGVtVmlldyBmcm9tICcuL21lcmdlLWNvbmZsaWN0LWxpc3QtaXRlbS12aWV3JztcbmltcG9ydCBDb21wb3NpdGVMaXN0U2VsZWN0aW9uIGZyb20gJy4uL21vZGVscy9jb21wb3NpdGUtbGlzdC1zZWxlY3Rpb24nO1xuaW1wb3J0IFJlc29sdXRpb25Qcm9ncmVzcyBmcm9tICcuLi9tb2RlbHMvY29uZmxpY3RzL3Jlc29sdXRpb24tcHJvZ3Jlc3MnO1xuaW1wb3J0IENvbW1pdFZpZXcgZnJvbSAnLi9jb21taXQtdmlldyc7XG5pbXBvcnQgUmVmSG9sZGVyIGZyb20gJy4uL21vZGVscy9yZWYtaG9sZGVyJztcbmltcG9ydCBDaGFuZ2VkRmlsZUl0ZW0gZnJvbSAnLi4vaXRlbXMvY2hhbmdlZC1maWxlLWl0ZW0nO1xuaW1wb3J0IENvbW1hbmRzLCB7Q29tbWFuZH0gZnJvbSAnLi4vYXRvbS9jb21tYW5kcyc7XG5pbXBvcnQge2F1dG9iaW5kfSBmcm9tICcuLi9oZWxwZXJzJztcbmltcG9ydCB7YWRkRXZlbnR9IGZyb20gJy4uL3JlcG9ydGVyLXByb3h5JztcblxuY29uc3QgZGVib3VuY2UgPSAoZm4sIHdhaXQpID0+IHtcbiAgbGV0IHRpbWVvdXQ7XG4gIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVzb2x2ZShmbiguLi5hcmdzKSk7XG4gICAgICB9LCB3YWl0KTtcbiAgICB9KTtcbiAgfTtcbn07XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZVRydW5jYXRlZExpc3RzKGxpc3RzKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhsaXN0cykucmVkdWNlKChhY2MsIGtleSkgPT4ge1xuICAgIGNvbnN0IGxpc3QgPSBsaXN0c1trZXldO1xuICAgIGFjYy5zb3VyY2Vba2V5XSA9IGxpc3Q7XG4gICAgaWYgKGxpc3QubGVuZ3RoIDw9IE1BWElNVU1fTElTVEVEX0VOVFJJRVMpIHtcbiAgICAgIGFjY1trZXldID0gbGlzdDtcbiAgICB9IGVsc2Uge1xuICAgICAgYWNjW2tleV0gPSBsaXN0LnNsaWNlKDAsIE1BWElNVU1fTElTVEVEX0VOVFJJRVMpO1xuICAgIH1cbiAgICByZXR1cm4gYWNjO1xuICB9LCB7c291cmNlOiB7fX0pO1xufVxuXG5jb25zdCBub29wID0gKCkgPT4geyB9O1xuXG5jb25zdCBNQVhJTVVNX0xJU1RFRF9FTlRSSUVTID0gMTAwMDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhZ2luZ1ZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIHVuc3RhZ2VkQ2hhbmdlczogUHJvcFR5cGVzLmFycmF5T2YoRmlsZVBhdGNoSXRlbVByb3BUeXBlKS5pc1JlcXVpcmVkLFxuICAgIHN0YWdlZENoYW5nZXM6IFByb3BUeXBlcy5hcnJheU9mKEZpbGVQYXRjaEl0ZW1Qcm9wVHlwZSkuaXNSZXF1aXJlZCxcbiAgICBtZXJnZUNvbmZsaWN0czogUHJvcFR5cGVzLmFycmF5T2YoTWVyZ2VDb25mbGljdEl0ZW1Qcm9wVHlwZSksXG4gICAgd29ya2luZ0RpcmVjdG9yeVBhdGg6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgcmVzb2x1dGlvblByb2dyZXNzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIGhhc1VuZG9IaXN0b3J5OiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGNvbW1hbmRzOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgbm90aWZpY2F0aW9uTWFuYWdlcjogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIHdvcmtzcGFjZTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIG9wZW5GaWxlczogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBhdHRlbXB0RmlsZVN0YWdlT3BlcmF0aW9uOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGRpc2NhcmRXb3JrRGlyQ2hhbmdlc0ZvclBhdGhzOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHVuZG9MYXN0RGlzY2FyZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBhdHRlbXB0U3RhZ2VBbGxPcGVyYXRpb246IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgcmVzb2x2ZUFzT3VyczogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICByZXNvbHZlQXNUaGVpcnM6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIH1cblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIG1lcmdlQ29uZmxpY3RzOiBbXSxcbiAgICByZXNvbHV0aW9uUHJvZ3Jlc3M6IG5ldyBSZXNvbHV0aW9uUHJvZ3Jlc3MoKSxcbiAgfVxuXG4gIHN0YXRpYyBmb2N1cyA9IHtcbiAgICBTVEFHSU5HOiBTeW1ib2woJ3N0YWdpbmcnKSxcbiAgfTtcblxuICBzdGF0aWMgZmlyc3RGb2N1cyA9IFN0YWdpbmdWaWV3LmZvY3VzLlNUQUdJTkc7XG5cbiAgc3RhdGljIGxhc3RGb2N1cyA9IFN0YWdpbmdWaWV3LmZvY3VzLlNUQUdJTkc7XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgYXV0b2JpbmQoXG4gICAgICB0aGlzLFxuICAgICAgJ2RibGNsaWNrT25JdGVtJywgJ2NvbnRleHRNZW51T25JdGVtJywgJ21vdXNlZG93bk9uSXRlbScsICdtb3VzZW1vdmVPbkl0ZW0nLCAnbW91c2V1cCcsICdyZWdpc3Rlckl0ZW1FbGVtZW50JyxcbiAgICAgICdyZW5kZXJCb2R5JywgJ29wZW5GaWxlJywgJ2Rpc2NhcmRDaGFuZ2VzJywgJ2FjdGl2YXRlTmV4dExpc3QnLCAnYWN0aXZhdGVQcmV2aW91c0xpc3QnLCAnYWN0aXZhdGVMYXN0TGlzdCcsXG4gICAgICAnc3RhZ2VBbGwnLCAndW5zdGFnZUFsbCcsICdzdGFnZUFsbE1lcmdlQ29uZmxpY3RzJywgJ2Rpc2NhcmRBbGwnLCAnY29uZmlybVNlbGVjdGVkSXRlbXMnLCAnc2VsZWN0QWxsJyxcbiAgICAgICdzZWxlY3RGaXJzdCcsICdzZWxlY3RMYXN0JywgJ2RpdmVJbnRvU2VsZWN0aW9uJywgJ3Nob3dEaWZmVmlldycsICdzaG93QnVsa1Jlc29sdmVNZW51JywgJ3Nob3dBY3Rpb25zTWVudScsXG4gICAgICAncmVzb2x2ZUN1cnJlbnRBc091cnMnLCAncmVzb2x2ZUN1cnJlbnRBc1RoZWlycycsICdxdWlldGx5U2VsZWN0SXRlbScsICdkaWRDaGFuZ2VTZWxlY3RlZEl0ZW1zJyxcbiAgICApO1xuXG4gICAgdGhpcy5zdWJzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdnaXRodWIua2V5Ym9hcmROYXZpZ2F0aW9uRGVsYXknLCB2YWx1ZSA9PiB7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuZGVib3VuY2VkRGlkQ2hhbmdlU2VsZWN0ZWRJdGVtID0gdGhpcy5kaWRDaGFuZ2VTZWxlY3RlZEl0ZW1zO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZGVib3VuY2VkRGlkQ2hhbmdlU2VsZWN0ZWRJdGVtID0gZGVib3VuY2UodGhpcy5kaWRDaGFuZ2VTZWxlY3RlZEl0ZW1zLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICk7XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgLi4uY2FsY3VsYXRlVHJ1bmNhdGVkTGlzdHMoe1xuICAgICAgICB1bnN0YWdlZENoYW5nZXM6IHRoaXMucHJvcHMudW5zdGFnZWRDaGFuZ2VzLFxuICAgICAgICBzdGFnZWRDaGFuZ2VzOiB0aGlzLnByb3BzLnN0YWdlZENoYW5nZXMsXG4gICAgICAgIG1lcmdlQ29uZmxpY3RzOiB0aGlzLnByb3BzLm1lcmdlQ29uZmxpY3RzLFxuICAgICAgfSksXG4gICAgICBzZWxlY3Rpb246IG5ldyBDb21wb3NpdGVMaXN0U2VsZWN0aW9uKHtcbiAgICAgICAgbGlzdHNCeUtleTogW1xuICAgICAgICAgIFsndW5zdGFnZWQnLCB0aGlzLnByb3BzLnVuc3RhZ2VkQ2hhbmdlc10sXG4gICAgICAgICAgWydjb25mbGljdHMnLCB0aGlzLnByb3BzLm1lcmdlQ29uZmxpY3RzXSxcbiAgICAgICAgICBbJ3N0YWdlZCcsIHRoaXMucHJvcHMuc3RhZ2VkQ2hhbmdlc10sXG4gICAgICAgIF0sXG4gICAgICAgIGlkRm9ySXRlbTogaXRlbSA9PiBpdGVtLmZpbGVQYXRoLFxuICAgICAgfSksXG4gICAgfTtcblxuICAgIHRoaXMubW91c2VTZWxlY3Rpb25JblByb2dyZXNzID0gZmFsc2U7XG4gICAgdGhpcy5saXN0RWxlbWVudHNCeUl0ZW0gPSBuZXcgV2Vha01hcCgpO1xuICAgIHRoaXMucmVmUm9vdCA9IG5ldyBSZWZIb2xkZXIoKTtcbiAgfVxuXG4gIHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMobmV4dFByb3BzLCBwcmV2U3RhdGUpIHtcbiAgICBsZXQgbmV4dFN0YXRlID0ge307XG5cbiAgICBpZiAoXG4gICAgICBbJ3Vuc3RhZ2VkQ2hhbmdlcycsICdzdGFnZWRDaGFuZ2VzJywgJ21lcmdlQ29uZmxpY3RzJ10uc29tZShrZXkgPT4gcHJldlN0YXRlLnNvdXJjZVtrZXldICE9PSBuZXh0UHJvcHNba2V5XSlcbiAgICApIHtcbiAgICAgIGNvbnN0IG5leHRMaXN0cyA9IGNhbGN1bGF0ZVRydW5jYXRlZExpc3RzKHtcbiAgICAgICAgdW5zdGFnZWRDaGFuZ2VzOiBuZXh0UHJvcHMudW5zdGFnZWRDaGFuZ2VzLFxuICAgICAgICBzdGFnZWRDaGFuZ2VzOiBuZXh0UHJvcHMuc3RhZ2VkQ2hhbmdlcyxcbiAgICAgICAgbWVyZ2VDb25mbGljdHM6IG5leHRQcm9wcy5tZXJnZUNvbmZsaWN0cyxcbiAgICAgIH0pO1xuXG4gICAgICBuZXh0U3RhdGUgPSB7XG4gICAgICAgIC4uLm5leHRMaXN0cyxcbiAgICAgICAgc2VsZWN0aW9uOiBwcmV2U3RhdGUuc2VsZWN0aW9uLnVwZGF0ZUxpc3RzKFtcbiAgICAgICAgICBbJ3Vuc3RhZ2VkJywgbmV4dExpc3RzLnVuc3RhZ2VkQ2hhbmdlc10sXG4gICAgICAgICAgWydjb25mbGljdHMnLCBuZXh0TGlzdHMubWVyZ2VDb25mbGljdHNdLFxuICAgICAgICAgIFsnc3RhZ2VkJywgbmV4dExpc3RzLnN0YWdlZENoYW5nZXNdLFxuICAgICAgICBdKSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5leHRTdGF0ZTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5tb3VzZXVwKTtcbiAgICB0aGlzLnN1YnMuYWRkKFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm1vdXNldXApKSxcbiAgICAgIHRoaXMucHJvcHMud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0oKCkgPT4ge1xuICAgICAgICB0aGlzLnN5bmNXaXRoV29ya3NwYWNlKCk7XG4gICAgICB9KSxcbiAgICApO1xuXG4gICAgaWYgKHRoaXMuaXNQb3B1bGF0ZWQodGhpcy5wcm9wcykpIHtcbiAgICAgIHRoaXMuc3luY1dpdGhXb3Jrc3BhY2UoKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcbiAgICBjb25zdCBpc1JlcG9TYW1lID0gcHJldlByb3BzLndvcmtpbmdEaXJlY3RvcnlQYXRoID09PSB0aGlzLnByb3BzLndvcmtpbmdEaXJlY3RvcnlQYXRoO1xuICAgIGNvbnN0IGhhc1NlbGVjdGlvbnNQcmVzZW50ID1cbiAgICAgIHByZXZTdGF0ZS5zZWxlY3Rpb24uZ2V0U2VsZWN0ZWRJdGVtcygpLnNpemUgPiAwICYmXG4gICAgICB0aGlzLnN0YXRlLnNlbGVjdGlvbi5nZXRTZWxlY3RlZEl0ZW1zKCkuc2l6ZSA+IDA7XG4gICAgY29uc3Qgc2VsZWN0aW9uQ2hhbmdlZCA9IHRoaXMuc3RhdGUuc2VsZWN0aW9uICE9PSBwcmV2U3RhdGUuc2VsZWN0aW9uO1xuXG4gICAgaWYgKGlzUmVwb1NhbWUgJiYgaGFzU2VsZWN0aW9uc1ByZXNlbnQgJiYgc2VsZWN0aW9uQ2hhbmdlZCkge1xuICAgICAgdGhpcy5kZWJvdW5jZWREaWRDaGFuZ2VTZWxlY3RlZEl0ZW0oKTtcbiAgICB9XG5cbiAgICBjb25zdCBoZWFkSXRlbSA9IHRoaXMuc3RhdGUuc2VsZWN0aW9uLmdldEhlYWRJdGVtKCk7XG4gICAgaWYgKGhlYWRJdGVtKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5saXN0RWxlbWVudHNCeUl0ZW0uZ2V0KGhlYWRJdGVtKTtcbiAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQuc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghdGhpcy5pc1BvcHVsYXRlZChwcmV2UHJvcHMpICYmIHRoaXMuaXNQb3B1bGF0ZWQodGhpcy5wcm9wcykpIHtcbiAgICAgIHRoaXMuc3luY1dpdGhXb3Jrc3BhY2UoKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxPYnNlcnZlTW9kZWwgbW9kZWw9e3RoaXMucHJvcHMucmVzb2x1dGlvblByb2dyZXNzfSBmZXRjaERhdGE9e25vb3B9PlxuICAgICAgICB7dGhpcy5yZW5kZXJCb2R5fVxuICAgICAgPC9PYnNlcnZlTW9kZWw+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlckJvZHkoKSB7XG4gICAgY29uc3Qgc2VsZWN0ZWRJdGVtcyA9IHRoaXMuc3RhdGUuc2VsZWN0aW9uLmdldFNlbGVjdGVkSXRlbXMoKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIHJlZj17dGhpcy5yZWZSb290LnNldHRlcn1cbiAgICAgICAgY2xhc3NOYW1lPXtgZ2l0aHViLVN0YWdpbmdWaWV3ICR7dGhpcy5zdGF0ZS5zZWxlY3Rpb24uZ2V0QWN0aXZlTGlzdEtleSgpfS1jaGFuZ2VzLWZvY3VzZWRgfVxuICAgICAgICB0YWJJbmRleD1cIi0xXCI+XG4gICAgICAgIHt0aGlzLnJlbmRlckNvbW1hbmRzKCl9XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgZ2l0aHViLVN0YWdpbmdWaWV3LWdyb3VwIGdpdGh1Yi1VbnN0YWdlZENoYW5nZXMgJHt0aGlzLmdldEZvY3VzQ2xhc3MoJ3Vuc3RhZ2VkJyl9YH0+XG4gICAgICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJnaXRodWItU3RhZ2luZ1ZpZXctaGVhZGVyXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpY29uIGljb24tbGlzdC11bm9yZGVyZWRcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZ2l0aHViLVN0YWdpbmdWaWV3LXRpdGxlXCI+VW5zdGFnZWQgQ2hhbmdlczwvc3Bhbj5cbiAgICAgICAgICAgIHt0aGlzLnJlbmRlckFjdGlvbnNNZW51KCl9XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImdpdGh1Yi1TdGFnaW5nVmlldy1oZWFkZXJCdXR0b24gaWNvbiBpY29uLW1vdmUtZG93blwiXG4gICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLnVuc3RhZ2VkQ2hhbmdlcy5sZW5ndGggPT09IDB9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuc3RhZ2VBbGx9PlN0YWdlIEFsbDwvYnV0dG9uPlxuICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2l0aHViLVN0YWdpbmdWaWV3LWxpc3QgZ2l0aHViLUZpbGVQYXRjaExpc3RWaWV3IGdpdGh1Yi1TdGFnaW5nVmlldy11bnN0YWdlZFwiPlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0aGlzLnN0YXRlLnVuc3RhZ2VkQ2hhbmdlcy5tYXAoZmlsZVBhdGNoID0+IChcbiAgICAgICAgICAgICAgICA8RmlsZVBhdGNoTGlzdEl0ZW1WaWV3XG4gICAgICAgICAgICAgICAgICBrZXk9e2ZpbGVQYXRjaC5maWxlUGF0aH1cbiAgICAgICAgICAgICAgICAgIHJlZ2lzdGVySXRlbUVsZW1lbnQ9e3RoaXMucmVnaXN0ZXJJdGVtRWxlbWVudH1cbiAgICAgICAgICAgICAgICAgIGZpbGVQYXRjaD17ZmlsZVBhdGNofVxuICAgICAgICAgICAgICAgICAgb25Eb3VibGVDbGljaz17ZXZlbnQgPT4gdGhpcy5kYmxjbGlja09uSXRlbShldmVudCwgZmlsZVBhdGNoKX1cbiAgICAgICAgICAgICAgICAgIG9uQ29udGV4dE1lbnU9e2V2ZW50ID0+IHRoaXMuY29udGV4dE1lbnVPbkl0ZW0oZXZlbnQsIGZpbGVQYXRjaCl9XG4gICAgICAgICAgICAgICAgICBvbk1vdXNlRG93bj17ZXZlbnQgPT4gdGhpcy5tb3VzZWRvd25Pbkl0ZW0oZXZlbnQsIGZpbGVQYXRjaCl9XG4gICAgICAgICAgICAgICAgICBvbk1vdXNlTW92ZT17ZXZlbnQgPT4gdGhpcy5tb3VzZW1vdmVPbkl0ZW0oZXZlbnQsIGZpbGVQYXRjaCl9XG4gICAgICAgICAgICAgICAgICBzZWxlY3RlZD17c2VsZWN0ZWRJdGVtcy5oYXMoZmlsZVBhdGNoKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHt0aGlzLnJlbmRlclRydW5jYXRlZE1lc3NhZ2UodGhpcy5wcm9wcy51bnN0YWdlZENoYW5nZXMpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge3RoaXMucmVuZGVyTWVyZ2VDb25mbGljdHMoKX1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BnaXRodWItU3RhZ2luZ1ZpZXctZ3JvdXAgZ2l0aHViLVN0YWdlZENoYW5nZXMgJHt0aGlzLmdldEZvY3VzQ2xhc3MoJ3N0YWdlZCcpfWB9ID5cbiAgICAgICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cImdpdGh1Yi1TdGFnaW5nVmlldy1oZWFkZXJcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gaWNvbi10YXNrbGlzdFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJnaXRodWItU3RhZ2luZ1ZpZXctdGl0bGVcIj5cbiAgICAgICAgICAgICAgU3RhZ2VkIENoYW5nZXNcbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiZ2l0aHViLVN0YWdpbmdWaWV3LWhlYWRlckJ1dHRvbiBpY29uIGljb24tbW92ZS11cFwiXG4gICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLnN0YWdlZENoYW5nZXMubGVuZ3RoID09PSAwfVxuICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnVuc3RhZ2VBbGx9PlVuc3RhZ2UgQWxsPC9idXR0b24+XG4gICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJnaXRodWItU3RhZ2luZ1ZpZXctbGlzdCBnaXRodWItRmlsZVBhdGNoTGlzdFZpZXcgZ2l0aHViLVN0YWdpbmdWaWV3LXN0YWdlZFwiPlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0aGlzLnN0YXRlLnN0YWdlZENoYW5nZXMubWFwKGZpbGVQYXRjaCA9PiAoXG4gICAgICAgICAgICAgICAgPEZpbGVQYXRjaExpc3RJdGVtVmlld1xuICAgICAgICAgICAgICAgICAga2V5PXtmaWxlUGF0Y2guZmlsZVBhdGh9XG4gICAgICAgICAgICAgICAgICBmaWxlUGF0Y2g9e2ZpbGVQYXRjaH1cbiAgICAgICAgICAgICAgICAgIHJlZ2lzdGVySXRlbUVsZW1lbnQ9e3RoaXMucmVnaXN0ZXJJdGVtRWxlbWVudH1cbiAgICAgICAgICAgICAgICAgIG9uRG91YmxlQ2xpY2s9e2V2ZW50ID0+IHRoaXMuZGJsY2xpY2tPbkl0ZW0oZXZlbnQsIGZpbGVQYXRjaCl9XG4gICAgICAgICAgICAgICAgICBvbkNvbnRleHRNZW51PXtldmVudCA9PiB0aGlzLmNvbnRleHRNZW51T25JdGVtKGV2ZW50LCBmaWxlUGF0Y2gpfVxuICAgICAgICAgICAgICAgICAgb25Nb3VzZURvd249e2V2ZW50ID0+IHRoaXMubW91c2Vkb3duT25JdGVtKGV2ZW50LCBmaWxlUGF0Y2gpfVxuICAgICAgICAgICAgICAgICAgb25Nb3VzZU1vdmU9e2V2ZW50ID0+IHRoaXMubW91c2Vtb3ZlT25JdGVtKGV2ZW50LCBmaWxlUGF0Y2gpfVxuICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkSXRlbXMuaGFzKGZpbGVQYXRjaCl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7dGhpcy5yZW5kZXJUcnVuY2F0ZWRNZXNzYWdlKHRoaXMucHJvcHMuc3RhZ2VkQ2hhbmdlcyl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlckNvbW1hbmRzKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8RnJhZ21lbnQ+XG4gICAgICAgIDxDb21tYW5kcyByZWdpc3RyeT17dGhpcy5wcm9wcy5jb21tYW5kc30gdGFyZ2V0PVwiLmdpdGh1Yi1TdGFnaW5nVmlld1wiPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJjb3JlOm1vdmUtdXBcIiBjYWxsYmFjaz17KCkgPT4gdGhpcy5zZWxlY3RQcmV2aW91cygpfSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJjb3JlOm1vdmUtZG93blwiIGNhbGxiYWNrPXsoKSA9PiB0aGlzLnNlbGVjdE5leHQoKX0gLz5cbiAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiY29yZTptb3ZlLWxlZnRcIiBjYWxsYmFjaz17dGhpcy5kaXZlSW50b1NlbGVjdGlvbn0gLz5cbiAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiZ2l0aHViOnNob3ctZGlmZi12aWV3XCIgY2FsbGJhY2s9e3RoaXMuc2hvd0RpZmZWaWV3fSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJjb3JlOnNlbGVjdC11cFwiIGNhbGxiYWNrPXsoKSA9PiB0aGlzLnNlbGVjdFByZXZpb3VzKHRydWUpfSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJjb3JlOnNlbGVjdC1kb3duXCIgY2FsbGJhY2s9eygpID0+IHRoaXMuc2VsZWN0TmV4dCh0cnVlKX0gLz5cbiAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiY29yZTpzZWxlY3QtYWxsXCIgY2FsbGJhY2s9e3RoaXMuc2VsZWN0QWxsfSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJjb3JlOm1vdmUtdG8tdG9wXCIgY2FsbGJhY2s9e3RoaXMuc2VsZWN0Rmlyc3R9IC8+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImNvcmU6bW92ZS10by1ib3R0b21cIiBjYWxsYmFjaz17dGhpcy5zZWxlY3RMYXN0fSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJjb3JlOnNlbGVjdC10by10b3BcIiBjYWxsYmFjaz17KCkgPT4gdGhpcy5zZWxlY3RGaXJzdCh0cnVlKX0gLz5cbiAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiY29yZTpzZWxlY3QtdG8tYm90dG9tXCIgY2FsbGJhY2s9eygpID0+IHRoaXMuc2VsZWN0TGFzdCh0cnVlKX0gLz5cbiAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiY29yZTpjb25maXJtXCIgY2FsbGJhY2s9e3RoaXMuY29uZmlybVNlbGVjdGVkSXRlbXN9IC8+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1YjphY3RpdmF0ZS1uZXh0LWxpc3RcIiBjYWxsYmFjaz17dGhpcy5hY3RpdmF0ZU5leHRMaXN0fSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6YWN0aXZhdGUtcHJldmlvdXMtbGlzdFwiIGNhbGxiYWNrPXt0aGlzLmFjdGl2YXRlUHJldmlvdXNMaXN0fSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6anVtcC10by1maWxlXCIgY2FsbGJhY2s9e3RoaXMub3BlbkZpbGV9IC8+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1YjpyZXNvbHZlLWZpbGUtYXMtb3Vyc1wiIGNhbGxiYWNrPXt0aGlzLnJlc29sdmVDdXJyZW50QXNPdXJzfSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6cmVzb2x2ZS1maWxlLWFzLXRoZWlyc1wiIGNhbGxiYWNrPXt0aGlzLnJlc29sdmVDdXJyZW50QXNUaGVpcnN9IC8+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1YjpkaXNjYXJkLWNoYW5nZXMtaW4tc2VsZWN0ZWQtZmlsZXNcIiBjYWxsYmFjaz17dGhpcy5kaXNjYXJkQ2hhbmdlc0Zyb21Db21tYW5kfSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJjb3JlOnVuZG9cIiBjYWxsYmFjaz17dGhpcy51bmRvTGFzdERpc2NhcmRGcm9tQ29yZVVuZG99IC8+XG4gICAgICAgIDwvQ29tbWFuZHM+XG4gICAgICAgIDxDb21tYW5kcyByZWdpc3RyeT17dGhpcy5wcm9wcy5jb21tYW5kc30gdGFyZ2V0PVwiYXRvbS13b3Jrc3BhY2VcIj5cbiAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiZ2l0aHViOnN0YWdlLWFsbC1jaGFuZ2VzXCIgY2FsbGJhY2s9e3RoaXMuc3RhZ2VBbGx9IC8+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1Yjp1bnN0YWdlLWFsbC1jaGFuZ2VzXCIgY2FsbGJhY2s9e3RoaXMudW5zdGFnZUFsbH0gLz5cbiAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiZ2l0aHViOmRpc2NhcmQtYWxsLWNoYW5nZXNcIiBjYWxsYmFjaz17dGhpcy5kaXNjYXJkQWxsRnJvbUNvbW1hbmR9IC8+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1Yjp1bmRvLWxhc3QtZGlzY2FyZC1pbi1naXQtdGFiXCJcbiAgICAgICAgICAgIGNhbGxiYWNrPXt0aGlzLnVuZG9MYXN0RGlzY2FyZEZyb21Db21tYW5kfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvQ29tbWFuZHM+XG4gICAgICA8L0ZyYWdtZW50PlxuICAgICk7XG4gIH1cblxuICB1bmRvTGFzdERpc2NhcmRGcm9tQ29yZVVuZG8gPSAoKSA9PiB7XG4gICAgdGhpcy51bmRvTGFzdERpc2NhcmQoe2V2ZW50U291cmNlOiB7Y29tbWFuZDogJ2NvcmU6dW5kbyd9fSk7XG4gIH1cblxuICB1bmRvTGFzdERpc2NhcmRGcm9tQ29tbWFuZCA9ICgpID0+IHtcbiAgICB0aGlzLnVuZG9MYXN0RGlzY2FyZCh7ZXZlbnRTb3VyY2U6IHtjb21tYW5kOiAnZ2l0aHViOnVuZG8tbGFzdC1kaXNjYXJkLWluLWdpdC10YWInfX0pO1xuICB9XG5cbiAgdW5kb0xhc3REaXNjYXJkRnJvbUJ1dHRvbiA9ICgpID0+IHtcbiAgICB0aGlzLnVuZG9MYXN0RGlzY2FyZCh7ZXZlbnRTb3VyY2U6ICdidXR0b24nfSk7XG4gIH1cblxuICB1bmRvTGFzdERpc2NhcmRGcm9tSGVhZGVyTWVudSA9ICgpID0+IHtcbiAgICB0aGlzLnVuZG9MYXN0RGlzY2FyZCh7ZXZlbnRTb3VyY2U6ICdoZWFkZXItbWVudSd9KTtcbiAgfVxuXG4gIGRpc2NhcmRDaGFuZ2VzRnJvbUNvbW1hbmQgPSAoKSA9PiB7XG4gICAgdGhpcy5kaXNjYXJkQ2hhbmdlcyh7ZXZlbnRTb3VyY2U6IHtjb21tYW5kOiAnZ2l0aHViOmRpc2NhcmQtY2hhbmdlcy1pbi1zZWxlY3RlZC1maWxlcyd9fSk7XG4gIH1cblxuICBkaXNjYXJkQWxsRnJvbUNvbW1hbmQgPSAoKSA9PiB7XG4gICAgdGhpcy5kaXNjYXJkQWxsKHtldmVudFNvdXJjZToge2NvbW1hbmQ6ICdnaXRodWI6ZGlzY2FyZC1hbGwtY2hhbmdlcyd9fSk7XG4gIH1cblxuICByZW5kZXJBY3Rpb25zTWVudSgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy51bnN0YWdlZENoYW5nZXMubGVuZ3RoIHx8IHRoaXMucHJvcHMuaGFzVW5kb0hpc3RvcnkpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBjbGFzc05hbWU9XCJnaXRodWItU3RhZ2luZ1ZpZXctaGVhZGVyQnV0dG9uIGdpdGh1Yi1TdGFnaW5nVmlldy1oZWFkZXJCdXR0b24tLWljb25Pbmx5IGljb24gaWNvbi1lbGxpcHNlc1wiXG4gICAgICAgICAgb25DbGljaz17dGhpcy5zaG93QWN0aW9uc01lbnV9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICByZW5kZXJVbmRvQnV0dG9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImdpdGh1Yi1TdGFnaW5nVmlldy1oZWFkZXJCdXR0b24gZ2l0aHViLVN0YWdpbmdWaWV3LWhlYWRlckJ1dHRvbi0tZnVsbFdpZHRoIGljb24gaWNvbi1oaXN0b3J5XCJcbiAgICAgICAgb25DbGljaz17dGhpcy51bmRvTGFzdERpc2NhcmRGcm9tQnV0dG9ufT5VbmRvIERpc2NhcmQ8L2J1dHRvbj5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyVHJ1bmNhdGVkTWVzc2FnZShsaXN0KSB7XG4gICAgaWYgKGxpc3QubGVuZ3RoID4gTUFYSU1VTV9MSVNURURfRU5UUklFUykge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJnaXRodWItU3RhZ2luZ1ZpZXctZ3JvdXAtdHJ1bmNhdGVkTXNnXCI+XG4gICAgICAgICAgTGlzdCB0cnVuY2F0ZWQgdG8gdGhlIGZpcnN0IHtNQVhJTVVNX0xJU1RFRF9FTlRSSUVTfSBpdGVtc1xuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlck1lcmdlQ29uZmxpY3RzKCkge1xuICAgIGNvbnN0IG1lcmdlQ29uZmxpY3RzID0gdGhpcy5zdGF0ZS5tZXJnZUNvbmZsaWN0cztcblxuICAgIGlmIChtZXJnZUNvbmZsaWN0cyAmJiBtZXJnZUNvbmZsaWN0cy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBzZWxlY3RlZEl0ZW1zID0gdGhpcy5zdGF0ZS5zZWxlY3Rpb24uZ2V0U2VsZWN0ZWRJdGVtcygpO1xuICAgICAgY29uc3QgcmVzb2x1dGlvblByb2dyZXNzID0gdGhpcy5wcm9wcy5yZXNvbHV0aW9uUHJvZ3Jlc3M7XG4gICAgICBjb25zdCBhbnlVbnJlc29sdmVkID0gbWVyZ2VDb25mbGljdHNcbiAgICAgICAgLm1hcChjb25mbGljdCA9PiBwYXRoLmpvaW4odGhpcy5wcm9wcy53b3JraW5nRGlyZWN0b3J5UGF0aCwgY29uZmxpY3QuZmlsZVBhdGgpKVxuICAgICAgICAuc29tZShjb25mbGljdFBhdGggPT4gcmVzb2x1dGlvblByb2dyZXNzLmdldFJlbWFpbmluZyhjb25mbGljdFBhdGgpICE9PSAwKTtcblxuICAgICAgY29uc3QgYnVsa1Jlc29sdmVEcm9wZG93biA9IGFueVVucmVzb2x2ZWQgPyAoXG4gICAgICAgIDxzcGFuXG4gICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrIGljb24gaWNvbi1lbGxpcHNlc1wiXG4gICAgICAgICAgb25DbGljaz17dGhpcy5zaG93QnVsa1Jlc29sdmVNZW51fVxuICAgICAgICAvPlxuICAgICAgKSA6IG51bGw7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgZ2l0aHViLVN0YWdpbmdWaWV3LWdyb3VwIGdpdGh1Yi1NZXJnZUNvbmZsaWN0UGF0aHMgJHt0aGlzLmdldEZvY3VzQ2xhc3MoJ2NvbmZsaWN0cycpfWB9PlxuICAgICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwiZ2l0aHViLVN0YWdpbmdWaWV3LWhlYWRlclwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXsnZ2l0aHViLUZpbGVQYXRjaExpc3RWaWV3LWljb24gaWNvbiBpY29uLWFsZXJ0IHN0YXR1cy1tb2RpZmllZCd9IC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJnaXRodWItU3RhZ2luZ1ZpZXctdGl0bGVcIj5NZXJnZSBDb25mbGljdHM8L3NwYW4+XG4gICAgICAgICAgICB7YnVsa1Jlc29sdmVEcm9wZG93bn1cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZ2l0aHViLVN0YWdpbmdWaWV3LWhlYWRlckJ1dHRvbiBpY29uIGljb24tbW92ZS1kb3duXCJcbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e2FueVVucmVzb2x2ZWR9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuc3RhZ2VBbGxNZXJnZUNvbmZsaWN0c30+XG4gICAgICAgICAgICAgIFN0YWdlIEFsbFxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJnaXRodWItU3RhZ2luZ1ZpZXctbGlzdCBnaXRodWItRmlsZVBhdGNoTGlzdFZpZXcgZ2l0aHViLVN0YWdpbmdWaWV3LW1lcmdlXCI+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG1lcmdlQ29uZmxpY3RzLm1hcChtZXJnZUNvbmZsaWN0ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGguam9pbih0aGlzLnByb3BzLndvcmtpbmdEaXJlY3RvcnlQYXRoLCBtZXJnZUNvbmZsaWN0LmZpbGVQYXRoKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICA8TWVyZ2VDb25mbGljdExpc3RJdGVtVmlld1xuICAgICAgICAgICAgICAgICAgICBrZXk9e2Z1bGxQYXRofVxuICAgICAgICAgICAgICAgICAgICBtZXJnZUNvbmZsaWN0PXttZXJnZUNvbmZsaWN0fVxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmdDb25mbGljdHM9e3Jlc29sdXRpb25Qcm9ncmVzcy5nZXRSZW1haW5pbmcoZnVsbFBhdGgpfVxuICAgICAgICAgICAgICAgICAgICByZWdpc3Rlckl0ZW1FbGVtZW50PXt0aGlzLnJlZ2lzdGVySXRlbUVsZW1lbnR9XG4gICAgICAgICAgICAgICAgICAgIG9uRG91YmxlQ2xpY2s9e2V2ZW50ID0+IHRoaXMuZGJsY2xpY2tPbkl0ZW0oZXZlbnQsIG1lcmdlQ29uZmxpY3QpfVxuICAgICAgICAgICAgICAgICAgICBvbkNvbnRleHRNZW51PXtldmVudCA9PiB0aGlzLmNvbnRleHRNZW51T25JdGVtKGV2ZW50LCBtZXJnZUNvbmZsaWN0KX1cbiAgICAgICAgICAgICAgICAgICAgb25Nb3VzZURvd249e2V2ZW50ID0+IHRoaXMubW91c2Vkb3duT25JdGVtKGV2ZW50LCBtZXJnZUNvbmZsaWN0KX1cbiAgICAgICAgICAgICAgICAgICAgb25Nb3VzZU1vdmU9e2V2ZW50ID0+IHRoaXMubW91c2Vtb3ZlT25JdGVtKGV2ZW50LCBtZXJnZUNvbmZsaWN0KX1cbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkSXRlbXMuaGFzKG1lcmdlQ29uZmxpY3QpfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHt0aGlzLnJlbmRlclRydW5jYXRlZE1lc3NhZ2UobWVyZ2VDb25mbGljdHMpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiA8bm9zY3JpcHQgLz47XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5zdWJzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGdldFNlbGVjdGVkSXRlbUZpbGVQYXRocygpIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLnN0YXRlLnNlbGVjdGlvbi5nZXRTZWxlY3RlZEl0ZW1zKCksIGl0ZW0gPT4gaXRlbS5maWxlUGF0aCk7XG4gIH1cblxuICBnZXRTZWxlY3RlZENvbmZsaWN0UGF0aHMoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0aW9uLmdldEFjdGl2ZUxpc3RLZXkoKSAhPT0gJ2NvbmZsaWN0cycpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2VsZWN0ZWRJdGVtRmlsZVBhdGhzKCk7XG4gIH1cblxuICBvcGVuRmlsZSgpIHtcbiAgICBjb25zdCBmaWxlUGF0aHMgPSB0aGlzLmdldFNlbGVjdGVkSXRlbUZpbGVQYXRocygpO1xuICAgIHJldHVybiB0aGlzLnByb3BzLm9wZW5GaWxlcyhmaWxlUGF0aHMpO1xuICB9XG5cbiAgZGlzY2FyZENoYW5nZXMoe2V2ZW50U291cmNlfSA9IHt9KSB7XG4gICAgY29uc3QgZmlsZVBhdGhzID0gdGhpcy5nZXRTZWxlY3RlZEl0ZW1GaWxlUGF0aHMoKTtcbiAgICBhZGRFdmVudCgnZGlzY2FyZC11bnN0YWdlZC1jaGFuZ2VzJywge1xuICAgICAgcGFja2FnZTogJ2dpdGh1YicsXG4gICAgICBjb21wb25lbnQ6ICdTdGFnaW5nVmlldycsXG4gICAgICBmaWxlQ291bnQ6IGZpbGVQYXRocy5sZW5ndGgsXG4gICAgICB0eXBlOiAnc2VsZWN0ZWQnLFxuICAgICAgZXZlbnRTb3VyY2UsXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuZGlzY2FyZFdvcmtEaXJDaGFuZ2VzRm9yUGF0aHMoZmlsZVBhdGhzKTtcbiAgfVxuXG4gIGFjdGl2YXRlTmV4dExpc3QoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgbGV0IGFkdmFuY2VkID0gZmFsc2U7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUocHJldlN0YXRlID0+IHtcbiAgICAgICAgY29uc3QgbmV4dCA9IHByZXZTdGF0ZS5zZWxlY3Rpb24uYWN0aXZhdGVOZXh0U2VsZWN0aW9uKCk7XG4gICAgICAgIGlmIChwcmV2U3RhdGUuc2VsZWN0aW9uID09PSBuZXh0KSB7XG4gICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgYWR2YW5jZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4ge3NlbGVjdGlvbjogbmV4dC5jb2FsZXNjZSgpfTtcbiAgICAgIH0sICgpID0+IHJlc29sdmUoYWR2YW5jZWQpKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFjdGl2YXRlUHJldmlvdXNMaXN0KCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGxldCByZXRyZWF0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuc2V0U3RhdGUocHJldlN0YXRlID0+IHtcbiAgICAgICAgY29uc3QgbmV4dCA9IHByZXZTdGF0ZS5zZWxlY3Rpb24uYWN0aXZhdGVQcmV2aW91c1NlbGVjdGlvbigpO1xuICAgICAgICBpZiAocHJldlN0YXRlLnNlbGVjdGlvbiA9PT0gbmV4dCkge1xuICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHJlYXRlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiB7c2VsZWN0aW9uOiBuZXh0LmNvYWxlc2NlKCl9O1xuICAgICAgfSwgKCkgPT4gcmVzb2x2ZShyZXRyZWF0ZWQpKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFjdGl2YXRlTGFzdExpc3QoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgbGV0IGVtcHR5U2VsZWN0aW9uID0gZmFsc2U7XG4gICAgICB0aGlzLnNldFN0YXRlKHByZXZTdGF0ZSA9PiB7XG4gICAgICAgIGNvbnN0IG5leHQgPSBwcmV2U3RhdGUuc2VsZWN0aW9uLmFjdGl2YXRlTGFzdFNlbGVjdGlvbigpO1xuICAgICAgICBlbXB0eVNlbGVjdGlvbiA9IG5leHQuZ2V0U2VsZWN0ZWRJdGVtcygpLnNpemUgPiAwO1xuXG4gICAgICAgIGlmIChwcmV2U3RhdGUuc2VsZWN0aW9uID09PSBuZXh0KSB7XG4gICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtzZWxlY3Rpb246IG5leHQuY29hbGVzY2UoKX07XG4gICAgICB9LCAoKSA9PiByZXNvbHZlKGVtcHR5U2VsZWN0aW9uKSk7XG4gICAgfSk7XG4gIH1cblxuICBzdGFnZUFsbCgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy51bnN0YWdlZENoYW5nZXMubGVuZ3RoID09PSAwKSB7IHJldHVybiBudWxsOyB9XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuYXR0ZW1wdFN0YWdlQWxsT3BlcmF0aW9uKCd1bnN0YWdlZCcpO1xuICB9XG5cbiAgdW5zdGFnZUFsbCgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5zdGFnZWRDaGFuZ2VzLmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gbnVsbDsgfVxuICAgIHJldHVybiB0aGlzLnByb3BzLmF0dGVtcHRTdGFnZUFsbE9wZXJhdGlvbignc3RhZ2VkJyk7XG4gIH1cblxuICBzdGFnZUFsbE1lcmdlQ29uZmxpY3RzKCkge1xuICAgIGlmICh0aGlzLnByb3BzLm1lcmdlQ29uZmxpY3RzLmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gbnVsbDsgfVxuICAgIGNvbnN0IGZpbGVQYXRocyA9IHRoaXMucHJvcHMubWVyZ2VDb25mbGljdHMubWFwKGNvbmZsaWN0ID0+IGNvbmZsaWN0LmZpbGVQYXRoKTtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5hdHRlbXB0RmlsZVN0YWdlT3BlcmF0aW9uKGZpbGVQYXRocywgJ3Vuc3RhZ2VkJyk7XG4gIH1cblxuICBkaXNjYXJkQWxsKHtldmVudFNvdXJjZX0gPSB7fSkge1xuICAgIGlmICh0aGlzLnByb3BzLnVuc3RhZ2VkQ2hhbmdlcy5sZW5ndGggPT09IDApIHsgcmV0dXJuIG51bGw7IH1cbiAgICBjb25zdCBmaWxlUGF0aHMgPSB0aGlzLnByb3BzLnVuc3RhZ2VkQ2hhbmdlcy5tYXAoZmlsZVBhdGNoID0+IGZpbGVQYXRjaC5maWxlUGF0aCk7XG4gICAgYWRkRXZlbnQoJ2Rpc2NhcmQtdW5zdGFnZWQtY2hhbmdlcycsIHtcbiAgICAgIHBhY2thZ2U6ICdnaXRodWInLFxuICAgICAgY29tcG9uZW50OiAnU3RhZ2luZ1ZpZXcnLFxuICAgICAgZmlsZUNvdW50OiBmaWxlUGF0aHMubGVuZ3RoLFxuICAgICAgdHlwZTogJ2FsbCcsXG4gICAgICBldmVudFNvdXJjZSxcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5kaXNjYXJkV29ya0RpckNoYW5nZXNGb3JQYXRocyhmaWxlUGF0aHMpO1xuICB9XG5cbiAgY29uZmlybVNlbGVjdGVkSXRlbXMgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgaXRlbVBhdGhzID0gdGhpcy5nZXRTZWxlY3RlZEl0ZW1GaWxlUGF0aHMoKTtcbiAgICBhd2FpdCB0aGlzLnByb3BzLmF0dGVtcHRGaWxlU3RhZ2VPcGVyYXRpb24oaXRlbVBhdGhzLCB0aGlzLnN0YXRlLnNlbGVjdGlvbi5nZXRBY3RpdmVMaXN0S2V5KCkpO1xuICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZShwcmV2U3RhdGUgPT4gKHtzZWxlY3Rpb246IHByZXZTdGF0ZS5zZWxlY3Rpb24uY29hbGVzY2UoKX0pLCByZXNvbHZlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldE5leHRMaXN0VXBkYXRlUHJvbWlzZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5zZWxlY3Rpb24uZ2V0TmV4dFVwZGF0ZVByb21pc2UoKTtcbiAgfVxuXG4gIHNlbGVjdFByZXZpb3VzKHByZXNlcnZlVGFpbCA9IGZhbHNlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZShwcmV2U3RhdGUgPT4gKHtcbiAgICAgICAgc2VsZWN0aW9uOiBwcmV2U3RhdGUuc2VsZWN0aW9uLnNlbGVjdFByZXZpb3VzSXRlbShwcmVzZXJ2ZVRhaWwpLmNvYWxlc2NlKCksXG4gICAgICB9KSwgcmVzb2x2ZSk7XG4gICAgfSk7XG4gIH1cblxuICBzZWxlY3ROZXh0KHByZXNlcnZlVGFpbCA9IGZhbHNlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZShwcmV2U3RhdGUgPT4gKHtcbiAgICAgICAgc2VsZWN0aW9uOiBwcmV2U3RhdGUuc2VsZWN0aW9uLnNlbGVjdE5leHRJdGVtKHByZXNlcnZlVGFpbCkuY29hbGVzY2UoKSxcbiAgICAgIH0pLCByZXNvbHZlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHNlbGVjdEFsbCgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHByZXZTdGF0ZSA9PiAoe1xuICAgICAgICBzZWxlY3Rpb246IHByZXZTdGF0ZS5zZWxlY3Rpb24uc2VsZWN0QWxsSXRlbXMoKS5jb2FsZXNjZSgpLFxuICAgICAgfSksIHJlc29sdmUpO1xuICAgIH0pO1xuICB9XG5cbiAgc2VsZWN0Rmlyc3QocHJlc2VydmVUYWlsID0gZmFsc2UpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHByZXZTdGF0ZSA9PiAoe1xuICAgICAgICBzZWxlY3Rpb246IHByZXZTdGF0ZS5zZWxlY3Rpb24uc2VsZWN0Rmlyc3RJdGVtKHByZXNlcnZlVGFpbCkuY29hbGVzY2UoKSxcbiAgICAgIH0pLCByZXNvbHZlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHNlbGVjdExhc3QocHJlc2VydmVUYWlsID0gZmFsc2UpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHByZXZTdGF0ZSA9PiAoe1xuICAgICAgICBzZWxlY3Rpb246IHByZXZTdGF0ZS5zZWxlY3Rpb24uc2VsZWN0TGFzdEl0ZW0ocHJlc2VydmVUYWlsKS5jb2FsZXNjZSgpLFxuICAgICAgfSksIHJlc29sdmUpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZGl2ZUludG9TZWxlY3Rpb24oKSB7XG4gICAgY29uc3Qgc2VsZWN0ZWRJdGVtcyA9IHRoaXMuc3RhdGUuc2VsZWN0aW9uLmdldFNlbGVjdGVkSXRlbXMoKTtcbiAgICBpZiAoc2VsZWN0ZWRJdGVtcy5zaXplICE9PSAxKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc2VsZWN0ZWRJdGVtID0gc2VsZWN0ZWRJdGVtcy52YWx1ZXMoKS5uZXh0KCkudmFsdWU7XG4gICAgY29uc3Qgc3RhZ2luZ1N0YXR1cyA9IHRoaXMuc3RhdGUuc2VsZWN0aW9uLmdldEFjdGl2ZUxpc3RLZXkoKTtcblxuICAgIGlmIChzdGFnaW5nU3RhdHVzID09PSAnY29uZmxpY3RzJykge1xuICAgICAgdGhpcy5zaG93TWVyZ2VDb25mbGljdEZpbGVGb3JQYXRoKHNlbGVjdGVkSXRlbS5maWxlUGF0aCwge2FjdGl2YXRlOiB0cnVlfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IHRoaXMuc2hvd0ZpbGVQYXRjaEl0ZW0oc2VsZWN0ZWRJdGVtLmZpbGVQYXRoLCB0aGlzLnN0YXRlLnNlbGVjdGlvbi5nZXRBY3RpdmVMaXN0S2V5KCksIHthY3RpdmF0ZTogdHJ1ZX0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHN5bmNXaXRoV29ya3NwYWNlKCkge1xuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLnByb3BzLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpO1xuICAgIGlmICghaXRlbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHJlYWxJdGVtUHJvbWlzZSA9IGl0ZW0uZ2V0UmVhbEl0ZW1Qcm9taXNlICYmIGl0ZW0uZ2V0UmVhbEl0ZW1Qcm9taXNlKCk7XG4gICAgY29uc3QgcmVhbEl0ZW0gPSBhd2FpdCByZWFsSXRlbVByb21pc2U7XG4gICAgaWYgKCFyZWFsSXRlbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGlzRmlsZVBhdGNoSXRlbSA9IHJlYWxJdGVtLmlzRmlsZVBhdGNoSXRlbSAmJiByZWFsSXRlbS5pc0ZpbGVQYXRjaEl0ZW0oKTtcbiAgICBjb25zdCBpc01hdGNoID0gcmVhbEl0ZW0uZ2V0V29ya2luZ0RpcmVjdG9yeSAmJiByZWFsSXRlbS5nZXRXb3JraW5nRGlyZWN0b3J5KCkgPT09IHRoaXMucHJvcHMud29ya2luZ0RpcmVjdG9yeVBhdGg7XG5cbiAgICBpZiAoaXNGaWxlUGF0Y2hJdGVtICYmIGlzTWF0Y2gpIHtcbiAgICAgIHRoaXMucXVpZXRseVNlbGVjdEl0ZW0ocmVhbEl0ZW0uZ2V0RmlsZVBhdGgoKSwgcmVhbEl0ZW0uZ2V0U3RhZ2luZ1N0YXR1cygpKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzaG93RGlmZlZpZXcoKSB7XG4gICAgY29uc3Qgc2VsZWN0ZWRJdGVtcyA9IHRoaXMuc3RhdGUuc2VsZWN0aW9uLmdldFNlbGVjdGVkSXRlbXMoKTtcbiAgICBpZiAoc2VsZWN0ZWRJdGVtcy5zaXplICE9PSAxKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc2VsZWN0ZWRJdGVtID0gc2VsZWN0ZWRJdGVtcy52YWx1ZXMoKS5uZXh0KCkudmFsdWU7XG4gICAgY29uc3Qgc3RhZ2luZ1N0YXR1cyA9IHRoaXMuc3RhdGUuc2VsZWN0aW9uLmdldEFjdGl2ZUxpc3RLZXkoKTtcblxuICAgIGlmIChzdGFnaW5nU3RhdHVzID09PSAnY29uZmxpY3RzJykge1xuICAgICAgdGhpcy5zaG93TWVyZ2VDb25mbGljdEZpbGVGb3JQYXRoKHNlbGVjdGVkSXRlbS5maWxlUGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IHRoaXMuc2hvd0ZpbGVQYXRjaEl0ZW0oc2VsZWN0ZWRJdGVtLmZpbGVQYXRoLCB0aGlzLnN0YXRlLnNlbGVjdGlvbi5nZXRBY3RpdmVMaXN0S2V5KCkpO1xuICAgIH1cbiAgfVxuXG4gIHNob3dCdWxrUmVzb2x2ZU1lbnUoZXZlbnQpIHtcbiAgICBjb25zdCBjb25mbGljdFBhdGhzID0gdGhpcy5wcm9wcy5tZXJnZUNvbmZsaWN0cy5tYXAoYyA9PiBjLmZpbGVQYXRoKTtcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBjb25zdCBtZW51ID0gbmV3IE1lbnUoKTtcblxuICAgIG1lbnUuYXBwZW5kKG5ldyBNZW51SXRlbSh7XG4gICAgICBsYWJlbDogJ1Jlc29sdmUgQWxsIGFzIE91cnMnLFxuICAgICAgY2xpY2s6ICgpID0+IHRoaXMucHJvcHMucmVzb2x2ZUFzT3Vycyhjb25mbGljdFBhdGhzKSxcbiAgICB9KSk7XG5cbiAgICBtZW51LmFwcGVuZChuZXcgTWVudUl0ZW0oe1xuICAgICAgbGFiZWw6ICdSZXNvbHZlIEFsbCBhcyBUaGVpcnMnLFxuICAgICAgY2xpY2s6ICgpID0+IHRoaXMucHJvcHMucmVzb2x2ZUFzVGhlaXJzKGNvbmZsaWN0UGF0aHMpLFxuICAgIH0pKTtcblxuICAgIG1lbnUucG9wdXAocmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKSk7XG4gIH1cblxuICBzaG93QWN0aW9uc01lbnUoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgY29uc3QgbWVudSA9IG5ldyBNZW51KCk7XG5cbiAgICBjb25zdCBzZWxlY3RlZEl0ZW1Db3VudCA9IHRoaXMuc3RhdGUuc2VsZWN0aW9uLmdldFNlbGVjdGVkSXRlbXMoKS5zaXplO1xuICAgIGNvbnN0IHBsdXJhbGl6YXRpb24gPSBzZWxlY3RlZEl0ZW1Db3VudCA+IDEgPyAncycgOiAnJztcblxuICAgIG1lbnUuYXBwZW5kKG5ldyBNZW51SXRlbSh7XG4gICAgICBsYWJlbDogJ0Rpc2NhcmQgQWxsIENoYW5nZXMnLFxuICAgICAgY2xpY2s6ICgpID0+IHRoaXMuZGlzY2FyZEFsbCh7ZXZlbnRTb3VyY2U6ICdoZWFkZXItbWVudSd9KSxcbiAgICAgIGVuYWJsZWQ6IHRoaXMucHJvcHMudW5zdGFnZWRDaGFuZ2VzLmxlbmd0aCA+IDAsXG4gICAgfSkpO1xuXG4gICAgbWVudS5hcHBlbmQobmV3IE1lbnVJdGVtKHtcbiAgICAgIGxhYmVsOiAnRGlzY2FyZCBDaGFuZ2VzIGluIFNlbGVjdGVkIEZpbGUnICsgcGx1cmFsaXphdGlvbixcbiAgICAgIGNsaWNrOiAoKSA9PiB0aGlzLmRpc2NhcmRDaGFuZ2VzKHtldmVudFNvdXJjZTogJ2hlYWRlci1tZW51J30pLFxuICAgICAgZW5hYmxlZDogISEodGhpcy5wcm9wcy51bnN0YWdlZENoYW5nZXMubGVuZ3RoICYmIHNlbGVjdGVkSXRlbUNvdW50KSxcbiAgICB9KSk7XG5cbiAgICBtZW51LmFwcGVuZChuZXcgTWVudUl0ZW0oe1xuICAgICAgbGFiZWw6ICdVbmRvIExhc3QgRGlzY2FyZCcsXG4gICAgICBjbGljazogKCkgPT4gdGhpcy51bmRvTGFzdERpc2NhcmQoe2V2ZW50U291cmNlOiAnaGVhZGVyLW1lbnUnfSksXG4gICAgICBlbmFibGVkOiB0aGlzLnByb3BzLmhhc1VuZG9IaXN0b3J5LFxuICAgIH0pKTtcblxuICAgIG1lbnUucG9wdXAocmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKSk7XG4gIH1cblxuICByZXNvbHZlQ3VycmVudEFzT3VycygpIHtcbiAgICB0aGlzLnByb3BzLnJlc29sdmVBc091cnModGhpcy5nZXRTZWxlY3RlZENvbmZsaWN0UGF0aHMoKSk7XG4gIH1cblxuICByZXNvbHZlQ3VycmVudEFzVGhlaXJzKCkge1xuICAgIHRoaXMucHJvcHMucmVzb2x2ZUFzVGhlaXJzKHRoaXMuZ2V0U2VsZWN0ZWRDb25mbGljdFBhdGhzKCkpO1xuICB9XG5cbiAgLy8gRGlyZWN0bHkgbW9kaWZ5IHRoZSBzZWxlY3Rpb24gdG8gaW5jbHVkZSBvbmx5IHRoZSBpdGVtIGlkZW50aWZpZWQgYnkgdGhlIGZpbGUgcGF0aCBhbmQgc3RhZ2luZ1N0YXR1cyB0dXBsZS5cbiAgLy8gUmUtcmVuZGVyIHRoZSBjb21wb25lbnQsIGJ1dCBkb24ndCBub3RpZnkgZGlkU2VsZWN0U2luZ2xlSXRlbSgpIG9yIG90aGVyIGNhbGxiYWNrIGZ1bmN0aW9ucy4gVGhpcyBpcyB1c2VmdWwgdG9cbiAgLy8gYXZvaWQgY2lyY3VsYXIgY2FsbGJhY2sgbG9vcHMgZm9yIGFjdGlvbnMgb3JpZ2luYXRpbmcgaW4gRmlsZVBhdGNoVmlldyBvciBUZXh0RWRpdG9ycyB3aXRoIG1lcmdlIGNvbmZsaWN0cy5cbiAgcXVpZXRseVNlbGVjdEl0ZW0oZmlsZVBhdGgsIHN0YWdpbmdTdGF0dXMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHByZXZTdGF0ZSA9PiB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBwcmV2U3RhdGUuc2VsZWN0aW9uLmZpbmRJdGVtKChlYWNoLCBrZXkpID0+IGVhY2guZmlsZVBhdGggPT09IGZpbGVQYXRoICYmIGtleSA9PT0gc3RhZ2luZ1N0YXR1cyk7XG4gICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgIC8vIEZJWE1FOiBtYWtlIHN0YWdpbmcgdmlldyBkaXNwbGF5IG5vIHNlbGVjdGVkIGl0ZW1cbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGNvbnNvbGUubG9nKGBVbmFibGUgdG8gZmluZCBpdGVtIGF0IHBhdGggJHtmaWxlUGF0aH0gd2l0aCBzdGFnaW5nIHN0YXR1cyAke3N0YWdpbmdTdGF0dXN9YCk7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge3NlbGVjdGlvbjogcHJldlN0YXRlLnNlbGVjdGlvbi5zZWxlY3RJdGVtKGl0ZW0pfTtcbiAgICAgIH0sIHJlc29sdmUpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0U2VsZWN0ZWRJdGVtcygpIHtcbiAgICBjb25zdCBzdGFnaW5nU3RhdHVzID0gdGhpcy5zdGF0ZS5zZWxlY3Rpb24uZ2V0QWN0aXZlTGlzdEtleSgpO1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuc3RhdGUuc2VsZWN0aW9uLmdldFNlbGVjdGVkSXRlbXMoKSwgaXRlbSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBmaWxlUGF0aDogaXRlbS5maWxlUGF0aCxcbiAgICAgICAgc3RhZ2luZ1N0YXR1cyxcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBkaWRDaGFuZ2VTZWxlY3RlZEl0ZW1zKG9wZW5OZXcpIHtcbiAgICBjb25zdCBzZWxlY3RlZEl0ZW1zID0gQXJyYXkuZnJvbSh0aGlzLnN0YXRlLnNlbGVjdGlvbi5nZXRTZWxlY3RlZEl0ZW1zKCkpO1xuICAgIGlmIChzZWxlY3RlZEl0ZW1zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdGhpcy5kaWRTZWxlY3RTaW5nbGVJdGVtKHNlbGVjdGVkSXRlbXNbMF0sIG9wZW5OZXcpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGRpZFNlbGVjdFNpbmdsZUl0ZW0oc2VsZWN0ZWRJdGVtLCBvcGVuTmV3ID0gZmFsc2UpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGlvbi5nZXRBY3RpdmVMaXN0S2V5KCkgPT09ICdjb25mbGljdHMnKSB7XG4gICAgICBpZiAob3Blbk5ldykge1xuICAgICAgICBhd2FpdCB0aGlzLnNob3dNZXJnZUNvbmZsaWN0RmlsZUZvclBhdGgoc2VsZWN0ZWRJdGVtLmZpbGVQYXRoLCB7YWN0aXZhdGU6IHRydWV9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG9wZW5OZXcpIHtcbiAgICAgICAgLy8gVXNlciBleHBsaWNpdGx5IGFza2VkIHRvIHZpZXcgZGlmZiwgc3VjaCBhcyB2aWEgY2xpY2tcbiAgICAgICAgYXdhaXQgdGhpcy5zaG93RmlsZVBhdGNoSXRlbShzZWxlY3RlZEl0ZW0uZmlsZVBhdGgsIHRoaXMuc3RhdGUuc2VsZWN0aW9uLmdldEFjdGl2ZUxpc3RLZXkoKSwge2FjdGl2YXRlOiBmYWxzZX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcGFuZXNXaXRoU3RhbGVJdGVtc1RvVXBkYXRlID0gdGhpcy5nZXRQYW5lc1dpdGhTdGFsZVBlbmRpbmdGaWxlUGF0Y2hJdGVtKCk7XG4gICAgICAgIGlmIChwYW5lc1dpdGhTdGFsZUl0ZW1zVG9VcGRhdGUubGVuZ3RoID4gMCkge1xuICAgICAgICAgIC8vIFVwZGF0ZSBzdGFsZSBpdGVtcyB0byByZWZsZWN0IG5ldyBzZWxlY3Rpb25cbiAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChwYW5lc1dpdGhTdGFsZUl0ZW1zVG9VcGRhdGUubWFwKGFzeW5jIHBhbmUgPT4ge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zaG93RmlsZVBhdGNoSXRlbShzZWxlY3RlZEl0ZW0uZmlsZVBhdGgsIHRoaXMuc3RhdGUuc2VsZWN0aW9uLmdldEFjdGl2ZUxpc3RLZXkoKSwge1xuICAgICAgICAgICAgICBhY3RpdmF0ZTogZmFsc2UsXG4gICAgICAgICAgICAgIHBhbmUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gU2VsZWN0aW9uIHdhcyBjaGFuZ2VkIHZpYSBrZXlib2FyZCBuYXZpZ2F0aW9uLCB1cGRhdGUgcGVuZGluZyBpdGVtIGluIGFjdGl2ZSBwYW5lXG4gICAgICAgICAgY29uc3QgYWN0aXZlUGFuZSA9IHRoaXMucHJvcHMud29ya3NwYWNlLmdldENlbnRlcigpLmdldEFjdGl2ZVBhbmUoKTtcbiAgICAgICAgICBjb25zdCBhY3RpdmVQZW5kaW5nSXRlbSA9IGFjdGl2ZVBhbmUuZ2V0UGVuZGluZ0l0ZW0oKTtcbiAgICAgICAgICBjb25zdCBhY3RpdmVQYW5lSGFzUGVuZGluZ0ZpbGVQYXRjaEl0ZW0gPSBhY3RpdmVQZW5kaW5nSXRlbSAmJiBhY3RpdmVQZW5kaW5nSXRlbS5nZXRSZWFsSXRlbSAmJlxuICAgICAgICAgICAgYWN0aXZlUGVuZGluZ0l0ZW0uZ2V0UmVhbEl0ZW0oKSBpbnN0YW5jZW9mIENoYW5nZWRGaWxlSXRlbTtcbiAgICAgICAgICBpZiAoYWN0aXZlUGFuZUhhc1BlbmRpbmdGaWxlUGF0Y2hJdGVtKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNob3dGaWxlUGF0Y2hJdGVtKHNlbGVjdGVkSXRlbS5maWxlUGF0aCwgdGhpcy5zdGF0ZS5zZWxlY3Rpb24uZ2V0QWN0aXZlTGlzdEtleSgpLCB7XG4gICAgICAgICAgICAgIGFjdGl2YXRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgcGFuZTogYWN0aXZlUGFuZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldFBhbmVzV2l0aFN0YWxlUGVuZGluZ0ZpbGVQYXRjaEl0ZW0oKSB7XG4gICAgLy8gXCJzdGFsZVwiIG1lYW5pbmcgdGhlcmUgaXMgbm8gbG9uZ2VyIGEgY2hhbmdlZCBmaWxlIGFzc29jaWF0ZWQgd2l0aCBpdGVtXG4gICAgLy8gZHVlIHRvIGNoYW5nZXMgYmVpbmcgZnVsbHkgc3RhZ2VkL3Vuc3RhZ2VkL3N0YXNoZWQvZGVsZXRlZC9ldGNcbiAgICByZXR1cm4gdGhpcy5wcm9wcy53b3Jrc3BhY2UuZ2V0UGFuZXMoKS5maWx0ZXIocGFuZSA9PiB7XG4gICAgICBjb25zdCBwZW5kaW5nSXRlbSA9IHBhbmUuZ2V0UGVuZGluZ0l0ZW0oKTtcbiAgICAgIGlmICghcGVuZGluZ0l0ZW0gfHwgIXBlbmRpbmdJdGVtLmdldFJlYWxJdGVtKSB7IHJldHVybiBmYWxzZTsgfVxuICAgICAgY29uc3QgcmVhbEl0ZW0gPSBwZW5kaW5nSXRlbS5nZXRSZWFsSXRlbSgpO1xuICAgICAgaWYgKCEocmVhbEl0ZW0gaW5zdGFuY2VvZiBDaGFuZ2VkRmlsZUl0ZW0pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vIFdlIG9ubHkgd2FudCB0byB1cGRhdGUgcGVuZGluZyBkaWZmIHZpZXdzIGZvciBjdXJyZW50bHkgYWN0aXZlIHJlcG9cbiAgICAgIGNvbnN0IGlzSW5BY3RpdmVSZXBvID0gcmVhbEl0ZW0uZ2V0V29ya2luZ0RpcmVjdG9yeSgpID09PSB0aGlzLnByb3BzLndvcmtpbmdEaXJlY3RvcnlQYXRoO1xuICAgICAgY29uc3QgaXNTdGFsZSA9ICF0aGlzLmNoYW5nZWRGaWxlRXhpc3RzKHJlYWxJdGVtLmdldEZpbGVQYXRoKCksIHJlYWxJdGVtLmdldFN0YWdpbmdTdGF0dXMoKSk7XG4gICAgICByZXR1cm4gaXNJbkFjdGl2ZVJlcG8gJiYgaXNTdGFsZTtcbiAgICB9KTtcbiAgfVxuXG4gIGNoYW5nZWRGaWxlRXhpc3RzKGZpbGVQYXRoLCBzdGFnaW5nU3RhdHVzKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuc2VsZWN0aW9uLmZpbmRJdGVtKChpdGVtLCBrZXkpID0+IHtcbiAgICAgIHJldHVybiBrZXkgPT09IHN0YWdpbmdTdGF0dXMgJiYgaXRlbS5maWxlUGF0aCA9PT0gZmlsZVBhdGg7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBzaG93RmlsZVBhdGNoSXRlbShmaWxlUGF0aCwgc3RhZ2luZ1N0YXR1cywge2FjdGl2YXRlLCBwYW5lfSA9IHthY3RpdmF0ZTogZmFsc2V9KSB7XG4gICAgY29uc3QgdXJpID0gQ2hhbmdlZEZpbGVJdGVtLmJ1aWxkVVJJKGZpbGVQYXRoLCB0aGlzLnByb3BzLndvcmtpbmdEaXJlY3RvcnlQYXRoLCBzdGFnaW5nU3RhdHVzKTtcbiAgICBjb25zdCBjaGFuZ2VkRmlsZUl0ZW0gPSBhd2FpdCB0aGlzLnByb3BzLndvcmtzcGFjZS5vcGVuKFxuICAgICAgdXJpLCB7cGVuZGluZzogdHJ1ZSwgYWN0aXZhdGVQYW5lOiBhY3RpdmF0ZSwgYWN0aXZhdGVJdGVtOiBhY3RpdmF0ZSwgcGFuZX0sXG4gICAgKTtcbiAgICBpZiAoYWN0aXZhdGUpIHtcbiAgICAgIGNvbnN0IGl0ZW1Sb290ID0gY2hhbmdlZEZpbGVJdGVtLmdldEVsZW1lbnQoKTtcbiAgICAgIGNvbnN0IGZvY3VzUm9vdCA9IGl0ZW1Sb290LnF1ZXJ5U2VsZWN0b3IoJ1t0YWJJbmRleF0nKTtcbiAgICAgIGlmIChmb2N1c1Jvb3QpIHtcbiAgICAgICAgZm9jdXNSb290LmZvY3VzKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHNpbXBseSBtYWtlIGl0ZW0gdmlzaWJsZVxuICAgICAgdGhpcy5wcm9wcy53b3Jrc3BhY2UucGFuZUZvckl0ZW0oY2hhbmdlZEZpbGVJdGVtKS5hY3RpdmF0ZUl0ZW0oY2hhbmdlZEZpbGVJdGVtKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzaG93TWVyZ2VDb25mbGljdEZpbGVGb3JQYXRoKHJlbGF0aXZlRmlsZVBhdGgsIHthY3RpdmF0ZX0gPSB7YWN0aXZhdGU6IGZhbHNlfSkge1xuICAgIGNvbnN0IGFic29sdXRlUGF0aCA9IHBhdGguam9pbih0aGlzLnByb3BzLndvcmtpbmdEaXJlY3RvcnlQYXRoLCByZWxhdGl2ZUZpbGVQYXRoKTtcbiAgICBpZiAoYXdhaXQgdGhpcy5maWxlRXhpc3RzKGFic29sdXRlUGF0aCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLndvcmtzcGFjZS5vcGVuKGFic29sdXRlUGF0aCwge2FjdGl2YXRlUGFuZTogYWN0aXZhdGUsIGFjdGl2YXRlSXRlbTogYWN0aXZhdGUsIHBlbmRpbmc6IHRydWV9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9wcy5ub3RpZmljYXRpb25NYW5hZ2VyLmFkZEluZm8oJ0ZpbGUgaGFzIGJlZW4gZGVsZXRlZC4nKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGZpbGVFeGlzdHMoYWJzb2x1dGVQYXRoKSB7XG4gICAgcmV0dXJuIG5ldyBGaWxlKGFic29sdXRlUGF0aCkuZXhpc3RzKCk7XG4gIH1cblxuICBkYmxjbGlja09uSXRlbShldmVudCwgaXRlbSkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmF0dGVtcHRGaWxlU3RhZ2VPcGVyYXRpb24oW2l0ZW0uZmlsZVBhdGhdLCB0aGlzLnN0YXRlLnNlbGVjdGlvbi5saXN0S2V5Rm9ySXRlbShpdGVtKSk7XG4gIH1cblxuICBhc3luYyBjb250ZXh0TWVudU9uSXRlbShldmVudCwgaXRlbSkge1xuICAgIGlmICghdGhpcy5zdGF0ZS5zZWxlY3Rpb24uZ2V0U2VsZWN0ZWRJdGVtcygpLmhhcyhpdGVtKSkge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgIGV2ZW50LnBlcnNpc3QoKTtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHByZXZTdGF0ZSA9PiAoe1xuICAgICAgICAgIHNlbGVjdGlvbjogcHJldlN0YXRlLnNlbGVjdGlvbi5zZWxlY3RJdGVtKGl0ZW0sIGV2ZW50LnNoaWZ0S2V5KSxcbiAgICAgICAgfSksIHJlc29sdmUpO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IG5ld0V2ZW50ID0gbmV3IE1vdXNlRXZlbnQoZXZlbnQudHlwZSwgZXZlbnQpO1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgaWYgKCFldmVudC50YXJnZXQucGFyZW50Tm9kZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBldmVudC50YXJnZXQucGFyZW50Tm9kZS5kaXNwYXRjaEV2ZW50KG5ld0V2ZW50KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIG1vdXNlZG93bk9uSXRlbShldmVudCwgaXRlbSkge1xuICAgIGNvbnN0IHdpbmRvd3MgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInO1xuICAgIGlmIChldmVudC5jdHJsS2V5ICYmICF3aW5kb3dzKSB7IHJldHVybjsgfSAvLyBzaW1wbHkgb3BlbiBjb250ZXh0IG1lbnVcbiAgICBpZiAoZXZlbnQuYnV0dG9uID09PSAwKSB7XG4gICAgICB0aGlzLm1vdXNlU2VsZWN0aW9uSW5Qcm9ncmVzcyA9IHRydWU7XG5cbiAgICAgIGV2ZW50LnBlcnNpc3QoKTtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICBpZiAoZXZlbnQubWV0YUtleSB8fCAoZXZlbnQuY3RybEtleSAmJiB3aW5kb3dzKSkge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUocHJldlN0YXRlID0+ICh7XG4gICAgICAgICAgICBzZWxlY3Rpb246IHByZXZTdGF0ZS5zZWxlY3Rpb24uYWRkT3JTdWJ0cmFjdFNlbGVjdGlvbihpdGVtKSxcbiAgICAgICAgICB9KSwgcmVzb2x2ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZShwcmV2U3RhdGUgPT4gKHtcbiAgICAgICAgICAgIHNlbGVjdGlvbjogcHJldlN0YXRlLnNlbGVjdGlvbi5zZWxlY3RJdGVtKGl0ZW0sIGV2ZW50LnNoaWZ0S2V5KSxcbiAgICAgICAgICB9KSwgcmVzb2x2ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIG1vdXNlbW92ZU9uSXRlbShldmVudCwgaXRlbSkge1xuICAgIGlmICh0aGlzLm1vdXNlU2VsZWN0aW9uSW5Qcm9ncmVzcykge1xuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUocHJldlN0YXRlID0+ICh7XG4gICAgICAgICAgc2VsZWN0aW9uOiBwcmV2U3RhdGUuc2VsZWN0aW9uLnNlbGVjdEl0ZW0oaXRlbSwgdHJ1ZSksXG4gICAgICAgIH0pLCByZXNvbHZlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIG1vdXNldXAoKSB7XG4gICAgY29uc3QgaGFkU2VsZWN0aW9uSW5Qcm9ncmVzcyA9IHRoaXMubW91c2VTZWxlY3Rpb25JblByb2dyZXNzO1xuICAgIHRoaXMubW91c2VTZWxlY3Rpb25JblByb2dyZXNzID0gZmFsc2U7XG5cbiAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUocHJldlN0YXRlID0+ICh7XG4gICAgICAgIHNlbGVjdGlvbjogcHJldlN0YXRlLnNlbGVjdGlvbi5jb2FsZXNjZSgpLFxuICAgICAgfSksIHJlc29sdmUpO1xuICAgIH0pO1xuICAgIGlmIChoYWRTZWxlY3Rpb25JblByb2dyZXNzKSB7XG4gICAgICB0aGlzLmRpZENoYW5nZVNlbGVjdGVkSXRlbXModHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgdW5kb0xhc3REaXNjYXJkKHtldmVudFNvdXJjZX0gPSB7fSkge1xuICAgIGlmICghdGhpcy5wcm9wcy5oYXNVbmRvSGlzdG9yeSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGFkZEV2ZW50KCd1bmRvLWxhc3QtZGlzY2FyZCcsIHtcbiAgICAgIHBhY2thZ2U6ICdnaXRodWInLFxuICAgICAgY29tcG9uZW50OiAnU3RhZ2luZ1ZpZXcnLFxuICAgICAgZXZlbnRTb3VyY2UsXG4gICAgfSk7XG5cbiAgICB0aGlzLnByb3BzLnVuZG9MYXN0RGlzY2FyZCgpO1xuICB9XG5cbiAgZ2V0Rm9jdXNDbGFzcyhsaXN0S2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuc2VsZWN0aW9uLmdldEFjdGl2ZUxpc3RLZXkoKSA9PT0gbGlzdEtleSA/ICdpcy1mb2N1c2VkJyA6ICcnO1xuICB9XG5cbiAgcmVnaXN0ZXJJdGVtRWxlbWVudChpdGVtLCBlbGVtZW50KSB7XG4gICAgdGhpcy5saXN0RWxlbWVudHNCeUl0ZW0uc2V0KGl0ZW0sIGVsZW1lbnQpO1xuICB9XG5cbiAgZ2V0Rm9jdXMoZWxlbWVudCkge1xuICAgIHJldHVybiB0aGlzLnJlZlJvb3QubWFwKHJvb3QgPT4gcm9vdC5jb250YWlucyhlbGVtZW50KSkuZ2V0T3IoZmFsc2UpID8gU3RhZ2luZ1ZpZXcuZm9jdXMuU1RBR0lORyA6IG51bGw7XG4gIH1cblxuICBzZXRGb2N1cyhmb2N1cykge1xuICAgIGlmIChmb2N1cyA9PT0gdGhpcy5jb25zdHJ1Y3Rvci5mb2N1cy5TVEFHSU5HKSB7XG4gICAgICB0aGlzLnJlZlJvb3QubWFwKHJvb3QgPT4gcm9vdC5mb2N1cygpKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGFzeW5jIGFkdmFuY2VGb2N1c0Zyb20oZm9jdXMpIHtcbiAgICBpZiAoZm9jdXMgPT09IHRoaXMuY29uc3RydWN0b3IuZm9jdXMuU1RBR0lORykge1xuICAgICAgaWYgKGF3YWl0IHRoaXMuYWN0aXZhdGVOZXh0TGlzdCgpKSB7XG4gICAgICAgIC8vIFRoZXJlIHdhcyBhIG5leHQgbGlzdCB0byBhY3RpdmF0ZS5cbiAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuZm9jdXMuU1RBR0lORztcbiAgICAgIH1cblxuICAgICAgLy8gV2Ugd2VyZSBhbHJlYWR5IG9uIHRoZSBsYXN0IGxpc3QuXG4gICAgICByZXR1cm4gQ29tbWl0Vmlldy5maXJzdEZvY3VzO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgYXN5bmMgcmV0cmVhdEZvY3VzRnJvbShmb2N1cykge1xuICAgIGlmIChmb2N1cyA9PT0gQ29tbWl0Vmlldy5maXJzdEZvY3VzKSB7XG4gICAgICBhd2FpdCB0aGlzLmFjdGl2YXRlTGFzdExpc3QoKTtcbiAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLmZvY3VzLlNUQUdJTkc7XG4gICAgfVxuXG4gICAgaWYgKGZvY3VzID09PSB0aGlzLmNvbnN0cnVjdG9yLmZvY3VzLlNUQUdJTkcpIHtcbiAgICAgIGF3YWl0IHRoaXMuYWN0aXZhdGVQcmV2aW91c0xpc3QoKTtcbiAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLmZvY3VzLlNUQUdJTkc7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaGFzRm9jdXMoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVmUm9vdC5tYXAocm9vdCA9PiByb290LmNvbnRhaW5zKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpKS5nZXRPcihmYWxzZSk7XG4gIH1cblxuICBpc1BvcHVsYXRlZChwcm9wcykge1xuICAgIHJldHVybiBwcm9wcy53b3JraW5nRGlyZWN0b3J5UGF0aCAhPSBudWxsICYmIChcbiAgICAgIHByb3BzLnVuc3RhZ2VkQ2hhbmdlcy5sZW5ndGggPiAwIHx8XG4gICAgICBwcm9wcy5tZXJnZUNvbmZsaWN0cy5sZW5ndGggPiAwIHx8XG4gICAgICBwcm9wcy5zdGFnZWRDaGFuZ2VzLmxlbmd0aCA+IDBcbiAgICApO1xuICB9XG59XG4iXX0=