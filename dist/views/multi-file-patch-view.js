"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _atom = require("atom");

var _eventKit = require("event-kit");

var _helpers = require("../helpers");

var _reporterProxy = require("../reporter-proxy");

var _propTypes2 = require("../prop-types");

var _atomTextEditor = _interopRequireDefault(require("../atom/atom-text-editor"));

var _marker = _interopRequireDefault(require("../atom/marker"));

var _markerLayer = _interopRequireDefault(require("../atom/marker-layer"));

var _decoration = _interopRequireDefault(require("../atom/decoration"));

var _gutter = _interopRequireDefault(require("../atom/gutter"));

var _commands = _interopRequireWildcard(require("../atom/commands"));

var _filePatchHeaderView = _interopRequireDefault(require("./file-patch-header-view"));

var _filePatchMetaView = _interopRequireDefault(require("./file-patch-meta-view"));

var _hunkHeaderView = _interopRequireDefault(require("./hunk-header-view"));

var _refHolder = _interopRequireDefault(require("../models/ref-holder"));

var _changedFileItem = _interopRequireDefault(require("../items/changed-file-item"));

var _commitDetailItem = _interopRequireDefault(require("../items/commit-detail-item"));

var _commentGutterDecorationController = _interopRequireDefault(require("../controllers/comment-gutter-decoration-controller"));

var _issueishDetailItem = _interopRequireDefault(require("../items/issueish-detail-item"));

var _file = _interopRequireDefault(require("../models/patch/file"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectSpread2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const executableText = {
  [_file.default.modes.NORMAL]: 'non executable',
  [_file.default.modes.EXECUTABLE]: 'executable'
};

class MultiFilePatchView extends _react.default.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "renderFilePatchDecorations", (filePatch, index) => {
      const isCollapsed = !filePatch.getRenderStatus().isVisible();
      const isEmpty = filePatch.getMarker().getRange().isEmpty();
      const isExpandable = filePatch.getRenderStatus().isExpandable();
      const isUnavailable = isCollapsed && !isExpandable;
      const atEnd = filePatch.getStartRange().start.isEqual(this.props.multiFilePatch.getBuffer().getEndPosition());
      const position = isEmpty && atEnd ? 'after' : 'before';
      return _react.default.createElement(_react.Fragment, {
        key: filePatch.getPath()
      }, _react.default.createElement(_marker.default, {
        invalidate: "never",
        bufferRange: filePatch.getStartRange()
      }, _react.default.createElement(_decoration.default, {
        type: "block",
        position: position,
        order: index,
        className: "github-FilePatchView-controlBlock"
      }, _react.default.createElement(_filePatchHeaderView.default, {
        itemType: this.props.itemType,
        relPath: filePatch.getPath(),
        newPath: filePatch.getStatus() === 'renamed' ? filePatch.getNewPath() : null,
        stagingStatus: this.props.stagingStatus,
        isPartiallyStaged: this.props.isPartiallyStaged,
        hasUndoHistory: this.props.hasUndoHistory,
        hasMultipleFileSelections: this.props.hasMultipleFileSelections,
        tooltips: this.props.tooltips,
        undoLastDiscard: () => this.undoLastDiscardFromButton(filePatch),
        diveIntoMirrorPatch: () => this.props.diveIntoMirrorPatch(filePatch),
        openFile: () => this.didOpenFile({
          selectedFilePatch: filePatch
        }),
        toggleFile: () => this.props.toggleFile(filePatch),
        isCollapsed: isCollapsed,
        triggerCollapse: () => this.props.multiFilePatch.collapseFilePatch(filePatch),
        triggerExpand: () => this.props.multiFilePatch.expandFilePatch(filePatch)
      }), !isCollapsed && this.renderSymlinkChangeMeta(filePatch), !isCollapsed && this.renderExecutableModeChangeMeta(filePatch))), isExpandable && this.renderDiffGate(filePatch, position, index), isUnavailable && this.renderDiffUnavailable(filePatch, position, index), this.renderHunkHeaders(filePatch, index));
    });

    _defineProperty(this, "undoLastDiscardFromCoreUndo", () => {
      if (this.props.hasUndoHistory) {
        const selectedFilePatches = Array.from(this.getSelectedFilePatches());
        /* istanbul ignore else */

        if (this.props.itemType === _changedFileItem.default) {
          this.props.undoLastDiscard(selectedFilePatches[0], {
            eventSource: {
              command: 'core:undo'
            }
          });
        }
      }
    });

    _defineProperty(this, "undoLastDiscardFromButton", filePatch => {
      this.props.undoLastDiscard(filePatch, {
        eventSource: 'button'
      });
    });

    _defineProperty(this, "discardSelectionFromCommand", () => {
      return this.props.discardRows(this.props.selectedRows, this.props.selectionMode, {
        eventSource: {
          command: 'github:discard-selected-lines'
        }
      });
    });

    _defineProperty(this, "didToggleModeChange", () => {
      return Promise.all(Array.from(this.getSelectedFilePatches()).filter(fp => fp.didChangeExecutableMode()).map(this.props.toggleModeChange));
    });

    _defineProperty(this, "didToggleSymlinkChange", () => {
      return Promise.all(Array.from(this.getSelectedFilePatches()).filter(fp => fp.hasTypechange()).map(this.props.toggleSymlinkChange));
    });

    _defineProperty(this, "scrollToFile", ({
      changedFilePath,
      changedFilePosition
    }) => {
      /* istanbul ignore next */
      this.refEditor.map(e => {
        const row = this.props.multiFilePatch.getBufferRowForDiffPosition(changedFilePath, changedFilePosition);

        if (row === null) {
          return null;
        }

        e.scrollToBufferPosition({
          row,
          column: 0
        }, {
          center: true
        });
        e.setCursorBufferPosition({
          row,
          column: 0
        });
        return null;
      });
    });

    (0, _helpers.autobind)(this, 'didMouseDownOnHeader', 'didMouseDownOnLineNumber', 'didMouseMoveOnLineNumber', 'didMouseUp', 'didConfirm', 'didToggleSelectionMode', 'selectNextHunk', 'selectPreviousHunk', 'didOpenFile', 'didAddSelection', 'didChangeSelectionRange', 'didDestroySelection', 'oldLineNumberLabel', 'newLineNumberLabel');
    this.mouseSelectionInProgress = false;
    this.lastMouseMoveLine = null;
    this.nextSelectionMode = null;
    this.refRoot = new _refHolder.default();
    this.refEditor = new _refHolder.default();
    this.refEditorElement = new _refHolder.default();
    this.mounted = false;
    this.subs = new _eventKit.CompositeDisposable();
    this.subs.add(this.refEditor.observe(editor => {
      this.refEditorElement.setter(editor.getElement());

      if (this.props.refEditor) {
        this.props.refEditor.setter(editor);
      }
    }), this.refEditorElement.observe(element => {
      this.props.refInitialFocus && this.props.refInitialFocus.setter(element);
    })); // Synchronously maintain the editor's scroll position and logical selection across buffer updates.

    this.suppressChanges = false;
    let lastScrollTop = null;
    let lastScrollLeft = null;
    let lastSelectionIndex = null;
    this.subs.add(this.props.onWillUpdatePatch(() => {
      this.suppressChanges = true;
      this.refEditor.map(editor => {
        lastSelectionIndex = this.props.multiFilePatch.getMaxSelectionIndex(this.props.selectedRows);
        lastScrollTop = editor.getElement().getScrollTop();
        lastScrollLeft = editor.getElement().getScrollLeft();
        return null;
      });
    }), this.props.onDidUpdatePatch(nextPatch => {
      this.refEditor.map(editor => {
        /* istanbul ignore else */
        if (lastSelectionIndex !== null) {
          const nextSelectionRange = nextPatch.getSelectionRangeForIndex(lastSelectionIndex);

          if (this.props.selectionMode === 'line') {
            this.nextSelectionMode = 'line';
            editor.setSelectedBufferRange(nextSelectionRange);
          } else {
            const nextHunks = new Set(_atom.Range.fromObject(nextSelectionRange).getRows().map(row => nextPatch.getHunkAt(row)).filter(Boolean));
            /* istanbul ignore next */

            const nextRanges = nextHunks.size > 0 ? Array.from(nextHunks, hunk => hunk.getRange()) : [[[0, 0], [0, 0]]];
            this.nextSelectionMode = 'hunk';
            editor.setSelectedBufferRanges(nextRanges);
          }
        }
        /* istanbul ignore else */


        if (lastScrollTop !== null) {
          editor.getElement().setScrollTop(lastScrollTop);
        }
        /* istanbul ignore else */


        if (lastScrollLeft !== null) {
          editor.getElement().setScrollLeft(lastScrollLeft);
        }

        return null;
      });
      this.suppressChanges = false;
      this.didChangeSelectedRows();
    }));
  }

  componentDidMount() {
    this.mounted = true;
    this.measurePerformance('mount');
    window.addEventListener('mouseup', this.didMouseUp);
    this.refEditor.map(editor => {
      // this.props.multiFilePatch is guaranteed to contain at least one FilePatch if <AtomTextEditor> is rendered.
      const [firstPatch] = this.props.multiFilePatch.getFilePatches();
      const [firstHunk] = firstPatch.getHunks();

      if (!firstHunk) {
        return null;
      }

      this.nextSelectionMode = 'hunk';
      editor.setSelectedBufferRange(firstHunk.getRange());
      return null;
    });
    this.subs.add(this.props.config.onDidChange('github.showDiffIconGutter', () => this.forceUpdate()));
    const {
      initChangedFilePath,
      initChangedFilePosition
    } = this.props;
    /* istanbul ignore next */

    if (initChangedFilePath && initChangedFilePosition >= 0) {
      this.scrollToFile({
        changedFilePath: initChangedFilePath,
        changedFilePosition: initChangedFilePosition
      });
    }
    /* istanbul ignore if */


    if (this.props.onOpenFilesTab) {
      this.subs.add(this.props.onOpenFilesTab(this.scrollToFile));
    }
  }

  componentDidUpdate(prevProps) {
    this.measurePerformance('update');

    if (prevProps.refInitialFocus !== this.props.refInitialFocus) {
      prevProps.refInitialFocus && prevProps.refInitialFocus.setter(null);
      this.props.refInitialFocus && this.refEditorElement.map(this.props.refInitialFocus.setter);
    }

    if (this.props.multiFilePatch === prevProps.multiFilePatch) {
      this.nextSelectionMode = null;
    }
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.didMouseUp);
    this.subs.dispose();
    this.mounted = false;
    performance.clearMarks();
    performance.clearMeasures();
  }

  render() {
    const rootClass = (0, _classnames.default)('github-FilePatchView', {
      [`github-FilePatchView--${this.props.stagingStatus}`]: this.props.stagingStatus
    }, {
      'github-FilePatchView--blank': !this.props.multiFilePatch.anyPresent()
    }, {
      'github-FilePatchView--hunkMode': this.props.selectionMode === 'hunk'
    });

    if (this.mounted) {
      performance.mark('MultiFilePatchView-update-start');
    } else {
      performance.mark('MultiFilePatchView-mount-start');
    }

    return _react.default.createElement("div", {
      className: rootClass,
      ref: this.refRoot.setter
    }, this.renderCommands(), _react.default.createElement("main", {
      className: "github-FilePatchView-container"
    }, this.props.multiFilePatch.anyPresent() ? this.renderNonEmptyPatch() : this.renderEmptyPatch()));
  }

  renderCommands() {
    if (this.props.itemType === _commitDetailItem.default || this.props.itemType === _issueishDetailItem.default) {
      return _react.default.createElement(_commands.default, {
        registry: this.props.commands,
        target: this.refRoot
      }, _react.default.createElement(_commands.Command, {
        command: "github:select-next-hunk",
        callback: this.selectNextHunk
      }), _react.default.createElement(_commands.Command, {
        command: "github:select-previous-hunk",
        callback: this.selectPreviousHunk
      }), _react.default.createElement(_commands.Command, {
        command: "github:toggle-patch-selection-mode",
        callback: this.didToggleSelectionMode
      }));
    }

    let stageModeCommand = null;
    let stageSymlinkCommand = null;

    if (this.props.multiFilePatch.didAnyChangeExecutableMode()) {
      const command = this.props.stagingStatus === 'unstaged' ? 'github:stage-file-mode-change' : 'github:unstage-file-mode-change';
      stageModeCommand = _react.default.createElement(_commands.Command, {
        command: command,
        callback: this.didToggleModeChange
      });
    }

    if (this.props.multiFilePatch.anyHaveTypechange()) {
      const command = this.props.stagingStatus === 'unstaged' ? 'github:stage-symlink-change' : 'github:unstage-symlink-change';
      stageSymlinkCommand = _react.default.createElement(_commands.Command, {
        command: command,
        callback: this.didToggleSymlinkChange
      });
    }

    return _react.default.createElement(_commands.default, {
      registry: this.props.commands,
      target: this.refRoot
    }, _react.default.createElement(_commands.Command, {
      command: "github:select-next-hunk",
      callback: this.selectNextHunk
    }), _react.default.createElement(_commands.Command, {
      command: "github:select-previous-hunk",
      callback: this.selectPreviousHunk
    }), _react.default.createElement(_commands.Command, {
      command: "core:confirm",
      callback: this.didConfirm
    }), _react.default.createElement(_commands.Command, {
      command: "core:undo",
      callback: this.undoLastDiscardFromCoreUndo
    }), _react.default.createElement(_commands.Command, {
      command: "github:discard-selected-lines",
      callback: this.discardSelectionFromCommand
    }), _react.default.createElement(_commands.Command, {
      command: "github:jump-to-file",
      callback: this.didOpenFile
    }), _react.default.createElement(_commands.Command, {
      command: "github:surface",
      callback: this.props.surface
    }), _react.default.createElement(_commands.Command, {
      command: "github:toggle-patch-selection-mode",
      callback: this.didToggleSelectionMode
    }), stageModeCommand, stageSymlinkCommand,
    /* istanbul ignore next */
    atom.inDevMode() && _react.default.createElement(_commands.Command, {
      command: "github:inspect-patch",
      callback: () => {
        // eslint-disable-next-line no-console
        console.log(this.props.multiFilePatch.getPatchBuffer().inspect({
          layerNames: ['patch', 'hunk']
        }));
      }
    }),
    /* istanbul ignore next */
    atom.inDevMode() && _react.default.createElement(_commands.Command, {
      command: "github:inspect-regions",
      callback: () => {
        // eslint-disable-next-line no-console
        console.log(this.props.multiFilePatch.getPatchBuffer().inspect({
          layerNames: ['unchanged', 'deletion', 'addition', 'nonewline']
        }));
      }
    }),
    /* istanbul ignore next */
    atom.inDevMode() && _react.default.createElement(_commands.Command, {
      command: "github:inspect-mfp",
      callback: () => {
        // eslint-disable-next-line no-console
        console.log(this.props.multiFilePatch.inspect());
      }
    }));
  }

  renderEmptyPatch() {
    return _react.default.createElement("p", {
      className: "github-FilePatchView-message icon icon-info"
    }, "No changes to display");
  }

  renderNonEmptyPatch() {
    return _react.default.createElement(_atomTextEditor.default, {
      workspace: this.props.workspace,
      buffer: this.props.multiFilePatch.getBuffer(),
      lineNumberGutterVisible: false,
      autoWidth: false,
      autoHeight: false,
      readOnly: true,
      softWrapped: true,
      didAddSelection: this.didAddSelection,
      didChangeSelectionRange: this.didChangeSelectionRange,
      didDestroySelection: this.didDestroySelection,
      refModel: this.refEditor,
      hideEmptiness: true
    }, _react.default.createElement(_gutter.default, {
      name: "old-line-numbers",
      priority: 1,
      className: "old",
      type: "line-number",
      labelFn: this.oldLineNumberLabel,
      onMouseDown: this.didMouseDownOnLineNumber,
      onMouseMove: this.didMouseMoveOnLineNumber
    }), _react.default.createElement(_gutter.default, {
      name: "new-line-numbers",
      priority: 2,
      className: "new",
      type: "line-number",
      labelFn: this.newLineNumberLabel,
      onMouseDown: this.didMouseDownOnLineNumber,
      onMouseMove: this.didMouseMoveOnLineNumber
    }), _react.default.createElement(_gutter.default, {
      name: "github-comment-icon",
      priority: 3,
      className: "comment",
      type: "decorated"
    }), this.props.config.get('github.showDiffIconGutter') && _react.default.createElement(_gutter.default, {
      name: "diff-icons",
      priority: 4,
      type: "line-number",
      className: "icons",
      labelFn: _helpers.blankLabel,
      onMouseDown: this.didMouseDownOnLineNumber,
      onMouseMove: this.didMouseMoveOnLineNumber
    }), this.renderPRCommentIcons(), this.props.multiFilePatch.getFilePatches().map(this.renderFilePatchDecorations), this.renderLineDecorations(Array.from(this.props.selectedRows, row => _atom.Range.fromObject([[row, 0], [row, Infinity]])), 'github-FilePatchView-line--selected', {
      gutter: true,
      icon: true,
      line: true
    }), this.renderDecorationsOnLayer(this.props.multiFilePatch.getAdditionLayer(), 'github-FilePatchView-line--added', {
      icon: true,
      line: true
    }), this.renderDecorationsOnLayer(this.props.multiFilePatch.getDeletionLayer(), 'github-FilePatchView-line--deleted', {
      icon: true,
      line: true
    }), this.renderDecorationsOnLayer(this.props.multiFilePatch.getNoNewlineLayer(), 'github-FilePatchView-line--nonewline', {
      icon: true,
      line: true
    }));
  }

  renderPRCommentIcons() {
    if (this.props.itemType !== _issueishDetailItem.default || this.props.reviewCommentsLoading) {
      return null;
    }

    return this.props.reviewCommentThreads.map(({
      comments,
      thread
    }) => {
      const {
        path,
        position
      } = comments[0];

      if (!this.props.multiFilePatch.getPatchForPath(path)) {
        return null;
      }

      const row = this.props.multiFilePatch.getBufferRowForDiffPosition(path, position);

      if (row === null) {
        return null;
      }

      const isRowSelected = this.props.selectedRows.has(row);
      return _react.default.createElement(_commentGutterDecorationController.default, {
        key: `github-comment-gutter-decoration-${thread.id}`,
        commentRow: row,
        threadId: thread.id,
        workspace: this.props.workspace,
        endpoint: this.props.endpoint,
        owner: this.props.owner,
        repo: this.props.repo,
        number: this.props.number,
        workdir: this.props.workdirPath,
        extraClasses: isRowSelected ? ['github-FilePatchView-line--selected'] : [],
        parent: this.constructor.name
      });
    });
  }

  renderDiffGate(filePatch, position, orderOffset) {
    const showDiff = () => {
      (0, _reporterProxy.addEvent)('expand-file-patch', {
        component: this.constructor.name,
        package: 'github'
      });
      this.props.multiFilePatch.expandFilePatch(filePatch);
    };

    return _react.default.createElement(_marker.default, {
      invalidate: "never",
      bufferRange: filePatch.getStartRange()
    }, _react.default.createElement(_decoration.default, {
      type: "block",
      order: orderOffset + 0.1,
      position: position,
      className: "github-FilePatchView-controlBlock"
    }, _react.default.createElement("p", {
      className: "github-FilePatchView-message icon icon-info"
    }, "Large diffs are collapsed by default for performance reasons.", _react.default.createElement("br", null), _react.default.createElement("button", {
      className: "github-FilePatchView-showDiffButton",
      onClick: showDiff
    }, " Load Diff"))));
  }

  renderDiffUnavailable(filePatch, position, orderOffset) {
    return _react.default.createElement(_marker.default, {
      invalidate: "never",
      bufferRange: filePatch.getStartRange()
    }, _react.default.createElement(_decoration.default, {
      type: "block",
      order: orderOffset + 0.1,
      position: position,
      className: "github-FilePatchView-controlBlock"
    }, _react.default.createElement("p", {
      className: "github-FilePatchView-message icon icon-warning"
    }, "This diff is too large to load at all. Use the command-line to view it.")));
  }

  renderExecutableModeChangeMeta(filePatch) {
    if (!filePatch.didChangeExecutableMode()) {
      return null;
    }

    const oldMode = filePatch.getOldMode();
    const newMode = filePatch.getNewMode();
    const attrs = this.props.stagingStatus === 'unstaged' ? {
      actionIcon: 'icon-move-down',
      actionText: 'Stage Mode Change'
    } : {
      actionIcon: 'icon-move-up',
      actionText: 'Unstage Mode Change'
    };
    return _react.default.createElement(_filePatchMetaView.default, {
      title: "Mode change",
      actionIcon: attrs.actionIcon,
      actionText: attrs.actionText,
      itemType: this.props.itemType,
      action: () => this.props.toggleModeChange(filePatch)
    }, _react.default.createElement(_react.Fragment, null, "File changed mode", _react.default.createElement("span", {
      className: "github-FilePatchView-metaDiff github-FilePatchView-metaDiff--removed"
    }, "from ", executableText[oldMode], " ", _react.default.createElement("code", null, oldMode)), _react.default.createElement("span", {
      className: "github-FilePatchView-metaDiff github-FilePatchView-metaDiff--added"
    }, "to ", executableText[newMode], " ", _react.default.createElement("code", null, newMode))));
  }

  renderSymlinkChangeMeta(filePatch) {
    if (!filePatch.hasSymlink()) {
      return null;
    }

    let detail = _react.default.createElement("div", null);

    let title = '';
    const oldSymlink = filePatch.getOldSymlink();
    const newSymlink = filePatch.getNewSymlink();

    if (oldSymlink && newSymlink) {
      detail = _react.default.createElement(_react.Fragment, null, "Symlink changed", _react.default.createElement("span", {
        className: (0, _classnames.default)('github-FilePatchView-metaDiff', 'github-FilePatchView-metaDiff--fullWidth', 'github-FilePatchView-metaDiff--removed')
      }, "from ", _react.default.createElement("code", null, oldSymlink)), _react.default.createElement("span", {
        className: (0, _classnames.default)('github-FilePatchView-metaDiff', 'github-FilePatchView-metaDiff--fullWidth', 'github-FilePatchView-metaDiff--added')
      }, "to ", _react.default.createElement("code", null, newSymlink)), ".");
      title = 'Symlink changed';
    } else if (oldSymlink && !newSymlink) {
      detail = _react.default.createElement(_react.Fragment, null, "Symlink", _react.default.createElement("span", {
        className: "github-FilePatchView-metaDiff github-FilePatchView-metaDiff--removed"
      }, "to ", _react.default.createElement("code", null, oldSymlink)), "deleted.");
      title = 'Symlink deleted';
    } else {
      detail = _react.default.createElement(_react.Fragment, null, "Symlink", _react.default.createElement("span", {
        className: "github-FilePatchView-metaDiff github-FilePatchView-metaDiff--added"
      }, "to ", _react.default.createElement("code", null, newSymlink)), "created.");
      title = 'Symlink created';
    }

    const attrs = this.props.stagingStatus === 'unstaged' ? {
      actionIcon: 'icon-move-down',
      actionText: 'Stage Symlink Change'
    } : {
      actionIcon: 'icon-move-up',
      actionText: 'Unstage Symlink Change'
    };
    return _react.default.createElement(_filePatchMetaView.default, {
      title: title,
      actionIcon: attrs.actionIcon,
      actionText: attrs.actionText,
      itemType: this.props.itemType,
      action: () => this.props.toggleSymlinkChange(filePatch)
    }, _react.default.createElement(_react.Fragment, null, detail));
  }

  renderHunkHeaders(filePatch, orderOffset) {
    const toggleVerb = this.props.stagingStatus === 'unstaged' ? 'Stage' : 'Unstage';
    const selectedHunks = new Set(Array.from(this.props.selectedRows, row => this.props.multiFilePatch.getHunkAt(row)));
    return _react.default.createElement(_react.Fragment, null, _react.default.createElement(_markerLayer.default, null, filePatch.getHunks().map((hunk, index) => {
      const containsSelection = this.props.selectionMode === 'line' && selectedHunks.has(hunk);
      const isSelected = this.props.selectionMode === 'hunk' && selectedHunks.has(hunk);
      let buttonSuffix = '';

      if (containsSelection) {
        buttonSuffix += 'Selected Line';

        if (this.props.selectedRows.size > 1) {
          buttonSuffix += 's';
        }
      } else {
        buttonSuffix += 'Hunk';

        if (selectedHunks.size > 1) {
          buttonSuffix += 's';
        }
      }

      const toggleSelectionLabel = `${toggleVerb} ${buttonSuffix}`;
      const discardSelectionLabel = `Discard ${buttonSuffix}`;
      const startPoint = hunk.getRange().start;
      const startRange = new _atom.Range(startPoint, startPoint);
      return _react.default.createElement(_marker.default, {
        key: `hunkHeader-${index}`,
        bufferRange: startRange,
        invalidate: "never"
      }, _react.default.createElement(_decoration.default, {
        type: "block",
        order: orderOffset + 0.2,
        className: "github-FilePatchView-controlBlock"
      }, _react.default.createElement(_hunkHeaderView.default, {
        refTarget: this.refEditorElement,
        hunk: hunk,
        isSelected: isSelected,
        stagingStatus: this.props.stagingStatus,
        selectionMode: "line",
        toggleSelectionLabel: toggleSelectionLabel,
        discardSelectionLabel: discardSelectionLabel,
        tooltips: this.props.tooltips,
        keymaps: this.props.keymaps,
        toggleSelection: () => this.toggleHunkSelection(hunk, containsSelection),
        discardSelection: () => this.discardHunkSelection(hunk, containsSelection),
        mouseDown: this.didMouseDownOnHeader,
        itemType: this.props.itemType
      })));
    })));
  }

  renderLineDecorations(ranges, lineClass, {
    line,
    gutter,
    icon,
    refHolder
  }) {
    if (ranges.length === 0) {
      return null;
    }

    const holder = refHolder || new _refHolder.default();
    return _react.default.createElement(_markerLayer.default, {
      handleLayer: holder.setter
    }, ranges.map((range, index) => {
      return _react.default.createElement(_marker.default, {
        key: `line-${lineClass}-${index}`,
        bufferRange: range,
        invalidate: "never"
      });
    }), this.renderDecorations(lineClass, {
      line,
      gutter,
      icon
    }));
  }

  renderDecorationsOnLayer(layer, lineClass, {
    line,
    gutter,
    icon
  }) {
    if (layer.getMarkerCount() === 0) {
      return null;
    }

    return _react.default.createElement(_markerLayer.default, {
      external: layer
    }, this.renderDecorations(lineClass, {
      line,
      gutter,
      icon
    }));
  }

  renderDecorations(lineClass, {
    line,
    gutter,
    icon
  }) {
    return _react.default.createElement(_react.Fragment, null, line && _react.default.createElement(_decoration.default, {
      type: "line",
      className: lineClass,
      omitEmptyLastRow: false
    }), gutter && _react.default.createElement(_react.Fragment, null, _react.default.createElement(_decoration.default, {
      type: "line-number",
      gutterName: "old-line-numbers",
      className: lineClass,
      omitEmptyLastRow: false
    }), _react.default.createElement(_decoration.default, {
      type: "line-number",
      gutterName: "new-line-numbers",
      className: lineClass,
      omitEmptyLastRow: false
    }), _react.default.createElement(_decoration.default, {
      type: "gutter",
      gutterName: "github-comment-icon",
      className: `github-editorCommentGutterIcon empty ${lineClass}`,
      omitEmptyLastRow: false
    })), icon && _react.default.createElement(_decoration.default, {
      type: "line-number",
      gutterName: "diff-icons",
      className: lineClass,
      omitEmptyLastRow: false
    }));
  }

  toggleHunkSelection(hunk, containsSelection) {
    if (containsSelection) {
      return this.props.toggleRows(this.props.selectedRows, this.props.selectionMode, {
        eventSource: 'button'
      });
    } else {
      const changeRows = new Set(hunk.getChanges().reduce((rows, change) => {
        rows.push(...change.getBufferRows());
        return rows;
      }, []));
      return this.props.toggleRows(changeRows, 'hunk', {
        eventSource: 'button'
      });
    }
  }

  discardHunkSelection(hunk, containsSelection) {
    if (containsSelection) {
      return this.props.discardRows(this.props.selectedRows, this.props.selectionMode, {
        eventSource: 'button'
      });
    } else {
      const changeRows = new Set(hunk.getChanges().reduce((rows, change) => {
        rows.push(...change.getBufferRows());
        return rows;
      }, []));
      return this.props.discardRows(changeRows, 'hunk', {
        eventSource: 'button'
      });
    }
  }

  didMouseDownOnHeader(event, hunk) {
    this.nextSelectionMode = 'hunk';
    this.handleSelectionEvent(event, hunk.getRange());
  }

  didMouseDownOnLineNumber(event) {
    const line = event.bufferRow;

    if (line === undefined || isNaN(line)) {
      return;
    }

    this.nextSelectionMode = 'line';

    if (this.handleSelectionEvent(event.domEvent, [[line, 0], [line, Infinity]])) {
      this.mouseSelectionInProgress = true;
    }
  }

  didMouseMoveOnLineNumber(event) {
    if (!this.mouseSelectionInProgress) {
      return;
    }

    const line = event.bufferRow;

    if (this.lastMouseMoveLine === line || line === undefined || isNaN(line)) {
      return;
    }

    this.lastMouseMoveLine = line;
    this.nextSelectionMode = 'line';
    this.handleSelectionEvent(event.domEvent, [[line, 0], [line, Infinity]], {
      add: true
    });
  }

  didMouseUp() {
    this.mouseSelectionInProgress = false;
  }

  handleSelectionEvent(event, rangeLike, opts) {
    if (event.button !== 0) {
      return false;
    }

    const isWindows = process.platform === 'win32';

    if (event.ctrlKey && !isWindows) {
      // Allow the context menu to open.
      return false;
    }

    const options = _objectSpread2({
      add: false
    }, opts); // Normalize the target selection range


    const converted = _atom.Range.fromObject(rangeLike);

    const range = this.refEditor.map(editor => editor.clipBufferRange(converted)).getOr(converted);

    if (event.metaKey ||
    /* istanbul ignore next */
    event.ctrlKey && isWindows) {
      this.refEditor.map(editor => {
        let intersects = false;
        let without = null;

        for (const selection of editor.getSelections()) {
          if (selection.intersectsBufferRange(range)) {
            // Remove range from this selection by truncating it to the "near edge" of the range and creating a
            // new selection from the "far edge" to the previous end. Omit either side if it is empty.
            intersects = true;
            const selectionRange = selection.getBufferRange();
            const newRanges = [];

            if (!range.start.isEqual(selectionRange.start)) {
              // Include the bit from the selection's previous start to the range's start.
              let nudged = range.start;

              if (range.start.column === 0) {
                const lastColumn = editor.getBuffer().lineLengthForRow(range.start.row - 1);
                nudged = [range.start.row - 1, lastColumn];
              }

              newRanges.push([selectionRange.start, nudged]);
            }

            if (!range.end.isEqual(selectionRange.end)) {
              // Include the bit from the range's end to the selection's end.
              let nudged = range.end;
              const lastColumn = editor.getBuffer().lineLengthForRow(range.end.row);

              if (range.end.column === lastColumn) {
                nudged = [range.end.row + 1, 0];
              }

              newRanges.push([nudged, selectionRange.end]);
            }

            if (newRanges.length > 0) {
              selection.setBufferRange(newRanges[0]);

              for (const newRange of newRanges.slice(1)) {
                editor.addSelectionForBufferRange(newRange, {
                  reversed: selection.isReversed()
                });
              }
            } else {
              without = selection;
            }
          }
        }

        if (without !== null) {
          const replacementRanges = editor.getSelections().filter(each => each !== without).map(each => each.getBufferRange());

          if (replacementRanges.length > 0) {
            editor.setSelectedBufferRanges(replacementRanges);
          }
        }

        if (!intersects) {
          // Add this range as a new, distinct selection.
          editor.addSelectionForBufferRange(range);
        }

        return null;
      });
    } else if (options.add || event.shiftKey) {
      // Extend the existing selection to encompass this range.
      this.refEditor.map(editor => {
        const lastSelection = editor.getLastSelection();
        const lastSelectionRange = lastSelection.getBufferRange(); // You are now entering the wall of ternery operators. This is your last exit before the tollbooth

        const isBefore = range.start.isLessThan(lastSelectionRange.start);
        const farEdge = isBefore ? range.start : range.end;
        const newRange = isBefore ? [farEdge, lastSelectionRange.end] : [lastSelectionRange.start, farEdge];
        lastSelection.setBufferRange(newRange, {
          reversed: isBefore
        });
        return null;
      });
    } else {
      this.refEditor.map(editor => editor.setSelectedBufferRange(range));
    }

    return true;
  }

  didConfirm() {
    return this.props.toggleRows(this.props.selectedRows, this.props.selectionMode);
  }

  didToggleSelectionMode() {
    const selectedHunks = this.getSelectedHunks();
    this.withSelectionMode({
      line: () => {
        const hunkRanges = selectedHunks.map(hunk => hunk.getRange());
        this.nextSelectionMode = 'hunk';
        this.refEditor.map(editor => editor.setSelectedBufferRanges(hunkRanges));
      },
      hunk: () => {
        let firstChangeRow = Infinity;

        for (const hunk of selectedHunks) {
          const [firstChange] = hunk.getChanges();
          /* istanbul ignore else */

          if (firstChange && (!firstChangeRow || firstChange.getStartBufferRow() < firstChangeRow)) {
            firstChangeRow = firstChange.getStartBufferRow();
          }
        }

        this.nextSelectionMode = 'line';
        this.refEditor.map(editor => {
          editor.setSelectedBufferRanges([[[firstChangeRow, 0], [firstChangeRow, Infinity]]]);
          return null;
        });
      }
    });
  }

  selectNextHunk() {
    this.refEditor.map(editor => {
      const nextHunks = new Set(this.withSelectedHunks(hunk => this.getHunkAfter(hunk) || hunk));
      const nextRanges = Array.from(nextHunks, hunk => hunk.getRange());
      this.nextSelectionMode = 'hunk';
      editor.setSelectedBufferRanges(nextRanges);
      return null;
    });
  }

  selectPreviousHunk() {
    this.refEditor.map(editor => {
      const nextHunks = new Set(this.withSelectedHunks(hunk => this.getHunkBefore(hunk) || hunk));
      const nextRanges = Array.from(nextHunks, hunk => hunk.getRange());
      this.nextSelectionMode = 'hunk';
      editor.setSelectedBufferRanges(nextRanges);
      return null;
    });
  }

  didOpenFile({
    selectedFilePatch
  }) {
    const cursorsByFilePatch = new Map();
    this.refEditor.map(editor => {
      const placedRows = new Set();

      for (const cursor of editor.getCursors()) {
        const cursorRow = cursor.getBufferPosition().row;
        const hunk = this.props.multiFilePatch.getHunkAt(cursorRow);
        const filePatch = this.props.multiFilePatch.getFilePatchAt(cursorRow);
        /* istanbul ignore next */

        if (!hunk) {
          continue;
        }

        let newRow = hunk.getNewRowAt(cursorRow);
        let newColumn = cursor.getBufferPosition().column;

        if (newRow === null) {
          let nearestRow = hunk.getNewStartRow();

          for (const region of hunk.getRegions()) {
            if (!region.includesBufferRow(cursorRow)) {
              region.when({
                unchanged: () => {
                  nearestRow += region.bufferRowCount();
                },
                addition: () => {
                  nearestRow += region.bufferRowCount();
                }
              });
            } else {
              break;
            }
          }

          if (!placedRows.has(nearestRow)) {
            newRow = nearestRow;
            newColumn = 0;
            placedRows.add(nearestRow);
          }
        }

        if (newRow !== null) {
          // Why is this needed? I _think_ everything is in terms of buffer position
          // so there shouldn't be an off-by-one issue
          newRow -= 1;
          const cursors = cursorsByFilePatch.get(filePatch);

          if (!cursors) {
            cursorsByFilePatch.set(filePatch, [[newRow, newColumn]]);
          } else {
            cursors.push([newRow, newColumn]);
          }
        }
      }

      return null;
    });
    const filePatchesWithCursors = new Set(cursorsByFilePatch.keys());

    if (selectedFilePatch && !filePatchesWithCursors.has(selectedFilePatch)) {
      const [firstHunk] = selectedFilePatch.getHunks();
      const cursorRow = firstHunk ? firstHunk.getNewStartRow() - 1 :
      /* istanbul ignore next */
      0;
      return this.props.openFile(selectedFilePatch, [[cursorRow, 0]], true);
    } else {
      const pending = cursorsByFilePatch.size === 1;
      return Promise.all(Array.from(cursorsByFilePatch, value => {
        const [filePatch, cursors] = value;
        return this.props.openFile(filePatch, cursors, pending);
      }));
    }
  }

  getSelectedRows() {
    return this.refEditor.map(editor => {
      return new Set(editor.getSelections().map(selection => selection.getBufferRange()).reduce((acc, range) => {
        for (const row of range.getRows()) {
          if (this.isChangeRow(row)) {
            acc.push(row);
          }
        }

        return acc;
      }, []));
    }).getOr(new Set());
  }

  didAddSelection() {
    this.didChangeSelectedRows();
  }

  didChangeSelectionRange(event) {
    if (!event || event.oldBufferRange.start.row !== event.newBufferRange.start.row || event.oldBufferRange.end.row !== event.newBufferRange.end.row) {
      this.didChangeSelectedRows();
    }
  }

  didDestroySelection() {
    this.didChangeSelectedRows();
  }

  didChangeSelectedRows() {
    if (this.suppressChanges) {
      return;
    }

    const nextCursorRows = this.refEditor.map(editor => {
      return editor.getCursorBufferPositions().map(position => position.row);
    }).getOr([]);
    const hasMultipleFileSelections = this.props.multiFilePatch.spansMultipleFiles(nextCursorRows);
    this.props.selectedRowsChanged(this.getSelectedRows(), this.nextSelectionMode || 'line', hasMultipleFileSelections);
  }

  oldLineNumberLabel({
    bufferRow,
    softWrapped
  }) {
    const hunk = this.props.multiFilePatch.getHunkAt(bufferRow);

    if (hunk === undefined) {
      return this.pad('');
    }

    const oldRow = hunk.getOldRowAt(bufferRow);

    if (softWrapped) {
      return this.pad(oldRow === null ? '' : '•');
    }

    return this.pad(oldRow);
  }

  newLineNumberLabel({
    bufferRow,
    softWrapped
  }) {
    const hunk = this.props.multiFilePatch.getHunkAt(bufferRow);

    if (hunk === undefined) {
      return this.pad('');
    }

    const newRow = hunk.getNewRowAt(bufferRow);

    if (softWrapped) {
      return this.pad(newRow === null ? '' : '•');
    }

    return this.pad(newRow);
  }
  /*
   * Return a Set of the Hunks that include at least one editor selection. The selection need not contain an actual
   * change row.
   */


  getSelectedHunks() {
    return this.withSelectedHunks(each => each);
  }

  withSelectedHunks(callback) {
    return this.refEditor.map(editor => {
      const seen = new Set();
      return editor.getSelectedBufferRanges().reduce((acc, range) => {
        for (const row of range.getRows()) {
          const hunk = this.props.multiFilePatch.getHunkAt(row);

          if (!hunk || seen.has(hunk)) {
            continue;
          }

          seen.add(hunk);
          acc.push(callback(hunk));
        }

        return acc;
      }, []);
    }).getOr([]);
  }
  /*
   * Return a Set of FilePatches that include at least one editor selection. The selection need not contain an actual
   * change row.
   */


  getSelectedFilePatches() {
    return this.refEditor.map(editor => {
      const patches = new Set();

      for (const range of editor.getSelectedBufferRanges()) {
        for (const row of range.getRows()) {
          const patch = this.props.multiFilePatch.getFilePatchAt(row);
          patches.add(patch);
        }
      }

      return patches;
    }).getOr(new Set());
  }

  getHunkBefore(hunk) {
    const prevRow = hunk.getRange().start.row - 1;
    return this.props.multiFilePatch.getHunkAt(prevRow);
  }

  getHunkAfter(hunk) {
    const nextRow = hunk.getRange().end.row + 1;
    return this.props.multiFilePatch.getHunkAt(nextRow);
  }

  isChangeRow(bufferRow) {
    const changeLayers = [this.props.multiFilePatch.getAdditionLayer(), this.props.multiFilePatch.getDeletionLayer()];
    return changeLayers.some(layer => layer.findMarkers({
      intersectsRow: bufferRow
    }).length > 0);
  }

  withSelectionMode(callbacks) {
    const callback = callbacks[this.props.selectionMode];
    /* istanbul ignore if */

    if (!callback) {
      throw new Error(`Unknown selection mode: ${this.props.selectionMode}`);
    }

    return callback();
  }

  pad(num) {
    const maxDigits = this.props.multiFilePatch.getMaxLineNumberWidth();

    if (num === null) {
      return _helpers.NBSP_CHARACTER.repeat(maxDigits);
    } else {
      return _helpers.NBSP_CHARACTER.repeat(maxDigits - num.toString().length) + num.toString();
    }
  }

  measurePerformance(action) {
    /* istanbul ignore else */
    if ((action === 'update' || action === 'mount') && performance.getEntriesByName(`MultiFilePatchView-${action}-start`).length > 0) {
      performance.mark(`MultiFilePatchView-${action}-end`);
      performance.measure(`MultiFilePatchView-${action}`, `MultiFilePatchView-${action}-start`, `MultiFilePatchView-${action}-end`);
      const perf = performance.getEntriesByName(`MultiFilePatchView-${action}`)[0];
      performance.clearMarks(`MultiFilePatchView-${action}-start`);
      performance.clearMarks(`MultiFilePatchView-${action}-end`);
      performance.clearMeasures(`MultiFilePatchView-${action}`);
      (0, _reporterProxy.addEvent)(`MultiFilePatchView-${action}`, {
        package: 'github',
        filePatchesLineCounts: this.props.multiFilePatch.getFilePatches().map(fp => fp.getPatch().getChangedLineCount()),
        duration: perf.duration
      });
    }
  }

}

exports.default = MultiFilePatchView;

_defineProperty(MultiFilePatchView, "propTypes", {
  // Behavior controls
  stagingStatus: _propTypes.default.oneOf(['staged', 'unstaged']),
  isPartiallyStaged: _propTypes.default.bool,
  itemType: _propTypes2.ItemTypePropType.isRequired,
  // Models
  repository: _propTypes.default.object.isRequired,
  multiFilePatch: _propTypes2.MultiFilePatchPropType.isRequired,
  selectionMode: _propTypes.default.oneOf(['hunk', 'line']).isRequired,
  selectedRows: _propTypes.default.object.isRequired,
  hasMultipleFileSelections: _propTypes.default.bool.isRequired,
  hasUndoHistory: _propTypes.default.bool,
  // Review comments
  reviewCommentsLoading: _propTypes.default.bool,
  reviewCommentThreads: _propTypes.default.arrayOf(_propTypes.default.shape({
    thread: _propTypes.default.object.isRequired,
    comments: _propTypes.default.arrayOf(_propTypes.default.object).isRequired
  })),
  // Atom environment
  workspace: _propTypes.default.object.isRequired,
  commands: _propTypes.default.object.isRequired,
  keymaps: _propTypes.default.object.isRequired,
  tooltips: _propTypes.default.object.isRequired,
  config: _propTypes.default.object.isRequired,
  pullRequest: _propTypes.default.object,
  // Callbacks
  selectedRowsChanged: _propTypes.default.func,
  // Action methods
  switchToIssueish: _propTypes.default.func,
  diveIntoMirrorPatch: _propTypes.default.func,
  surface: _propTypes.default.func,
  openFile: _propTypes.default.func,
  toggleFile: _propTypes.default.func,
  toggleRows: _propTypes.default.func,
  toggleModeChange: _propTypes.default.func,
  toggleSymlinkChange: _propTypes.default.func,
  undoLastDiscard: _propTypes.default.func,
  discardRows: _propTypes.default.func,
  onWillUpdatePatch: _propTypes.default.func,
  onDidUpdatePatch: _propTypes.default.func,
  // External refs
  refEditor: _propTypes2.RefHolderPropType,
  refInitialFocus: _propTypes2.RefHolderPropType,
  // for navigating the PR changed files tab
  onOpenFilesTab: _propTypes.default.func,
  initChangedFilePath: _propTypes.default.string,
  initChangedFilePosition: _propTypes.default.number,
  // for opening the reviews dock item
  endpoint: _propTypes2.EndpointPropType,
  owner: _propTypes.default.string,
  repo: _propTypes.default.string,
  number: _propTypes.default.number,
  workdirPath: _propTypes.default.string
});

_defineProperty(MultiFilePatchView, "defaultProps", {
  onWillUpdatePatch: () => new _eventKit.Disposable(),
  onDidUpdatePatch: () => new _eventKit.Disposable(),
  reviewCommentsLoading: false,
  reviewCommentThreads: []
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi92aWV3cy9tdWx0aS1maWxlLXBhdGNoLXZpZXcuanMiXSwibmFtZXMiOlsiZXhlY3V0YWJsZVRleHQiLCJGaWxlIiwibW9kZXMiLCJOT1JNQUwiLCJFWEVDVVRBQkxFIiwiTXVsdGlGaWxlUGF0Y2hWaWV3IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZmlsZVBhdGNoIiwiaW5kZXgiLCJpc0NvbGxhcHNlZCIsImdldFJlbmRlclN0YXR1cyIsImlzVmlzaWJsZSIsImlzRW1wdHkiLCJnZXRNYXJrZXIiLCJnZXRSYW5nZSIsImlzRXhwYW5kYWJsZSIsImlzVW5hdmFpbGFibGUiLCJhdEVuZCIsImdldFN0YXJ0UmFuZ2UiLCJzdGFydCIsImlzRXF1YWwiLCJtdWx0aUZpbGVQYXRjaCIsImdldEJ1ZmZlciIsImdldEVuZFBvc2l0aW9uIiwicG9zaXRpb24iLCJnZXRQYXRoIiwiaXRlbVR5cGUiLCJnZXRTdGF0dXMiLCJnZXROZXdQYXRoIiwic3RhZ2luZ1N0YXR1cyIsImlzUGFydGlhbGx5U3RhZ2VkIiwiaGFzVW5kb0hpc3RvcnkiLCJoYXNNdWx0aXBsZUZpbGVTZWxlY3Rpb25zIiwidG9vbHRpcHMiLCJ1bmRvTGFzdERpc2NhcmRGcm9tQnV0dG9uIiwiZGl2ZUludG9NaXJyb3JQYXRjaCIsImRpZE9wZW5GaWxlIiwic2VsZWN0ZWRGaWxlUGF0Y2giLCJ0b2dnbGVGaWxlIiwiY29sbGFwc2VGaWxlUGF0Y2giLCJleHBhbmRGaWxlUGF0Y2giLCJyZW5kZXJTeW1saW5rQ2hhbmdlTWV0YSIsInJlbmRlckV4ZWN1dGFibGVNb2RlQ2hhbmdlTWV0YSIsInJlbmRlckRpZmZHYXRlIiwicmVuZGVyRGlmZlVuYXZhaWxhYmxlIiwicmVuZGVySHVua0hlYWRlcnMiLCJzZWxlY3RlZEZpbGVQYXRjaGVzIiwiQXJyYXkiLCJmcm9tIiwiZ2V0U2VsZWN0ZWRGaWxlUGF0Y2hlcyIsIkNoYW5nZWRGaWxlSXRlbSIsInVuZG9MYXN0RGlzY2FyZCIsImV2ZW50U291cmNlIiwiY29tbWFuZCIsImRpc2NhcmRSb3dzIiwic2VsZWN0ZWRSb3dzIiwic2VsZWN0aW9uTW9kZSIsIlByb21pc2UiLCJhbGwiLCJmaWx0ZXIiLCJmcCIsImRpZENoYW5nZUV4ZWN1dGFibGVNb2RlIiwibWFwIiwidG9nZ2xlTW9kZUNoYW5nZSIsImhhc1R5cGVjaGFuZ2UiLCJ0b2dnbGVTeW1saW5rQ2hhbmdlIiwiY2hhbmdlZEZpbGVQYXRoIiwiY2hhbmdlZEZpbGVQb3NpdGlvbiIsInJlZkVkaXRvciIsImUiLCJyb3ciLCJnZXRCdWZmZXJSb3dGb3JEaWZmUG9zaXRpb24iLCJzY3JvbGxUb0J1ZmZlclBvc2l0aW9uIiwiY29sdW1uIiwiY2VudGVyIiwic2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24iLCJtb3VzZVNlbGVjdGlvbkluUHJvZ3Jlc3MiLCJsYXN0TW91c2VNb3ZlTGluZSIsIm5leHRTZWxlY3Rpb25Nb2RlIiwicmVmUm9vdCIsIlJlZkhvbGRlciIsInJlZkVkaXRvckVsZW1lbnQiLCJtb3VudGVkIiwic3VicyIsIkNvbXBvc2l0ZURpc3Bvc2FibGUiLCJhZGQiLCJvYnNlcnZlIiwiZWRpdG9yIiwic2V0dGVyIiwiZ2V0RWxlbWVudCIsImVsZW1lbnQiLCJyZWZJbml0aWFsRm9jdXMiLCJzdXBwcmVzc0NoYW5nZXMiLCJsYXN0U2Nyb2xsVG9wIiwibGFzdFNjcm9sbExlZnQiLCJsYXN0U2VsZWN0aW9uSW5kZXgiLCJvbldpbGxVcGRhdGVQYXRjaCIsImdldE1heFNlbGVjdGlvbkluZGV4IiwiZ2V0U2Nyb2xsVG9wIiwiZ2V0U2Nyb2xsTGVmdCIsIm9uRGlkVXBkYXRlUGF0Y2giLCJuZXh0UGF0Y2giLCJuZXh0U2VsZWN0aW9uUmFuZ2UiLCJnZXRTZWxlY3Rpb25SYW5nZUZvckluZGV4Iiwic2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSIsIm5leHRIdW5rcyIsIlNldCIsIlJhbmdlIiwiZnJvbU9iamVjdCIsImdldFJvd3MiLCJnZXRIdW5rQXQiLCJCb29sZWFuIiwibmV4dFJhbmdlcyIsInNpemUiLCJodW5rIiwic2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMiLCJzZXRTY3JvbGxUb3AiLCJzZXRTY3JvbGxMZWZ0IiwiZGlkQ2hhbmdlU2VsZWN0ZWRSb3dzIiwiY29tcG9uZW50RGlkTW91bnQiLCJtZWFzdXJlUGVyZm9ybWFuY2UiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiZGlkTW91c2VVcCIsImZpcnN0UGF0Y2giLCJnZXRGaWxlUGF0Y2hlcyIsImZpcnN0SHVuayIsImdldEh1bmtzIiwiY29uZmlnIiwib25EaWRDaGFuZ2UiLCJmb3JjZVVwZGF0ZSIsImluaXRDaGFuZ2VkRmlsZVBhdGgiLCJpbml0Q2hhbmdlZEZpbGVQb3NpdGlvbiIsInNjcm9sbFRvRmlsZSIsIm9uT3BlbkZpbGVzVGFiIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZGlzcG9zZSIsInBlcmZvcm1hbmNlIiwiY2xlYXJNYXJrcyIsImNsZWFyTWVhc3VyZXMiLCJyZW5kZXIiLCJyb290Q2xhc3MiLCJhbnlQcmVzZW50IiwibWFyayIsInJlbmRlckNvbW1hbmRzIiwicmVuZGVyTm9uRW1wdHlQYXRjaCIsInJlbmRlckVtcHR5UGF0Y2giLCJDb21taXREZXRhaWxJdGVtIiwiSXNzdWVpc2hEZXRhaWxJdGVtIiwiY29tbWFuZHMiLCJzZWxlY3ROZXh0SHVuayIsInNlbGVjdFByZXZpb3VzSHVuayIsImRpZFRvZ2dsZVNlbGVjdGlvbk1vZGUiLCJzdGFnZU1vZGVDb21tYW5kIiwic3RhZ2VTeW1saW5rQ29tbWFuZCIsImRpZEFueUNoYW5nZUV4ZWN1dGFibGVNb2RlIiwiZGlkVG9nZ2xlTW9kZUNoYW5nZSIsImFueUhhdmVUeXBlY2hhbmdlIiwiZGlkVG9nZ2xlU3ltbGlua0NoYW5nZSIsImRpZENvbmZpcm0iLCJ1bmRvTGFzdERpc2NhcmRGcm9tQ29yZVVuZG8iLCJkaXNjYXJkU2VsZWN0aW9uRnJvbUNvbW1hbmQiLCJzdXJmYWNlIiwiYXRvbSIsImluRGV2TW9kZSIsImNvbnNvbGUiLCJsb2ciLCJnZXRQYXRjaEJ1ZmZlciIsImluc3BlY3QiLCJsYXllck5hbWVzIiwid29ya3NwYWNlIiwiZGlkQWRkU2VsZWN0aW9uIiwiZGlkQ2hhbmdlU2VsZWN0aW9uUmFuZ2UiLCJkaWREZXN0cm95U2VsZWN0aW9uIiwib2xkTGluZU51bWJlckxhYmVsIiwiZGlkTW91c2VEb3duT25MaW5lTnVtYmVyIiwiZGlkTW91c2VNb3ZlT25MaW5lTnVtYmVyIiwibmV3TGluZU51bWJlckxhYmVsIiwiZ2V0IiwiYmxhbmtMYWJlbCIsInJlbmRlclBSQ29tbWVudEljb25zIiwicmVuZGVyRmlsZVBhdGNoRGVjb3JhdGlvbnMiLCJyZW5kZXJMaW5lRGVjb3JhdGlvbnMiLCJJbmZpbml0eSIsImd1dHRlciIsImljb24iLCJsaW5lIiwicmVuZGVyRGVjb3JhdGlvbnNPbkxheWVyIiwiZ2V0QWRkaXRpb25MYXllciIsImdldERlbGV0aW9uTGF5ZXIiLCJnZXROb05ld2xpbmVMYXllciIsInJldmlld0NvbW1lbnRzTG9hZGluZyIsInJldmlld0NvbW1lbnRUaHJlYWRzIiwiY29tbWVudHMiLCJ0aHJlYWQiLCJwYXRoIiwiZ2V0UGF0Y2hGb3JQYXRoIiwiaXNSb3dTZWxlY3RlZCIsImhhcyIsImlkIiwiZW5kcG9pbnQiLCJvd25lciIsInJlcG8iLCJudW1iZXIiLCJ3b3JrZGlyUGF0aCIsIm5hbWUiLCJvcmRlck9mZnNldCIsInNob3dEaWZmIiwiY29tcG9uZW50IiwicGFja2FnZSIsIm9sZE1vZGUiLCJnZXRPbGRNb2RlIiwibmV3TW9kZSIsImdldE5ld01vZGUiLCJhdHRycyIsImFjdGlvbkljb24iLCJhY3Rpb25UZXh0IiwiaGFzU3ltbGluayIsImRldGFpbCIsInRpdGxlIiwib2xkU3ltbGluayIsImdldE9sZFN5bWxpbmsiLCJuZXdTeW1saW5rIiwiZ2V0TmV3U3ltbGluayIsInRvZ2dsZVZlcmIiLCJzZWxlY3RlZEh1bmtzIiwiY29udGFpbnNTZWxlY3Rpb24iLCJpc1NlbGVjdGVkIiwiYnV0dG9uU3VmZml4IiwidG9nZ2xlU2VsZWN0aW9uTGFiZWwiLCJkaXNjYXJkU2VsZWN0aW9uTGFiZWwiLCJzdGFydFBvaW50Iiwic3RhcnRSYW5nZSIsImtleW1hcHMiLCJ0b2dnbGVIdW5rU2VsZWN0aW9uIiwiZGlzY2FyZEh1bmtTZWxlY3Rpb24iLCJkaWRNb3VzZURvd25PbkhlYWRlciIsInJhbmdlcyIsImxpbmVDbGFzcyIsInJlZkhvbGRlciIsImxlbmd0aCIsImhvbGRlciIsInJhbmdlIiwicmVuZGVyRGVjb3JhdGlvbnMiLCJsYXllciIsImdldE1hcmtlckNvdW50IiwidG9nZ2xlUm93cyIsImNoYW5nZVJvd3MiLCJnZXRDaGFuZ2VzIiwicmVkdWNlIiwicm93cyIsImNoYW5nZSIsInB1c2giLCJnZXRCdWZmZXJSb3dzIiwiZXZlbnQiLCJoYW5kbGVTZWxlY3Rpb25FdmVudCIsImJ1ZmZlclJvdyIsInVuZGVmaW5lZCIsImlzTmFOIiwiZG9tRXZlbnQiLCJyYW5nZUxpa2UiLCJvcHRzIiwiYnV0dG9uIiwiaXNXaW5kb3dzIiwicHJvY2VzcyIsInBsYXRmb3JtIiwiY3RybEtleSIsIm9wdGlvbnMiLCJjb252ZXJ0ZWQiLCJjbGlwQnVmZmVyUmFuZ2UiLCJnZXRPciIsIm1ldGFLZXkiLCJpbnRlcnNlY3RzIiwid2l0aG91dCIsInNlbGVjdGlvbiIsImdldFNlbGVjdGlvbnMiLCJpbnRlcnNlY3RzQnVmZmVyUmFuZ2UiLCJzZWxlY3Rpb25SYW5nZSIsImdldEJ1ZmZlclJhbmdlIiwibmV3UmFuZ2VzIiwibnVkZ2VkIiwibGFzdENvbHVtbiIsImxpbmVMZW5ndGhGb3JSb3ciLCJlbmQiLCJzZXRCdWZmZXJSYW5nZSIsIm5ld1JhbmdlIiwic2xpY2UiLCJhZGRTZWxlY3Rpb25Gb3JCdWZmZXJSYW5nZSIsInJldmVyc2VkIiwiaXNSZXZlcnNlZCIsInJlcGxhY2VtZW50UmFuZ2VzIiwiZWFjaCIsInNoaWZ0S2V5IiwibGFzdFNlbGVjdGlvbiIsImdldExhc3RTZWxlY3Rpb24iLCJsYXN0U2VsZWN0aW9uUmFuZ2UiLCJpc0JlZm9yZSIsImlzTGVzc1RoYW4iLCJmYXJFZGdlIiwiZ2V0U2VsZWN0ZWRIdW5rcyIsIndpdGhTZWxlY3Rpb25Nb2RlIiwiaHVua1JhbmdlcyIsImZpcnN0Q2hhbmdlUm93IiwiZmlyc3RDaGFuZ2UiLCJnZXRTdGFydEJ1ZmZlclJvdyIsIndpdGhTZWxlY3RlZEh1bmtzIiwiZ2V0SHVua0FmdGVyIiwiZ2V0SHVua0JlZm9yZSIsImN1cnNvcnNCeUZpbGVQYXRjaCIsIk1hcCIsInBsYWNlZFJvd3MiLCJjdXJzb3IiLCJnZXRDdXJzb3JzIiwiY3Vyc29yUm93IiwiZ2V0QnVmZmVyUG9zaXRpb24iLCJnZXRGaWxlUGF0Y2hBdCIsIm5ld1JvdyIsImdldE5ld1Jvd0F0IiwibmV3Q29sdW1uIiwibmVhcmVzdFJvdyIsImdldE5ld1N0YXJ0Um93IiwicmVnaW9uIiwiZ2V0UmVnaW9ucyIsImluY2x1ZGVzQnVmZmVyUm93Iiwid2hlbiIsInVuY2hhbmdlZCIsImJ1ZmZlclJvd0NvdW50IiwiYWRkaXRpb24iLCJjdXJzb3JzIiwic2V0IiwiZmlsZVBhdGNoZXNXaXRoQ3Vyc29ycyIsImtleXMiLCJvcGVuRmlsZSIsInBlbmRpbmciLCJ2YWx1ZSIsImdldFNlbGVjdGVkUm93cyIsImFjYyIsImlzQ2hhbmdlUm93Iiwib2xkQnVmZmVyUmFuZ2UiLCJuZXdCdWZmZXJSYW5nZSIsIm5leHRDdXJzb3JSb3dzIiwiZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zIiwic3BhbnNNdWx0aXBsZUZpbGVzIiwic2VsZWN0ZWRSb3dzQ2hhbmdlZCIsInNvZnRXcmFwcGVkIiwicGFkIiwib2xkUm93IiwiZ2V0T2xkUm93QXQiLCJjYWxsYmFjayIsInNlZW4iLCJnZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcyIsInBhdGNoZXMiLCJwYXRjaCIsInByZXZSb3ciLCJuZXh0Um93IiwiY2hhbmdlTGF5ZXJzIiwic29tZSIsImZpbmRNYXJrZXJzIiwiaW50ZXJzZWN0c1JvdyIsImNhbGxiYWNrcyIsIkVycm9yIiwibnVtIiwibWF4RGlnaXRzIiwiZ2V0TWF4TGluZU51bWJlcldpZHRoIiwiTkJTUF9DSEFSQUNURVIiLCJyZXBlYXQiLCJ0b1N0cmluZyIsImFjdGlvbiIsImdldEVudHJpZXNCeU5hbWUiLCJtZWFzdXJlIiwicGVyZiIsImZpbGVQYXRjaGVzTGluZUNvdW50cyIsImdldFBhdGNoIiwiZ2V0Q2hhbmdlZExpbmVDb3VudCIsImR1cmF0aW9uIiwiUHJvcFR5cGVzIiwib25lT2YiLCJib29sIiwiSXRlbVR5cGVQcm9wVHlwZSIsImlzUmVxdWlyZWQiLCJyZXBvc2l0b3J5Iiwib2JqZWN0IiwiTXVsdGlGaWxlUGF0Y2hQcm9wVHlwZSIsImFycmF5T2YiLCJzaGFwZSIsInB1bGxSZXF1ZXN0IiwiZnVuYyIsInN3aXRjaFRvSXNzdWVpc2giLCJSZWZIb2xkZXJQcm9wVHlwZSIsInN0cmluZyIsIkVuZHBvaW50UHJvcFR5cGUiLCJEaXNwb3NhYmxlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUFFQSxNQUFNQSxjQUFjLEdBQUc7QUFDckIsR0FBQ0MsY0FBS0MsS0FBTCxDQUFXQyxNQUFaLEdBQXFCLGdCQURBO0FBRXJCLEdBQUNGLGNBQUtDLEtBQUwsQ0FBV0UsVUFBWixHQUF5QjtBQUZKLENBQXZCOztBQUtlLE1BQU1DLGtCQUFOLFNBQWlDQyxlQUFNQyxTQUF2QyxDQUFpRDtBQXNFOURDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2pCLFVBQU1BLEtBQU47O0FBRGlCLHdEQTJXVSxDQUFDQyxTQUFELEVBQVlDLEtBQVosS0FBc0I7QUFDakQsWUFBTUMsV0FBVyxHQUFH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RTBSLG1CQUFVVyxJQTNDWjtBQTRDakJqUyxFQUFBQSxnQkFBZ0IsRUFBRXNSLG1CQUFVVyxJQTVDWDtBQThDakI7QUFDQWpVLEVBQUFBLFNBQVMsRUFBRW1VLDZCQS9DTTtBQWdEakI1UyxFQUFBQSxlQUFlLEVBQUU0Uyw2QkFoREE7QUFrRGpCO0FBQ0FqUSxFQUFBQSxjQUFjLEVBQUVvUCxtQkFBVVcsSUFuRFQ7QUFvRGpCbFEsRUFBQUEsbUJBQW1CLEVBQUV1UCxtQkFBVWMsTUFwRGQ7QUFvRHNCcFEsRUFBQUEsdUJBQXVCLEVBQUVzUCxtQkFBVTVLLE1BcER6RDtBQXNEakI7QUFDQUgsRUFBQUEsUUFBUSxFQUFFOEwsNEJBdkRPO0FBd0RqQjdMLEVBQUFBLEtBQUssRUFBRThLLG1CQUFVYyxNQXhEQTtBQXlEakIzTCxFQUFBQSxJQUFJLEVBQUU2SyxtQkFBVWMsTUF6REM7QUEwRGpCMUwsRUFBQUEsTUFBTSxFQUFFNEssbUJBQVU1SyxNQTFERDtBQTJEakJDLEVBQUFBLFdBQVcsRUFBRTJLLG1CQUFVYztBQTNETixDOztnQkFEQXRZLGtCLGtCQStERztBQUNwQjhGLEVBQUFBLGlCQUFpQixFQUFFLE1BQU0sSUFBSTBTLG9CQUFKLEVBREw7QUFFcEJ0UyxFQUFBQSxnQkFBZ0IsRUFBRSxNQUFNLElBQUlzUyxvQkFBSixFQUZKO0FBR3BCeE0sRUFBQUEscUJBQXFCLEVBQUUsS0FISDtBQUlwQkMsRUFBQUEsb0JBQW9CLEVBQUU7QUFKRixDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7RnJhZ21lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgY3ggZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQge1JhbmdlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnZXZlbnQta2l0JztcblxuaW1wb3J0IHthdXRvYmluZCwgTkJTUF9DSEFSQUNURVIsIGJsYW5rTGFiZWx9IGZyb20gJy4uL2hlbHBlcnMnO1xuaW1wb3J0IHthZGRFdmVudH0gZnJvbSAnLi4vcmVwb3J0ZXItcHJveHknO1xuaW1wb3J0IHtSZWZIb2xkZXJQcm9wVHlwZSwgTXVsdGlGaWxlUGF0Y2hQcm9wVHlwZSwgSXRlbVR5cGVQcm9wVHlwZSwgRW5kcG9pbnRQcm9wVHlwZX0gZnJvbSAnLi4vcHJvcC10eXBlcyc7XG5pbXBvcnQgQXRvbVRleHRFZGl0b3IgZnJvbSAnLi4vYXRvbS9hdG9tLXRleHQtZWRpdG9yJztcbmltcG9ydCBNYXJrZXIgZnJvbSAnLi4vYXRvbS9tYXJrZXInO1xuaW1wb3J0IE1hcmtlckxheWVyIGZyb20gJy4uL2F0b20vbWFya2VyLWxheWVyJztcbmltcG9ydCBEZWNvcmF0aW9uIGZyb20gJy4uL2F0b20vZGVjb3JhdGlvbic7XG5pbXBvcnQgR3V0dGVyIGZyb20gJy4uL2F0b20vZ3V0dGVyJztcbmltcG9ydCBDb21tYW5kcywge0NvbW1hbmR9IGZyb20gJy4uL2F0b20vY29tbWFuZHMnO1xuaW1wb3J0IEZpbGVQYXRjaEhlYWRlclZpZXcgZnJvbSAnLi9maWxlLXBhdGNoLWhlYWRlci12aWV3JztcbmltcG9ydCBGaWxlUGF0Y2hNZXRhVmlldyBmcm9tICcuL2ZpbGUtcGF0Y2gtbWV0YS12aWV3JztcbmltcG9ydCBIdW5rSGVhZGVyVmlldyBmcm9tICcuL2h1bmstaGVhZGVyLXZpZXcnO1xuaW1wb3J0IFJlZkhvbGRlciBmcm9tICcuLi9tb2RlbHMvcmVmLWhvbGRlcic7XG5pbXBvcnQgQ2hhbmdlZEZpbGVJdGVtIGZyb20gJy4uL2l0ZW1zL2NoYW5nZWQtZmlsZS1pdGVtJztcbmltcG9ydCBDb21taXREZXRhaWxJdGVtIGZyb20gJy4uL2l0ZW1zL2NvbW1pdC1kZXRhaWwtaXRlbSc7XG5pbXBvcnQgQ29tbWVudEd1dHRlckRlY29yYXRpb25Db250cm9sbGVyIGZyb20gJy4uL2NvbnRyb2xsZXJzL2NvbW1lbnQtZ3V0dGVyLWRlY29yYXRpb24tY29udHJvbGxlcic7XG5pbXBvcnQgSXNzdWVpc2hEZXRhaWxJdGVtIGZyb20gJy4uL2l0ZW1zL2lzc3VlaXNoLWRldGFpbC1pdGVtJztcbmltcG9ydCBGaWxlIGZyb20gJy4uL21vZGVscy9wYXRjaC9maWxlJztcblxuY29uc3QgZXhlY3V0YWJsZVRleHQgPSB7XG4gIFtGaWxlLm1vZGVzLk5PUk1BTF06ICdub24gZXhlY3V0YWJsZScsXG4gIFtGaWxlLm1vZGVzLkVYRUNVVEFCTEVdOiAnZXhlY3V0YWJsZScsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNdWx0aUZpbGVQYXRjaFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIC8vIEJlaGF2aW9yIGNvbnRyb2xzXG4gICAgc3RhZ2luZ1N0YXR1czogUHJvcFR5cGVzLm9uZU9mKFsnc3RhZ2VkJywgJ3Vuc3RhZ2VkJ10pLFxuICAgIGlzUGFydGlhbGx5U3RhZ2VkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBpdGVtVHlwZTogSXRlbVR5cGVQcm9wVHlwZS5pc1JlcXVpcmVkLFxuXG4gICAgLy8gTW9kZWxzXG4gICAgcmVwb3NpdG9yeTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIG11bHRpRmlsZVBhdGNoOiBNdWx0aUZpbGVQYXRjaFByb3BUeXBlLmlzUmVxdWlyZWQsXG4gICAgc2VsZWN0aW9uTW9kZTogUHJvcFR5cGVzLm9uZU9mKFsnaHVuaycsICdsaW5lJ10pLmlzUmVxdWlyZWQsXG4gICAgc2VsZWN0ZWRSb3dzOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgaGFzTXVsdGlwbGVGaWxlU2VsZWN0aW9uczogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBoYXNVbmRvSGlzdG9yeTogUHJvcFR5cGVzLmJvb2wsXG5cbiAgICAvLyBSZXZpZXcgY29tbWVudHNcbiAgICByZXZpZXdDb21tZW50c0xvYWRpbmc6IFByb3BUeXBlcy5ib29sLFxuICAgIHJldmlld0NvbW1lbnRUaHJlYWRzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgdGhyZWFkOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICBjb21tZW50czogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm9iamVjdCkuaXNSZXF1aXJlZCxcbiAgICB9KSksXG5cbiAgICAvLyBBdG9tIGVudmlyb25tZW50XG4gICAgd29ya3NwYWNlOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgY29tbWFuZHM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBrZXltYXBzOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgdG9vbHRpcHM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBjb25maWc6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBwdWxsUmVxdWVzdDogUHJvcFR5cGVzLm9iamVjdCxcblxuICAgIC8vIENhbGxiYWNrc1xuICAgIHNlbGVjdGVkUm93c0NoYW5nZWQ6IFByb3BUeXBlcy5mdW5jLFxuXG4gICAgLy8gQWN0aW9uIG1ldGhvZHNcbiAgICBzd2l0Y2hUb0lzc3VlaXNoOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBkaXZlSW50b01pcnJvclBhdGNoOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBzdXJmYWNlOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvcGVuRmlsZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgdG9nZ2xlRmlsZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgdG9nZ2xlUm93czogUHJvcFR5cGVzLmZ1bmMsXG4gICAgdG9nZ2xlTW9kZUNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgdG9nZ2xlU3ltbGlua0NoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgdW5kb0xhc3REaXNjYXJkOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBkaXNjYXJkUm93czogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25XaWxsVXBkYXRlUGF0Y2g6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uRGlkVXBkYXRlUGF0Y2g6IFByb3BUeXBlcy5mdW5jLFxuXG4gICAgLy8gRXh0ZXJuYWwgcmVmc1xuICAgIHJlZkVkaXRvcjogUmVmSG9sZGVyUHJvcFR5cGUsXG4gICAgcmVmSW5pdGlhbEZvY3VzOiBSZWZIb2xkZXJQcm9wVHlwZSxcblxuICAgIC8vIGZvciBuYXZpZ2F0aW5nIHRoZSBQUiBjaGFuZ2VkIGZpbGVzIHRhYlxuICAgIG9uT3BlbkZpbGVzVGFiOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBpbml0Q2hhbmdlZEZpbGVQYXRoOiBQcm9wVHlwZXMuc3RyaW5nLCBpbml0Q2hhbmdlZEZpbGVQb3NpdGlvbjogUHJvcFR5cGVzLm51bWJlcixcblxuICAgIC8vIGZvciBvcGVuaW5nIHRoZSByZXZpZXdzIGRvY2sgaXRlbVxuICAgIGVuZHBvaW50OiBFbmRwb2ludFByb3BUeXBlLFxuICAgIG93bmVyOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHJlcG86IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgbnVtYmVyOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIHdvcmtkaXJQYXRoOiBQcm9wVHlwZXMuc3RyaW5nLFxuICB9XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBvbldpbGxVcGRhdGVQYXRjaDogKCkgPT4gbmV3IERpc3Bvc2FibGUoKSxcbiAgICBvbkRpZFVwZGF0ZVBhdGNoOiAoKSA9PiBuZXcgRGlzcG9zYWJsZSgpLFxuICAgIHJldmlld0NvbW1lbnRzTG9hZGluZzogZmFsc2UsXG4gICAgcmV2aWV3Q29tbWVudFRocmVhZHM6IFtdLFxuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgYXV0b2JpbmQoXG4gICAgICB0aGlzLFxuICAgICAgJ2RpZE1vdXNlRG93bk9uSGVhZGVyJywgJ2RpZE1vdXNlRG93bk9uTGluZU51bWJlcicsICdkaWRNb3VzZU1vdmVPbkxpbmVOdW1iZXInLCAnZGlkTW91c2VVcCcsXG4gICAgICAnZGlkQ29uZmlybScsICdkaWRUb2dnbGVTZWxlY3Rpb25Nb2RlJywgJ3NlbGVjdE5leHRIdW5rJywgJ3NlbGVjdFByZXZpb3VzSHVuaycsXG4gICAgICAnZGlkT3BlbkZpbGUnLCAnZGlkQWRkU2VsZWN0aW9uJywgJ2RpZENoYW5nZVNlbGVjdGlvblJhbmdlJywgJ2RpZERlc3Ryb3lTZWxlY3Rpb24nLFxuICAgICAgJ29sZExpbmVOdW1iZXJMYWJlbCcsICduZXdMaW5lTnVtYmVyTGFiZWwnLFxuICAgICk7XG5cbiAgICB0aGlzLm1vdXNlU2VsZWN0aW9uSW5Qcm9ncmVzcyA9IGZhbHNlO1xuICAgIHRoaXMubGFzdE1vdXNlTW92ZUxpbmUgPSBudWxsO1xuICAgIHRoaXMubmV4dFNlbGVjdGlvbk1vZGUgPSBudWxsO1xuICAgIHRoaXMucmVmUm9vdCA9IG5ldyBSZWZIb2xkZXIoKTtcbiAgICB0aGlzLnJlZkVkaXRvciA9IG5ldyBSZWZIb2xkZXIoKTtcbiAgICB0aGlzLnJlZkVkaXRvckVsZW1lbnQgPSBuZXcgUmVmSG9sZGVyKCk7XG4gICAgdGhpcy5tb3VudGVkID0gZmFsc2U7XG5cbiAgICB0aGlzLnN1YnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgdGhpcy5zdWJzLmFkZChcbiAgICAgIHRoaXMucmVmRWRpdG9yLm9ic2VydmUoZWRpdG9yID0+IHtcbiAgICAgICAgdGhpcy5yZWZFZGl0b3JFbGVtZW50LnNldHRlcihlZGl0b3IuZ2V0RWxlbWVudCgpKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucmVmRWRpdG9yKSB7XG4gICAgICAgICAgdGhpcy5wcm9wcy5yZWZFZGl0b3Iuc2V0dGVyKGVkaXRvcik7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgdGhpcy5yZWZFZGl0b3JFbGVtZW50Lm9ic2VydmUoZWxlbWVudCA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMucmVmSW5pdGlhbEZvY3VzICYmIHRoaXMucHJvcHMucmVmSW5pdGlhbEZvY3VzLnNldHRlcihlbGVtZW50KTtcbiAgICAgIH0pLFxuICAgICk7XG5cbiAgICAvLyBTeW5jaHJvbm91c2x5IG1haW50YWluIHRoZSBlZGl0b3IncyBzY3JvbGwgcG9zaXRpb24gYW5kIGxvZ2ljYWwgc2VsZWN0aW9uIGFjcm9zcyBidWZmZXIgdXBkYXRlcy5cbiAgICB0aGlzLnN1cHByZXNzQ2hhbmdlcyA9IGZhbHNlO1xuICAgIGxldCBsYXN0U2Nyb2xsVG9wID0gbnVsbDtcbiAgICBsZXQgbGFzdFNjcm9sbExlZnQgPSBudWxsO1xuICAgIGxldCBsYXN0U2VsZWN0aW9uSW5kZXggPSBudWxsO1xuICAgIHRoaXMuc3Vicy5hZGQoXG4gICAgICB0aGlzLnByb3BzLm9uV2lsbFVwZGF0ZVBhdGNoKCgpID0+IHtcbiAgICAgICAgdGhpcy5zdXBwcmVzc0NoYW5nZXMgPSB0cnVlO1xuICAgICAgICB0aGlzLnJlZkVkaXRvci5tYXAoZWRpdG9yID0+IHtcbiAgICAgICAgICBsYXN0U2VsZWN0aW9uSW5kZXggPSB0aGlzLnByb3BzLm11bHRpRmlsZVBhdGNoLmdldE1heFNlbGVjdGlvbkluZGV4KHRoaXMucHJvcHMuc2VsZWN0ZWRSb3dzKTtcbiAgICAgICAgICBsYXN0U2Nyb2xsVG9wID0gZWRpdG9yLmdldEVsZW1lbnQoKS5nZXRTY3JvbGxUb3AoKTtcbiAgICAgICAgICBsYXN0U2Nyb2xsTGVmdCA9IGVkaXRvci5nZXRFbGVtZW50KCkuZ2V0U2Nyb2xsTGVmdCgpO1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9KTtcbiAgICAgIH0pLFxuICAgICAgdGhpcy5wcm9wcy5vbkRpZFVwZGF0ZVBhdGNoKG5leHRQYXRjaCA9PiB7XG4gICAgICAgIHRoaXMucmVmRWRpdG9yLm1hcChlZGl0b3IgPT4ge1xuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICAgICAgaWYgKGxhc3RTZWxlY3Rpb25JbmRleCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgbmV4dFNlbGVjdGlvblJhbmdlID0gbmV4dFBhdGNoLmdldFNlbGVjdGlvblJhbmdlRm9ySW5kZXgobGFzdFNlbGVjdGlvbkluZGV4KTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGlvbk1vZGUgPT09ICdsaW5lJykge1xuICAgICAgICAgICAgICB0aGlzLm5leHRTZWxlY3Rpb25Nb2RlID0gJ2xpbmUnO1xuICAgICAgICAgICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShuZXh0U2VsZWN0aW9uUmFuZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc3QgbmV4dEh1bmtzID0gbmV3IFNldChcbiAgICAgICAgICAgICAgICBSYW5nZS5mcm9tT2JqZWN0KG5leHRTZWxlY3Rpb25SYW5nZSkuZ2V0Um93cygpXG4gICAgICAgICAgICAgICAgICAubWFwKHJvdyA9PiBuZXh0UGF0Y2guZ2V0SHVua0F0KHJvdykpXG4gICAgICAgICAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgIGNvbnN0IG5leHRSYW5nZXMgPSBuZXh0SHVua3Muc2l6ZSA+IDBcbiAgICAgICAgICAgICAgICA/IEFycmF5LmZyb20obmV4dEh1bmtzLCBodW5rID0+IGh1bmsuZ2V0UmFuZ2UoKSlcbiAgICAgICAgICAgICAgICA6IFtbWzAsIDBdLCBbMCwgMF1dXTtcblxuICAgICAgICAgICAgICB0aGlzLm5leHRTZWxlY3Rpb25Nb2RlID0gJ2h1bmsnO1xuICAgICAgICAgICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMobmV4dFJhbmdlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgICAgICBpZiAobGFzdFNjcm9sbFRvcCAhPT0gbnVsbCkgeyBlZGl0b3IuZ2V0RWxlbWVudCgpLnNldFNjcm9sbFRvcChsYXN0U2Nyb2xsVG9wKTsgfVxuXG4gICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgICAgICBpZiAobGFzdFNjcm9sbExlZnQgIT09IG51bGwpIHsgZWRpdG9yLmdldEVsZW1lbnQoKS5zZXRTY3JvbGxMZWZ0KGxhc3RTY3JvbGxMZWZ0KTsgfVxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zdXBwcmVzc0NoYW5nZXMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kaWRDaGFuZ2VTZWxlY3RlZFJvd3MoKTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLm1vdW50ZWQgPSB0cnVlO1xuICAgIHRoaXMubWVhc3VyZVBlcmZvcm1hbmNlKCdtb3VudCcpO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLmRpZE1vdXNlVXApO1xuICAgIHRoaXMucmVmRWRpdG9yLm1hcChlZGl0b3IgPT4ge1xuICAgICAgLy8gdGhpcy5wcm9wcy5tdWx0aUZpbGVQYXRjaCBpcyBndWFyYW50ZWVkIHRvIGNvbnRhaW4gYXQgbGVhc3Qgb25lIEZpbGVQYXRjaCBpZiA8QXRvbVRleHRFZGl0b3I+IGlzIHJlbmRlcmVkLlxuICAgICAgY29uc3QgW2ZpcnN0UGF0Y2hdID0gdGhpcy5wcm9wcy5tdWx0aUZpbGVQYXRjaC5nZXRGaWxlUGF0Y2hlcygpO1xuICAgICAgY29uc3QgW2ZpcnN0SHVua10gPSBmaXJzdFBhdGNoLmdldEh1bmtzKCk7XG4gICAgICBpZiAoIWZpcnN0SHVuaykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5uZXh0U2VsZWN0aW9uTW9kZSA9ICdodW5rJztcbiAgICAgIGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKGZpcnN0SHVuay5nZXRSYW5nZSgpKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zdWJzLmFkZChcbiAgICAgIHRoaXMucHJvcHMuY29uZmlnLm9uRGlkQ2hhbmdlKCdnaXRodWIuc2hvd0RpZmZJY29uR3V0dGVyJywgKCkgPT4gdGhpcy5mb3JjZVVwZGF0ZSgpKSxcbiAgICApO1xuXG4gICAgY29uc3Qge2luaXRDaGFuZ2VkRmlsZVBhdGgsIGluaXRDaGFuZ2VkRmlsZVBvc2l0aW9ufSA9IHRoaXMucHJvcHM7XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGlmIChpbml0Q2hhbmdlZEZpbGVQYXRoICYmIGluaXRDaGFuZ2VkRmlsZVBvc2l0aW9uID49IDApIHtcbiAgICAgIHRoaXMuc2Nyb2xsVG9GaWxlKHtcbiAgICAgICAgY2hhbmdlZEZpbGVQYXRoOiBpbml0Q2hhbmdlZEZpbGVQYXRoLFxuICAgICAgICBjaGFuZ2VkRmlsZVBvc2l0aW9uOiBpbml0Q2hhbmdlZEZpbGVQb3NpdGlvbixcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICh0aGlzLnByb3BzLm9uT3BlbkZpbGVzVGFiKSB7XG4gICAgICB0aGlzLnN1YnMuYWRkKFxuICAgICAgICB0aGlzLnByb3BzLm9uT3BlbkZpbGVzVGFiKHRoaXMuc2Nyb2xsVG9GaWxlKSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcykge1xuICAgIHRoaXMubWVhc3VyZVBlcmZvcm1hbmNlKCd1cGRhdGUnKTtcblxuICAgIGlmIChwcmV2UHJvcHMucmVmSW5pdGlhbEZvY3VzICE9PSB0aGlzLnByb3BzLnJlZkluaXRpYWxGb2N1cykge1xuICAgICAgcHJldlByb3BzLnJlZkluaXRpYWxGb2N1cyAmJiBwcmV2UHJvcHMucmVmSW5pdGlhbEZvY3VzLnNldHRlcihudWxsKTtcbiAgICAgIHRoaXMucHJvcHMucmVmSW5pdGlhbEZvY3VzICYmIHRoaXMucmVmRWRpdG9yRWxlbWVudC5tYXAodGhpcy5wcm9wcy5yZWZJbml0aWFsRm9jdXMuc2V0dGVyKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcm9wcy5tdWx0aUZpbGVQYXRjaCA9PT0gcHJldlByb3BzLm11bHRpRmlsZVBhdGNoKSB7XG4gICAgICB0aGlzLm5leHRTZWxlY3Rpb25Nb2RlID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuZGlkTW91c2VVcCk7XG4gICAgdGhpcy5zdWJzLmRpc3Bvc2UoKTtcbiAgICB0aGlzLm1vdW50ZWQgPSBmYWxzZTtcbiAgICBwZXJmb3JtYW5jZS5jbGVhck1hcmtzKCk7XG4gICAgcGVyZm9ybWFuY2UuY2xlYXJNZWFzdXJlcygpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHJvb3RDbGFzcyA9IGN4KFxuICAgICAgJ2dpdGh1Yi1GaWxlUGF0Y2hWaWV3JyxcbiAgICAgIHtbYGdpdGh1Yi1GaWxlUGF0Y2hWaWV3LS0ke3RoaXMucHJvcHMuc3RhZ2luZ1N0YXR1c31gXTogdGhpcy5wcm9wcy5zdGFnaW5nU3RhdHVzfSxcbiAgICAgIHsnZ2l0aHViLUZpbGVQYXRjaFZpZXctLWJsYW5rJzogIXRoaXMucHJvcHMubXVsdGlGaWxlUGF0Y2guYW55UHJlc2VudCgpfSxcbiAgICAgIHsnZ2l0aHViLUZpbGVQYXRjaFZpZXctLWh1bmtNb2RlJzogdGhpcy5wcm9wcy5zZWxlY3Rpb25Nb2RlID09PSAnaHVuayd9LFxuICAgICk7XG5cbiAgICBpZiAodGhpcy5tb3VudGVkKSB7XG4gICAgICBwZXJmb3JtYW5jZS5tYXJrKCdNdWx0aUZpbGVQYXRjaFZpZXctdXBkYXRlLXN0YXJ0Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBlcmZvcm1hbmNlLm1hcmsoJ011bHRpRmlsZVBhdGNoVmlldy1tb3VudC1zdGFydCcpO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17cm9vdENsYXNzfSByZWY9e3RoaXMucmVmUm9vdC5zZXR0ZXJ9PlxuICAgICAgICB7dGhpcy5yZW5kZXJDb21tYW5kcygpfVxuXG4gICAgICAgIDxtYWluIGNsYXNzTmFtZT1cImdpdGh1Yi1GaWxlUGF0Y2hWaWV3LWNvbnRhaW5lclwiPlxuICAgICAgICAgIHt0aGlzLnByb3BzLm11bHRpRmlsZVBhdGNoLmFueVByZXNlbnQoKSA/IHRoaXMucmVuZGVyTm9uRW1wdHlQYXRjaCgpIDogdGhpcy5yZW5kZXJFbXB0eVBhdGNoKCl9XG4gICAgICAgIDwvbWFpbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICByZW5kZXJDb21tYW5kcygpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5pdGVtVHlwZSA9PT0gQ29tbWl0RGV0YWlsSXRlbSB8fCB0aGlzLnByb3BzLml0ZW1UeXBlID09PSBJc3N1ZWlzaERldGFpbEl0ZW0pIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxDb21tYW5kcyByZWdpc3RyeT17dGhpcy5wcm9wcy5jb21tYW5kc30gdGFyZ2V0PXt0aGlzLnJlZlJvb3R9PlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6c2VsZWN0LW5leHQtaHVua1wiIGNhbGxiYWNrPXt0aGlzLnNlbGVjdE5leHRIdW5rfSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6c2VsZWN0LXByZXZpb3VzLWh1bmtcIiBjYWxsYmFjaz17dGhpcy5zZWxlY3RQcmV2aW91c0h1bmt9IC8+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1Yjp0b2dnbGUtcGF0Y2gtc2VsZWN0aW9uLW1vZGVcIiBjYWxsYmFjaz17dGhpcy5kaWRUb2dnbGVTZWxlY3Rpb25Nb2RlfSAvPlxuICAgICAgICA8L0NvbW1hbmRzPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgc3RhZ2VNb2RlQ29tbWFuZCA9IG51bGw7XG4gICAgbGV0IHN0YWdlU3ltbGlua0NvbW1hbmQgPSBudWxsO1xuXG4gICAgaWYgKHRoaXMucHJvcHMubXVsdGlGaWxlUGF0Y2guZGlkQW55Q2hhbmdlRXhlY3V0YWJsZU1vZGUoKSkge1xuICAgICAgY29uc3QgY29tbWFuZCA9IHRoaXMucHJvcHMuc3RhZ2luZ1N0YXR1cyA9PT0gJ3Vuc3RhZ2VkJ1xuICAgICAgICA/ICdnaXRodWI6c3RhZ2UtZmlsZS1tb2RlLWNoYW5nZSdcbiAgICAgICAgOiAnZ2l0aHViOnVuc3RhZ2UtZmlsZS1tb2RlLWNoYW5nZSc7XG4gICAgICBzdGFnZU1vZGVDb21tYW5kID0gPENvbW1hbmQgY29tbWFuZD17Y29tbWFuZH0gY2FsbGJhY2s9e3RoaXMuZGlkVG9nZ2xlTW9kZUNoYW5nZX0gLz47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJvcHMubXVsdGlGaWxlUGF0Y2guYW55SGF2ZVR5cGVjaGFuZ2UoKSkge1xuICAgICAgY29uc3QgY29tbWFuZCA9IHRoaXMucHJvcHMuc3RhZ2luZ1N0YXR1cyA9PT0gJ3Vuc3RhZ2VkJ1xuICAgICAgICA/ICdnaXRodWI6c3RhZ2Utc3ltbGluay1jaGFuZ2UnXG4gICAgICAgIDogJ2dpdGh1Yjp1bnN0YWdlLXN5bWxpbmstY2hhbmdlJztcbiAgICAgIHN0YWdlU3ltbGlua0NvbW1hbmQgPSA8Q29tbWFuZCBjb21tYW5kPXtjb21tYW5kfSBjYWxsYmFjaz17dGhpcy5kaWRUb2dnbGVTeW1saW5rQ2hhbmdlfSAvPjtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPENvbW1hbmRzIHJlZ2lzdHJ5PXt0aGlzLnByb3BzLmNvbW1hbmRzfSB0YXJnZXQ9e3RoaXMucmVmUm9vdH0+XG4gICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6c2VsZWN0LW5leHQtaHVua1wiIGNhbGxiYWNrPXt0aGlzLnNlbGVjdE5leHRIdW5rfSAvPlxuICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiZ2l0aHViOnNlbGVjdC1wcmV2aW91cy1odW5rXCIgY2FsbGJhY2s9e3RoaXMuc2VsZWN0UHJldmlvdXNIdW5rfSAvPlxuICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiY29yZTpjb25maXJtXCIgY2FsbGJhY2s9e3RoaXMuZGlkQ29uZmlybX0gLz5cbiAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImNvcmU6dW5kb1wiIGNhbGxiYWNrPXt0aGlzLnVuZG9MYXN0RGlzY2FyZEZyb21Db3JlVW5kb30gLz5cbiAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1YjpkaXNjYXJkLXNlbGVjdGVkLWxpbmVzXCIgY2FsbGJhY2s9e3RoaXMuZGlzY2FyZFNlbGVjdGlvbkZyb21Db21tYW5kfSAvPlxuICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiZ2l0aHViOmp1bXAtdG8tZmlsZVwiIGNhbGxiYWNrPXt0aGlzLmRpZE9wZW5GaWxlfSAvPlxuICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiZ2l0aHViOnN1cmZhY2VcIiBjYWxsYmFjaz17dGhpcy5wcm9wcy5zdXJmYWNlfSAvPlxuICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiZ2l0aHViOnRvZ2dsZS1wYXRjaC1zZWxlY3Rpb24tbW9kZVwiIGNhbGxiYWNrPXt0aGlzLmRpZFRvZ2dsZVNlbGVjdGlvbk1vZGV9IC8+XG4gICAgICAgIHtzdGFnZU1vZGVDb21tYW5kfVxuICAgICAgICB7c3RhZ2VTeW1saW5rQ29tbWFuZH1cbiAgICAgICAgey8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovIGF0b20uaW5EZXZNb2RlKCkgJiZcbiAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiZ2l0aHViOmluc3BlY3QtcGF0Y2hcIiBjYWxsYmFjaz17KCkgPT4ge1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMucHJvcHMubXVsdGlGaWxlUGF0Y2guZ2V0UGF0Y2hCdWZmZXIoKS5pbnNwZWN0KHtcbiAgICAgICAgICAgICAgbGF5ZXJOYW1lczogWydwYXRjaCcsICdodW5rJ10sXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICB9XG4gICAgICAgIHsvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqLyBhdG9tLmluRGV2TW9kZSgpICYmXG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1YjppbnNwZWN0LXJlZ2lvbnNcIiBjYWxsYmFjaz17KCkgPT4ge1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMucHJvcHMubXVsdGlGaWxlUGF0Y2guZ2V0UGF0Y2hCdWZmZXIoKS5pbnNwZWN0KHtcbiAgICAgICAgICAgICAgbGF5ZXJOYW1lczogWyd1bmNoYW5nZWQnLCAnZGVsZXRpb24nLCAnYWRkaXRpb24nLCAnbm9uZXdsaW5lJ10sXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICB9XG4gICAgICAgIHsvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqLyBhdG9tLmluRGV2TW9kZSgpICYmXG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1YjppbnNwZWN0LW1mcFwiIGNhbGxiYWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5wcm9wcy5tdWx0aUZpbGVQYXRjaC5pbnNwZWN0KCkpO1xuICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgfVxuICAgICAgPC9Db21tYW5kcz5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyRW1wdHlQYXRjaCgpIHtcbiAgICByZXR1cm4gPHAgY2xhc3NOYW1lPVwiZ2l0aHViLUZpbGVQYXRjaFZpZXctbWVzc2FnZSBpY29uIGljb24taW5mb1wiPk5vIGNoYW5nZXMgdG8gZGlzcGxheTwvcD47XG4gIH1cblxuICByZW5kZXJOb25FbXB0eVBhdGNoKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8QXRvbVRleHRFZGl0b3JcbiAgICAgICAgd29ya3NwYWNlPXt0aGlzLnByb3BzLndvcmtzcGFjZX1cblxuICAgICAgICBidWZmZXI9e3RoaXMucHJvcHMubXVsdGlGaWxlUGF0Y2guZ2V0QnVmZmVyKCl9XG4gICAgICAgIGxpbmVOdW1iZXJHdXR0ZXJWaXNpYmxlPXtmYWxzZX1cbiAgICAgICAgYXV0b1dpZHRoPXtmYWxzZX1cbiAgICAgICAgYXV0b0hlaWdodD17ZmFsc2V9XG4gICAgICAgIHJlYWRPbmx5PXt0cnVlfVxuICAgICAgICBzb2Z0V3JhcHBlZD17dHJ1ZX1cblxuICAgICAgICBkaWRBZGRTZWxlY3Rpb249e3RoaXMuZGlkQWRkU2VsZWN0aW9ufVxuICAgICAgICBkaWRDaGFuZ2VTZWxlY3Rpb25SYW5nZT17dGhpcy5kaWRDaGFuZ2VTZWxlY3Rpb25SYW5nZX1cbiAgICAgICAgZGlkRGVzdHJveVNlbGVjdGlvbj17dGhpcy5kaWREZXN0cm95U2VsZWN0aW9ufVxuICAgICAgICByZWZNb2RlbD17dGhpcy5yZWZFZGl0b3J9XG4gICAgICAgIGhpZGVFbXB0aW5lc3M9e3RydWV9PlxuXG4gICAgICAgIDxHdXR0ZXJcbiAgICAgICAgICBuYW1lPVwib2xkLWxpbmUtbnVtYmVyc1wiXG4gICAgICAgICAgcHJpb3JpdHk9ezF9XG4gICAgICAgICAgY2xhc3NOYW1lPVwib2xkXCJcbiAgICAgICAgICB0eXBlPVwibGluZS1udW1iZXJcIlxuICAgICAgICAgIGxhYmVsRm49e3RoaXMub2xkTGluZU51bWJlckxhYmVsfVxuICAgICAgICAgIG9uTW91c2VEb3duPXt0aGlzLmRpZE1vdXNlRG93bk9uTGluZU51bWJlcn1cbiAgICAgICAgICBvbk1vdXNlTW92ZT17dGhpcy5kaWRNb3VzZU1vdmVPbkxpbmVOdW1iZXJ9XG4gICAgICAgIC8+XG4gICAgICAgIDxHdXR0ZXJcbiAgICAgICAgICBuYW1lPVwibmV3LWxpbmUtbnVtYmVyc1wiXG4gICAgICAgICAgcHJpb3JpdHk9ezJ9XG4gICAgICAgICAgY2xhc3NOYW1lPVwibmV3XCJcbiAgICAgICAgICB0eXBlPVwibGluZS1udW1iZXJcIlxuICAgICAgICAgIGxhYmVsRm49e3RoaXMubmV3TGluZU51bWJlckxhYmVsfVxuICAgICAgICAgIG9uTW91c2VEb3duPXt0aGlzLmRpZE1vdXNlRG93bk9uTGluZU51bWJlcn1cbiAgICAgICAgICBvbk1vdXNlTW92ZT17dGhpcy5kaWRNb3VzZU1vdmVPbkxpbmVOdW1iZXJ9XG4gICAgICAgIC8+XG4gICAgICAgIDxHdXR0ZXJcbiAgICAgICAgICBuYW1lPVwiZ2l0aHViLWNvbW1lbnQtaWNvblwiXG4gICAgICAgICAgcHJpb3JpdHk9ezN9XG4gICAgICAgICAgY2xhc3NOYW1lPVwiY29tbWVudFwiXG4gICAgICAgICAgdHlwZT1cImRlY29yYXRlZFwiXG4gICAgICAgIC8+XG4gICAgICAgIHt0aGlzLnByb3BzLmNvbmZpZy5nZXQoJ2dpdGh1Yi5zaG93RGlmZkljb25HdXR0ZXInKSAmJiAoXG4gICAgICAgICAgPEd1dHRlclxuICAgICAgICAgICAgbmFtZT1cImRpZmYtaWNvbnNcIlxuICAgICAgICAgICAgcHJpb3JpdHk9ezR9XG4gICAgICAgICAgICB0eXBlPVwibGluZS1udW1iZXJcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiaWNvbnNcIlxuICAgICAgICAgICAgbGFiZWxGbj17YmxhbmtMYWJlbH1cbiAgICAgICAgICAgIG9uTW91c2VEb3duPXt0aGlzLmRpZE1vdXNlRG93bk9uTGluZU51bWJlcn1cbiAgICAgICAgICAgIG9uTW91c2VNb3ZlPXt0aGlzLmRpZE1vdXNlTW92ZU9uTGluZU51bWJlcn1cbiAgICAgICAgICAvPlxuICAgICAgICApfVxuXG4gICAgICAgIHt0aGlzLnJlbmRlclBSQ29tbWVudEljb25zKCl9XG5cbiAgICAgICAge3RoaXMucHJvcHMubXVsdGlGaWxlUGF0Y2guZ2V0RmlsZVBhdGNoZXMoKS5tYXAodGhpcy5yZW5kZXJGaWxlUGF0Y2hEZWNvcmF0aW9ucyl9XG5cbiAgICAgICAge3RoaXMucmVuZGVyTGluZURlY29yYXRpb25zKFxuICAgICAgICAgIEFycmF5LmZyb20odGhpcy5wcm9wcy5zZWxlY3RlZFJvd3MsIHJvdyA9PiBSYW5nZS5mcm9tT2JqZWN0KFtbcm93LCAwXSwgW3JvdywgSW5maW5pdHldXSkpLFxuICAgICAgICAgICdnaXRodWItRmlsZVBhdGNoVmlldy1saW5lLS1zZWxlY3RlZCcsXG4gICAgICAgICAge2d1dHRlcjogdHJ1ZSwgaWNvbjogdHJ1ZSwgbGluZTogdHJ1ZX0sXG4gICAgICAgICl9XG5cbiAgICAgICAge3RoaXMucmVuZGVyRGVjb3JhdGlvbnNPbkxheWVyKFxuICAgICAgICAgIHRoaXMucHJvcHMubXVsdGlGaWxlUGF0Y2guZ2V0QWRkaXRpb25MYXllcigpLFxuICAgICAgICAgICdnaXRodWItRmlsZVBhdGNoVmlldy1saW5lLS1hZGRlZCcsXG4gICAgICAgICAge2ljb246IHRydWUsIGxpbmU6IHRydWV9LFxuICAgICAgICApfVxuICAgICAgICB7dGhpcy5yZW5kZXJEZWNvcmF0aW9uc09uTGF5ZXIoXG4gICAgICAgICAgdGhpcy5wcm9wcy5tdWx0aUZpbGVQYXRjaC5nZXREZWxldGlvbkxheWVyKCksXG4gICAgICAgICAgJ2dpdGh1Yi1GaWxlUGF0Y2hWaWV3LWxpbmUtLWRlbGV0ZWQnLFxuICAgICAgICAgIHtpY29uOiB0cnVlLCBsaW5lOiB0cnVlfSxcbiAgICAgICAgKX1cbiAgICAgICAge3RoaXMucmVuZGVyRGVjb3JhdGlvbnNPbkxheWVyKFxuICAgICAgICAgIHRoaXMucHJvcHMubXVsdGlGaWxlUGF0Y2guZ2V0Tm9OZXdsaW5lTGF5ZXIoKSxcbiAgICAgICAgICAnZ2l0aHViLUZpbGVQYXRjaFZpZXctbGluZS0tbm9uZXdsaW5lJyxcbiAgICAgICAgICB7aWNvbjogdHJ1ZSwgbGluZTogdHJ1ZX0sXG4gICAgICAgICl9XG5cbiAgICAgIDwvQXRvbVRleHRFZGl0b3I+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlclBSQ29tbWVudEljb25zKCkge1xuICAgIGlmICh0aGlzLnByb3BzLml0ZW1UeXBlICE9PSBJc3N1ZWlzaERldGFpbEl0ZW0gfHxcbiAgICAgICAgdGhpcy5wcm9wcy5yZXZpZXdDb21tZW50c0xvYWRpbmcpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnByb3BzLnJldmlld0NvbW1lbnRUaHJlYWRzLm1hcCgoe2NvbW1lbnRzLCB0aHJlYWR9KSA9PiB7XG4gICAgICBjb25zdCB7cGF0aCwgcG9zaXRpb259ID0gY29tbWVudHNbMF07XG4gICAgICBpZiAoIXRoaXMucHJvcHMubXVsdGlGaWxlUGF0Y2guZ2V0UGF0Y2hGb3JQYXRoKHBhdGgpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByb3cgPSB0aGlzLnByb3BzLm11bHRpRmlsZVBhdGNoLmdldEJ1ZmZlclJvd0ZvckRpZmZQb3NpdGlvbihwYXRoLCBwb3NpdGlvbik7XG4gICAgICBpZiAocm93ID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpc1Jvd1NlbGVjdGVkID0gdGhpcy5wcm9wcy5zZWxlY3RlZFJvd3MuaGFzKHJvdyk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8Q29tbWVudEd1dHRlckRlY29yYXRpb25Db250cm9sbGVyXG4gICAgICAgICAga2V5PXtgZ2l0aHViLWNvbW1lbnQtZ3V0dGVyLWRlY29yYXRpb24tJHt0aHJlYWQuaWR9YH1cbiAgICAgICAgICBjb21tZW50Um93PXtyb3d9XG4gICAgICAgICAgdGhyZWFkSWQ9e3RocmVhZC5pZH1cbiAgICAgICAgICB3b3Jrc3BhY2U9e3RoaXMucHJvcHMud29ya3NwYWNlfVxuICAgICAgICAgIGVuZHBvaW50PXt0aGlzLnByb3BzLmVuZHBvaW50fVxuICAgICAgICAgIG93bmVyPXt0aGlzLnByb3BzLm93bmVyfVxuICAgICAgICAgIHJlcG89e3RoaXMucHJvcHMucmVwb31cbiAgICAgICAgICBudW1iZXI9e3RoaXMucHJvcHMubnVtYmVyfVxuICAgICAgICAgIHdvcmtkaXI9e3RoaXMucHJvcHMud29ya2RpclBhdGh9XG4gICAgICAgICAgZXh0cmFDbGFzc2VzPXtpc1Jvd1NlbGVjdGVkID8gWydnaXRodWItRmlsZVBhdGNoVmlldy1saW5lLS1zZWxlY3RlZCddIDogW119XG4gICAgICAgICAgcGFyZW50PXt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyRmlsZVBhdGNoRGVjb3JhdGlvbnMgPSAoZmlsZVBhdGNoLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IGlzQ29sbGFwc2VkID0gIWZpbGVQYXRjaC5nZXRSZW5kZXJTdGF0dXMoKS5pc1Zpc2libGUoKTtcbiAgICBjb25zdCBpc0VtcHR5ID0gZmlsZVBhdGNoLmdldE1hcmtlcigpLmdldFJhbmdlKCkuaXNFbXB0eSgpO1xuICAgIGNvbnN0IGlzRXhwYW5kYWJsZSA9IGZpbGVQYXRjaC5nZXRSZW5kZXJTdGF0dXMoKS5pc0V4cGFuZGFibGUoKTtcbiAgICBjb25zdCBpc1VuYXZhaWxhYmxlID0gaXNDb2xsYXBzZWQgJiYgIWlzRXhwYW5kYWJsZTtcbiAgICBjb25zdCBhdEVuZCA9IGZpbGVQYXRjaC5nZXRTdGFydFJhbmdlKCkuc3RhcnQuaXNFcXVhbCh0aGlzLnByb3BzLm11bHRpRmlsZVBhdGNoLmdldEJ1ZmZlcigpLmdldEVuZFBvc2l0aW9uKCkpO1xuICAgIGNvbnN0IHBvc2l0aW9uID0gaXNFbXB0eSAmJiBhdEVuZCA/ICdhZnRlcicgOiAnYmVmb3JlJztcblxuICAgIHJldHVybiAoXG4gICAgICA8RnJhZ21lbnQga2V5PXtmaWxlUGF0Y2guZ2V0UGF0aCgpfT5cbiAgICAgICAgPE1hcmtlciBpbnZhbGlkYXRlPVwibmV2ZXJcIiBidWZmZXJSYW5nZT17ZmlsZVBhdGNoLmdldFN0YXJ0UmFuZ2UoKX0+XG4gICAgICAgICAgPERlY29yYXRpb24gdHlwZT1cImJsb2NrXCIgcG9zaXRpb249e3Bvc2l0aW9ufSBvcmRlcj17aW5kZXh9IGNsYXNzTmFtZT1cImdpdGh1Yi1GaWxlUGF0Y2hWaWV3LWNvbnRyb2xCbG9ja1wiPlxuICAgICAgICAgICAgPEZpbGVQYXRjaEhlYWRlclZpZXdcbiAgICAgICAgICAgICAgaXRlbVR5cGU9e3RoaXMucHJvcHMuaXRlbVR5cGV9XG4gICAgICAgICAgICAgIHJlbFBhdGg9e2ZpbGVQYXRjaC5nZXRQYXRoKCl9XG4gICAgICAgICAgICAgIG5ld1BhdGg9e2ZpbGVQYXRjaC5nZXRTdGF0dXMoKSA9PT0gJ3JlbmFtZWQnID8gZmlsZVBhdGNoLmdldE5ld1BhdGgoKSA6IG51bGx9XG4gICAgICAgICAgICAgIHN0YWdpbmdTdGF0dXM9e3RoaXMucHJvcHMuc3RhZ2luZ1N0YXR1c31cbiAgICAgICAgICAgICAgaXNQYXJ0aWFsbHlTdGFnZWQ9e3RoaXMucHJvcHMuaXNQYXJ0aWFsbHlTdGFnZWR9XG4gICAgICAgICAgICAgIGhhc1VuZG9IaXN0b3J5PXt0aGlzLnByb3BzLmhhc1VuZG9IaXN0b3J5fVxuICAgICAgICAgICAgICBoYXNNdWx0aXBsZUZpbGVTZWxlY3Rpb25zPXt0aGlzLnByb3BzLmhhc011bHRpcGxlRmlsZVNlbGVjdGlvbnN9XG5cbiAgICAgICAgICAgICAgdG9vbHRpcHM9e3RoaXMucHJvcHMudG9vbHRpcHN9XG5cbiAgICAgICAgICAgICAgdW5kb0xhc3REaXNjYXJkPXsoKSA9PiB0aGlzLnVuZG9MYXN0RGlzY2FyZEZyb21CdXR0b24oZmlsZVBhdGNoKX1cbiAgICAgICAgICAgICAgZGl2ZUludG9NaXJyb3JQYXRjaD17KCkgPT4gdGhpcy5wcm9wcy5kaXZlSW50b01pcnJvclBhdGNoKGZpbGVQYXRjaCl9XG4gICAgICAgICAgICAgIG9wZW5GaWxlPXsoKSA9PiB0aGlzLmRpZE9wZW5GaWxlKHtzZWxlY3RlZEZpbGVQYXRjaDogZmlsZVBhdGNofSl9XG4gICAgICAgICAgICAgIHRvZ2dsZUZpbGU9eygpID0+IHRoaXMucHJvcHMudG9nZ2xlRmlsZShmaWxlUGF0Y2gpfVxuXG4gICAgICAgICAgICAgIGlzQ29sbGFwc2VkPXtpc0NvbGxhcHNlZH1cbiAgICAgICAgICAgICAgdHJpZ2dlckNvbGxhcHNlPXsoKSA9PiB0aGlzLnByb3BzLm11bHRpRmlsZVBhdGNoLmNvbGxhcHNlRmlsZVBhdGNoKGZpbGVQYXRjaCl9XG4gICAgICAgICAgICAgIHRyaWdnZXJFeHBhbmQ9eygpID0+IHRoaXMucHJvcHMubXVsdGlGaWxlUGF0Y2guZXhwYW5kRmlsZVBhdGNoKGZpbGVQYXRjaCl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgeyFpc0NvbGxhcHNlZCAmJiB0aGlzLnJlbmRlclN5bWxpbmtDaGFuZ2VNZXRhKGZpbGVQYXRjaCl9XG4gICAgICAgICAgICB7IWlzQ29sbGFwc2VkICYmIHRoaXMucmVuZGVyRXhlY3V0YWJsZU1vZGVDaGFuZ2VNZXRhKGZpbGVQYXRjaCl9XG4gICAgICAgICAgPC9EZWNvcmF0aW9uPlxuICAgICAgICA8L01hcmtlcj5cblxuICAgICAgICB7aXNFeHBhbmRhYmxlICYmIHRoaXMucmVuZGVyRGlmZkdhdGUoZmlsZVBhdGNoLCBwb3NpdGlvbiwgaW5kZXgpfVxuICAgICAgICB7aXNVbmF2YWlsYWJsZSAmJiB0aGlzLnJlbmRlckRpZmZVbmF2YWlsYWJsZShmaWxlUGF0Y2gsIHBvc2l0aW9uLCBpbmRleCl9XG5cbiAgICAgICAge3RoaXMucmVuZGVySHVua0hlYWRlcnMoZmlsZVBhdGNoLCBpbmRleCl9XG4gICAgICA8L0ZyYWdtZW50PlxuICAgICk7XG4gIH1cblxuICByZW5kZXJEaWZmR2F0ZShmaWxlUGF0Y2gsIHBvc2l0aW9uLCBvcmRlck9mZnNldCkge1xuICAgIGNvbnN0IHNob3dEaWZmID0gKCkgPT4ge1xuICAgICAgYWRkRXZlbnQoJ2V4cGFuZC1maWxlLXBhdGNoJywge2NvbXBvbmVudDogdGhpcy5jb25zdHJ1Y3Rvci5uYW1lLCBwYWNrYWdlOiAnZ2l0aHViJ30pO1xuICAgICAgdGhpcy5wcm9wcy5tdWx0aUZpbGVQYXRjaC5leHBhbmRGaWxlUGF0Y2goZmlsZVBhdGNoKTtcbiAgICB9O1xuICAgIHJldHVybiAoXG4gICAgICA8TWFya2VyIGludmFsaWRhdGU9XCJuZXZlclwiIGJ1ZmZlclJhbmdlPXtmaWxlUGF0Y2guZ2V0U3RhcnRSYW5nZSgpfT5cbiAgICAgICAgPERlY29yYXRpb25cbiAgICAgICAgICB0eXBlPVwiYmxvY2tcIlxuICAgICAgICAgIG9yZGVyPXtvcmRlck9mZnNldCArIDAuMX1cbiAgICAgICAgICBwb3NpdGlvbj17cG9zaXRpb259XG4gICAgICAgICAgY2xhc3NOYW1lPVwiZ2l0aHViLUZpbGVQYXRjaFZpZXctY29udHJvbEJsb2NrXCI+XG5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJnaXRodWItRmlsZVBhdGNoVmlldy1tZXNzYWdlIGljb24gaWNvbi1pbmZvXCI+XG4gICAgICAgICAgICBMYXJnZSBkaWZmcyBhcmUgY29sbGFwc2VkIGJ5IGRlZmF1bHQgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMuXG4gICAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiZ2l0aHViLUZpbGVQYXRjaFZpZXctc2hvd0RpZmZCdXR0b25cIiBvbkNsaWNrPXtzaG93RGlmZn0+IExvYWQgRGlmZjwvYnV0dG9uPlxuICAgICAgICAgIDwvcD5cblxuICAgICAgICA8L0RlY29yYXRpb24+XG4gICAgICA8L01hcmtlcj5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyRGlmZlVuYXZhaWxhYmxlKGZpbGVQYXRjaCwgcG9zaXRpb24sIG9yZGVyT2Zmc2V0KSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxNYXJrZXIgaW52YWxpZGF0ZT1cIm5ldmVyXCIgYnVmZmVyUmFuZ2U9e2ZpbGVQYXRjaC5nZXRTdGFydFJhbmdlKCl9PlxuICAgICAgICA8RGVjb3JhdGlvblxuICAgICAgICAgIHR5cGU9XCJibG9ja1wiXG4gICAgICAgICAgb3JkZXI9e29yZGVyT2Zmc2V0ICsgMC4xfVxuICAgICAgICAgIHBvc2l0aW9uPXtwb3NpdGlvbn1cbiAgICAgICAgICBjbGFzc05hbWU9XCJnaXRodWItRmlsZVBhdGNoVmlldy1jb250cm9sQmxvY2tcIj5cblxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cImdpdGh1Yi1GaWxlUGF0Y2hWaWV3LW1lc3NhZ2UgaWNvbiBpY29uLXdhcm5pbmdcIj5cbiAgICAgICAgICAgIFRoaXMgZGlmZiBpcyB0b28gbGFyZ2UgdG8gbG9hZCBhdCBhbGwuIFVzZSB0aGUgY29tbWFuZC1saW5lIHRvIHZpZXcgaXQuXG4gICAgICAgICAgPC9wPlxuXG4gICAgICAgIDwvRGVjb3JhdGlvbj5cbiAgICAgIDwvTWFya2VyPlxuICAgICk7XG4gIH1cblxuICByZW5kZXJFeGVjdXRhYmxlTW9kZUNoYW5nZU1ldGEoZmlsZVBhdGNoKSB7XG4gICAgaWYgKCFmaWxlUGF0Y2guZGlkQ2hhbmdlRXhlY3V0YWJsZU1vZGUoKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qgb2xkTW9kZSA9IGZpbGVQYXRjaC5nZXRPbGRNb2RlKCk7XG4gICAgY29uc3QgbmV3TW9kZSA9IGZpbGVQYXRjaC5nZXROZXdNb2RlKCk7XG5cbiAgICBjb25zdCBhdHRycyA9IHRoaXMucHJvcHMuc3RhZ2luZ1N0YXR1cyA9PT0gJ3Vuc3RhZ2VkJ1xuICAgICAgPyB7XG4gICAgICAgIGFjdGlvbkljb246ICdpY29uLW1vdmUtZG93bicsXG4gICAgICAgIGFjdGlvblRleHQ6ICdTdGFnZSBNb2RlIENoYW5nZScsXG4gICAgICB9XG4gICAgICA6IHtcbiAgICAgICAgYWN0aW9uSWNvbjogJ2ljb24tbW92ZS11cCcsXG4gICAgICAgIGFjdGlvblRleHQ6ICdVbnN0YWdlIE1vZGUgQ2hhbmdlJyxcbiAgICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgPEZpbGVQYXRjaE1ldGFWaWV3XG4gICAgICAgIHRpdGxlPVwiTW9kZSBjaGFuZ2VcIlxuICAgICAgICBhY3Rpb25JY29uPXthdHRycy5hY3Rpb25JY29ufVxuICAgICAgICBhY3Rpb25UZXh0PXthdHRycy5hY3Rpb25UZXh0fVxuICAgICAgICBpdGVtVHlwZT17dGhpcy5wcm9wcy5pdGVtVHlwZX1cbiAgICAgICAgYWN0aW9uPXsoKSA9PiB0aGlzLnByb3BzLnRvZ2dsZU1vZGVDaGFuZ2UoZmlsZVBhdGNoKX0+XG4gICAgICAgIDxGcmFnbWVudD5cbiAgICAgICAgICBGaWxlIGNoYW5nZWQgbW9kZVxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImdpdGh1Yi1GaWxlUGF0Y2hWaWV3LW1ldGFEaWZmIGdpdGh1Yi1GaWxlUGF0Y2hWaWV3LW1ldGFEaWZmLS1yZW1vdmVkXCI+XG4gICAgICAgICAgICBmcm9tIHtleGVjdXRhYmxlVGV4dFtvbGRNb2RlXX0gPGNvZGU+e29sZE1vZGV9PC9jb2RlPlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJnaXRodWItRmlsZVBhdGNoVmlldy1tZXRhRGlmZiBnaXRodWItRmlsZVBhdGNoVmlldy1tZXRhRGlmZi0tYWRkZWRcIj5cbiAgICAgICAgICAgIHRvIHtleGVjdXRhYmxlVGV4dFtuZXdNb2RlXX0gPGNvZGU+e25ld01vZGV9PC9jb2RlPlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPC9GcmFnbWVudD5cbiAgICAgIDwvRmlsZVBhdGNoTWV0YVZpZXc+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlclN5bWxpbmtDaGFuZ2VNZXRhKGZpbGVQYXRjaCkge1xuICAgIGlmICghZmlsZVBhdGNoLmhhc1N5bWxpbmsoKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IGRldGFpbCA9IDxkaXYgLz47XG4gICAgbGV0IHRpdGxlID0gJyc7XG4gICAgY29uc3Qgb2xkU3ltbGluayA9IGZpbGVQYXRjaC5nZXRPbGRTeW1saW5rKCk7XG4gICAgY29uc3QgbmV3U3ltbGluayA9IGZpbGVQYXRjaC5nZXROZXdTeW1saW5rKCk7XG4gICAgaWYgKG9sZFN5bWxpbmsgJiYgbmV3U3ltbGluaykge1xuICAgICAgZGV0YWlsID0gKFxuICAgICAgICA8RnJhZ21lbnQ+XG4gICAgICAgICAgU3ltbGluayBjaGFuZ2VkXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtjeChcbiAgICAgICAgICAgICdnaXRodWItRmlsZVBhdGNoVmlldy1tZXRhRGlmZicsXG4gICAgICAgICAgICAnZ2l0aHViLUZpbGVQYXRjaFZpZXctbWV0YURpZmYtLWZ1bGxXaWR0aCcsXG4gICAgICAgICAgICAnZ2l0aHViLUZpbGVQYXRjaFZpZXctbWV0YURpZmYtLXJlbW92ZWQnLFxuICAgICAgICAgICl9PlxuICAgICAgICAgICAgZnJvbSA8Y29kZT57b2xkU3ltbGlua308L2NvZGU+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17Y3goXG4gICAgICAgICAgICAnZ2l0aHViLUZpbGVQYXRjaFZpZXctbWV0YURpZmYnLFxuICAgICAgICAgICAgJ2dpdGh1Yi1GaWxlUGF0Y2hWaWV3LW1ldGFEaWZmLS1mdWxsV2lkdGgnLFxuICAgICAgICAgICAgJ2dpdGh1Yi1GaWxlUGF0Y2hWaWV3LW1ldGFEaWZmLS1hZGRlZCcsXG4gICAgICAgICAgKX0+XG4gICAgICAgICAgICB0byA8Y29kZT57bmV3U3ltbGlua308L2NvZGU+XG4gICAgICAgICAgPC9zcGFuPi5cbiAgICAgICAgPC9GcmFnbWVudD5cbiAgICAgICk7XG4gICAgICB0aXRsZSA9ICdTeW1saW5rIGNoYW5nZWQnO1xuICAgIH0gZWxzZSBpZiAob2xkU3ltbGluayAmJiAhbmV3U3ltbGluaykge1xuICAgICAgZGV0YWlsID0gKFxuICAgICAgICA8RnJhZ21lbnQ+XG4gICAgICAgICAgU3ltbGlua1xuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImdpdGh1Yi1GaWxlUGF0Y2hWaWV3LW1ldGFEaWZmIGdpdGh1Yi1GaWxlUGF0Y2hWaWV3LW1ldGFEaWZmLS1yZW1vdmVkXCI+XG4gICAgICAgICAgICB0byA8Y29kZT57b2xkU3ltbGlua308L2NvZGU+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIGRlbGV0ZWQuXG4gICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICApO1xuICAgICAgdGl0bGUgPSAnU3ltbGluayBkZWxldGVkJztcbiAgICB9IGVsc2Uge1xuICAgICAgZGV0YWlsID0gKFxuICAgICAgICA8RnJhZ21lbnQ+XG4gICAgICAgICAgU3ltbGlua1xuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImdpdGh1Yi1GaWxlUGF0Y2hWaWV3LW1ldGFEaWZmIGdpdGh1Yi1GaWxlUGF0Y2hWaWV3LW1ldGFEaWZmLS1hZGRlZFwiPlxuICAgICAgICAgICAgdG8gPGNvZGU+e25ld1N5bWxpbmt9PC9jb2RlPlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICBjcmVhdGVkLlxuICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgKTtcbiAgICAgIHRpdGxlID0gJ1N5bWxpbmsgY3JlYXRlZCc7XG4gICAgfVxuXG4gICAgY29uc3QgYXR0cnMgPSB0aGlzLnByb3BzLnN0YWdpbmdTdGF0dXMgPT09ICd1bnN0YWdlZCdcbiAgICAgID8ge1xuICAgICAgICBhY3Rpb25JY29uOiAnaWNvbi1tb3ZlLWRvd24nLFxuICAgICAgICBhY3Rpb25UZXh0OiAnU3RhZ2UgU3ltbGluayBDaGFuZ2UnLFxuICAgICAgfVxuICAgICAgOiB7XG4gICAgICAgIGFjdGlvbkljb246ICdpY29uLW1vdmUtdXAnLFxuICAgICAgICBhY3Rpb25UZXh0OiAnVW5zdGFnZSBTeW1saW5rIENoYW5nZScsXG4gICAgICB9O1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxGaWxlUGF0Y2hNZXRhVmlld1xuICAgICAgICB0aXRsZT17dGl0bGV9XG4gICAgICAgIGFjdGlvbkljb249e2F0dHJzLmFjdGlvbkljb259XG4gICAgICAgIGFjdGlvblRleHQ9e2F0dHJzLmFjdGlvblRleHR9XG4gICAgICAgIGl0ZW1UeXBlPXt0aGlzLnByb3BzLml0ZW1UeXBlfVxuICAgICAgICBhY3Rpb249eygpID0+IHRoaXMucHJvcHMudG9nZ2xlU3ltbGlua0NoYW5nZShmaWxlUGF0Y2gpfT5cbiAgICAgICAgPEZyYWdtZW50PlxuICAgICAgICAgIHtkZXRhaWx9XG4gICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICA8L0ZpbGVQYXRjaE1ldGFWaWV3PlxuICAgICk7XG4gIH1cblxuICByZW5kZXJIdW5rSGVhZGVycyhmaWxlUGF0Y2gsIG9yZGVyT2Zmc2V0KSB7XG4gICAgY29uc3QgdG9nZ2xlVmVyYiA9IHRoaXMucHJvcHMuc3RhZ2luZ1N0YXR1cyA9PT0gJ3Vuc3RhZ2VkJyA/ICdTdGFnZScgOiAnVW5zdGFnZSc7XG4gICAgY29uc3Qgc2VsZWN0ZWRIdW5rcyA9IG5ldyBTZXQoXG4gICAgICBBcnJheS5mcm9tKHRoaXMucHJvcHMuc2VsZWN0ZWRSb3dzLCByb3cgPT4gdGhpcy5wcm9wcy5tdWx0aUZpbGVQYXRjaC5nZXRIdW5rQXQocm93KSksXG4gICAgKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8RnJhZ21lbnQ+XG4gICAgICAgIDxNYXJrZXJMYXllcj5cbiAgICAgICAgICB7ZmlsZVBhdGNoLmdldEh1bmtzKCkubWFwKChodW5rLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29udGFpbnNTZWxlY3Rpb24gPSB0aGlzLnByb3BzLnNlbGVjdGlvbk1vZGUgPT09ICdsaW5lJyAmJiBzZWxlY3RlZEh1bmtzLmhhcyhodW5rKTtcbiAgICAgICAgICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSAodGhpcy5wcm9wcy5zZWxlY3Rpb25Nb2RlID09PSAnaHVuaycpICYmIHNlbGVjdGVkSHVua3MuaGFzKGh1bmspO1xuXG4gICAgICAgICAgICBsZXQgYnV0dG9uU3VmZml4ID0gJyc7XG4gICAgICAgICAgICBpZiAoY29udGFpbnNTZWxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgYnV0dG9uU3VmZml4ICs9ICdTZWxlY3RlZCBMaW5lJztcbiAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWRSb3dzLnNpemUgPiAxKSB7XG4gICAgICAgICAgICAgICAgYnV0dG9uU3VmZml4ICs9ICdzJztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYnV0dG9uU3VmZml4ICs9ICdIdW5rJztcbiAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkSHVua3Muc2l6ZSA+IDEpIHtcbiAgICAgICAgICAgICAgICBidXR0b25TdWZmaXggKz0gJ3MnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHRvZ2dsZVNlbGVjdGlvbkxhYmVsID0gYCR7dG9nZ2xlVmVyYn0gJHtidXR0b25TdWZmaXh9YDtcbiAgICAgICAgICAgIGNvbnN0IGRpc2NhcmRTZWxlY3Rpb25MYWJlbCA9IGBEaXNjYXJkICR7YnV0dG9uU3VmZml4fWA7XG5cbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0UG9pbnQgPSBodW5rLmdldFJhbmdlKCkuc3RhcnQ7XG4gICAgICAgICAgICBjb25zdCBzdGFydFJhbmdlID0gbmV3IFJhbmdlKHN0YXJ0UG9pbnQsIHN0YXJ0UG9pbnQpO1xuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8TWFya2VyIGtleT17YGh1bmtIZWFkZXItJHtpbmRleH1gfSBidWZmZXJSYW5nZT17c3RhcnRSYW5nZX0gaW52YWxpZGF0ZT1cIm5ldmVyXCI+XG4gICAgICAgICAgICAgICAgPERlY29yYXRpb24gdHlwZT1cImJsb2NrXCIgb3JkZXI9e29yZGVyT2Zmc2V0ICsgMC4yfSBjbGFzc05hbWU9XCJnaXRodWItRmlsZVBhdGNoVmlldy1jb250cm9sQmxvY2tcIj5cbiAgICAgICAgICAgICAgICAgIDxIdW5rSGVhZGVyVmlld1xuICAgICAgICAgICAgICAgICAgICByZWZUYXJnZXQ9e3RoaXMucmVmRWRpdG9yRWxlbWVudH1cbiAgICAgICAgICAgICAgICAgICAgaHVuaz17aHVua31cbiAgICAgICAgICAgICAgICAgICAgaXNTZWxlY3RlZD17aXNTZWxlY3RlZH1cbiAgICAgICAgICAgICAgICAgICAgc3RhZ2luZ1N0YXR1cz17dGhpcy5wcm9wcy5zdGFnaW5nU3RhdHVzfVxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25Nb2RlPVwibGluZVwiXG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZVNlbGVjdGlvbkxhYmVsPXt0b2dnbGVTZWxlY3Rpb25MYWJlbH1cbiAgICAgICAgICAgICAgICAgICAgZGlzY2FyZFNlbGVjdGlvbkxhYmVsPXtkaXNjYXJkU2VsZWN0aW9uTGFiZWx9XG5cbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcHM9e3RoaXMucHJvcHMudG9vbHRpcHN9XG4gICAgICAgICAgICAgICAgICAgIGtleW1hcHM9e3RoaXMucHJvcHMua2V5bWFwc31cblxuICAgICAgICAgICAgICAgICAgICB0b2dnbGVTZWxlY3Rpb249eygpID0+IHRoaXMudG9nZ2xlSHVua1NlbGVjdGlvbihodW5rLCBjb250YWluc1NlbGVjdGlvbil9XG4gICAgICAgICAgICAgICAgICAgIGRpc2NhcmRTZWxlY3Rpb249eygpID0+IHRoaXMuZGlzY2FyZEh1bmtTZWxlY3Rpb24oaHVuaywgY29udGFpbnNTZWxlY3Rpb24pfVxuICAgICAgICAgICAgICAgICAgICBtb3VzZURvd249e3RoaXMuZGlkTW91c2VEb3duT25IZWFkZXJ9XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1UeXBlPXt0aGlzLnByb3BzLml0ZW1UeXBlfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L0RlY29yYXRpb24+XG4gICAgICAgICAgICAgIDwvTWFya2VyPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KX1cbiAgICAgICAgPC9NYXJrZXJMYXllcj5cbiAgICAgIDwvRnJhZ21lbnQ+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlckxpbmVEZWNvcmF0aW9ucyhyYW5nZXMsIGxpbmVDbGFzcywge2xpbmUsIGd1dHRlciwgaWNvbiwgcmVmSG9sZGVyfSkge1xuICAgIGlmIChyYW5nZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBob2xkZXIgPSByZWZIb2xkZXIgfHwgbmV3IFJlZkhvbGRlcigpO1xuICAgIHJldHVybiAoXG4gICAgICA8TWFya2VyTGF5ZXIgaGFuZGxlTGF5ZXI9e2hvbGRlci5zZXR0ZXJ9PlxuICAgICAgICB7cmFuZ2VzLm1hcCgocmFuZ2UsIGluZGV4KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxNYXJrZXJcbiAgICAgICAgICAgICAga2V5PXtgbGluZS0ke2xpbmVDbGFzc30tJHtpbmRleH1gfVxuICAgICAgICAgICAgICBidWZmZXJSYW5nZT17cmFuZ2V9XG4gICAgICAgICAgICAgIGludmFsaWRhdGU9XCJuZXZlclwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICk7XG4gICAgICAgIH0pfVxuICAgICAgICB7dGhpcy5yZW5kZXJEZWNvcmF0aW9ucyhsaW5lQ2xhc3MsIHtsaW5lLCBndXR0ZXIsIGljb259KX1cbiAgICAgIDwvTWFya2VyTGF5ZXI+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlckRlY29yYXRpb25zT25MYXllcihsYXllciwgbGluZUNsYXNzLCB7bGluZSwgZ3V0dGVyLCBpY29ufSkge1xuICAgIGlmIChsYXllci5nZXRNYXJrZXJDb3VudCgpID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPE1hcmtlckxheWVyIGV4dGVybmFsPXtsYXllcn0+XG4gICAgICAgIHt0aGlzLnJlbmRlckRlY29yYXRpb25zKGxpbmVDbGFzcywge2xpbmUsIGd1dHRlciwgaWNvbn0pfVxuICAgICAgPC9NYXJrZXJMYXllcj5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyRGVjb3JhdGlvbnMobGluZUNsYXNzLCB7bGluZSwgZ3V0dGVyLCBpY29ufSkge1xuICAgIHJldHVybiAoXG4gICAgICA8RnJhZ21lbnQ+XG4gICAgICAgIHtsaW5lICYmIChcbiAgICAgICAgICA8RGVjb3JhdGlvblxuICAgICAgICAgICAgdHlwZT1cImxpbmVcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPXtsaW5lQ2xhc3N9XG4gICAgICAgICAgICBvbWl0RW1wdHlMYXN0Um93PXtmYWxzZX1cbiAgICAgICAgICAvPlxuICAgICAgICApfVxuICAgICAgICB7Z3V0dGVyICYmIChcbiAgICAgICAgICA8RnJhZ21lbnQ+XG4gICAgICAgICAgICA8RGVjb3JhdGlvblxuICAgICAgICAgICAgICB0eXBlPVwibGluZS1udW1iZXJcIlxuICAgICAgICAgICAgICBndXR0ZXJOYW1lPVwib2xkLWxpbmUtbnVtYmVyc1wiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17bGluZUNsYXNzfVxuICAgICAgICAgICAgICBvbWl0RW1wdHlMYXN0Um93PXtmYWxzZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8RGVjb3JhdGlvblxuICAgICAgICAgICAgICB0eXBlPVwibGluZS1udW1iZXJcIlxuICAgICAgICAgICAgICBndXR0ZXJOYW1lPVwibmV3LWxpbmUtbnVtYmVyc1wiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17bGluZUNsYXNzfVxuICAgICAgICAgICAgICBvbWl0RW1wdHlMYXN0Um93PXtmYWxzZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8RGVjb3JhdGlvblxuICAgICAgICAgICAgICB0eXBlPVwiZ3V0dGVyXCJcbiAgICAgICAgICAgICAgZ3V0dGVyTmFtZT1cImdpdGh1Yi1jb21tZW50LWljb25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2BnaXRodWItZWRpdG9yQ29tbWVudEd1dHRlckljb24gZW1wdHkgJHtsaW5lQ2xhc3N9YH1cbiAgICAgICAgICAgICAgb21pdEVtcHR5TGFzdFJvdz17ZmFsc2V9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICl9XG4gICAgICAgIHtpY29uICYmIChcbiAgICAgICAgICA8RGVjb3JhdGlvblxuICAgICAgICAgICAgdHlwZT1cImxpbmUtbnVtYmVyXCJcbiAgICAgICAgICAgIGd1dHRlck5hbWU9XCJkaWZmLWljb25zXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17bGluZUNsYXNzfVxuICAgICAgICAgICAgb21pdEVtcHR5TGFzdFJvdz17ZmFsc2V9XG4gICAgICAgICAgLz5cbiAgICAgICAgKX1cbiAgICAgIDwvRnJhZ21lbnQ+XG4gICAgKTtcbiAgfVxuXG4gIHVuZG9MYXN0RGlzY2FyZEZyb21Db3JlVW5kbyA9ICgpID0+IHtcbiAgICBpZiAodGhpcy5wcm9wcy5oYXNVbmRvSGlzdG9yeSkge1xuICAgICAgY29uc3Qgc2VsZWN0ZWRGaWxlUGF0Y2hlcyA9IEFycmF5LmZyb20odGhpcy5nZXRTZWxlY3RlZEZpbGVQYXRjaGVzKCkpO1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgIGlmICh0aGlzLnByb3BzLml0ZW1UeXBlID09PSBDaGFuZ2VkRmlsZUl0ZW0pIHtcbiAgICAgICAgdGhpcy5wcm9wcy51bmRvTGFzdERpc2NhcmQoc2VsZWN0ZWRGaWxlUGF0Y2hlc1swXSwge2V2ZW50U291cmNlOiB7Y29tbWFuZDogJ2NvcmU6dW5kbyd9fSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdW5kb0xhc3REaXNjYXJkRnJvbUJ1dHRvbiA9IGZpbGVQYXRjaCA9PiB7XG4gICAgdGhpcy5wcm9wcy51bmRvTGFzdERpc2NhcmQoZmlsZVBhdGNoLCB7ZXZlbnRTb3VyY2U6ICdidXR0b24nfSk7XG4gIH1cblxuICBkaXNjYXJkU2VsZWN0aW9uRnJvbUNvbW1hbmQgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuZGlzY2FyZFJvd3MoXG4gICAgICB0aGlzLnByb3BzLnNlbGVjdGVkUm93cyxcbiAgICAgIHRoaXMucHJvcHMuc2VsZWN0aW9uTW9kZSxcbiAgICAgIHtldmVudFNvdXJjZToge2NvbW1hbmQ6ICdnaXRodWI6ZGlzY2FyZC1zZWxlY3RlZC1saW5lcyd9fSxcbiAgICApO1xuICB9XG5cbiAgdG9nZ2xlSHVua1NlbGVjdGlvbihodW5rLCBjb250YWluc1NlbGVjdGlvbikge1xuICAgIGlmIChjb250YWluc1NlbGVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMudG9nZ2xlUm93cyhcbiAgICAgICAgdGhpcy5wcm9wcy5zZWxlY3RlZFJvd3MsXG4gICAgICAgIHRoaXMucHJvcHMuc2VsZWN0aW9uTW9kZSxcbiAgICAgICAge2V2ZW50U291cmNlOiAnYnV0dG9uJ30sXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBjaGFuZ2VSb3dzID0gbmV3IFNldChcbiAgICAgICAgaHVuay5nZXRDaGFuZ2VzKClcbiAgICAgICAgICAucmVkdWNlKChyb3dzLCBjaGFuZ2UpID0+IHtcbiAgICAgICAgICAgIHJvd3MucHVzaCguLi5jaGFuZ2UuZ2V0QnVmZmVyUm93cygpKTtcbiAgICAgICAgICAgIHJldHVybiByb3dzO1xuICAgICAgICAgIH0sIFtdKSxcbiAgICAgICk7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy50b2dnbGVSb3dzKFxuICAgICAgICBjaGFuZ2VSb3dzLFxuICAgICAgICAnaHVuaycsXG4gICAgICAgIHtldmVudFNvdXJjZTogJ2J1dHRvbid9LFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBkaXNjYXJkSHVua1NlbGVjdGlvbihodW5rLCBjb250YWluc1NlbGVjdGlvbikge1xuICAgIGlmIChjb250YWluc1NlbGVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuZGlzY2FyZFJvd3MoXG4gICAgICAgIHRoaXMucHJvcHMuc2VsZWN0ZWRSb3dzLFxuICAgICAgICB0aGlzLnByb3BzLnNlbGVjdGlvbk1vZGUsXG4gICAgICAgIHtldmVudFNvdXJjZTogJ2J1dHRvbid9LFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY2hhbmdlUm93cyA9IG5ldyBTZXQoXG4gICAgICAgIGh1bmsuZ2V0Q2hhbmdlcygpXG4gICAgICAgICAgLnJlZHVjZSgocm93cywgY2hhbmdlKSA9PiB7XG4gICAgICAgICAgICByb3dzLnB1c2goLi4uY2hhbmdlLmdldEJ1ZmZlclJvd3MoKSk7XG4gICAgICAgICAgICByZXR1cm4gcm93cztcbiAgICAgICAgICB9LCBbXSksXG4gICAgICApO1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuZGlzY2FyZFJvd3MoY2hhbmdlUm93cywgJ2h1bmsnLCB7ZXZlbnRTb3VyY2U6ICdidXR0b24nfSk7XG4gICAgfVxuICB9XG5cbiAgZGlkTW91c2VEb3duT25IZWFkZXIoZXZlbnQsIGh1bmspIHtcbiAgICB0aGlzLm5leHRTZWxlY3Rpb25Nb2RlID0gJ2h1bmsnO1xuICAgIHRoaXMuaGFuZGxlU2VsZWN0aW9uRXZlbnQoZXZlbnQsIGh1bmsuZ2V0UmFuZ2UoKSk7XG4gIH1cblxuICBkaWRNb3VzZURvd25PbkxpbmVOdW1iZXIoZXZlbnQpIHtcbiAgICBjb25zdCBsaW5lID0gZXZlbnQuYnVmZmVyUm93O1xuICAgIGlmIChsaW5lID09PSB1bmRlZmluZWQgfHwgaXNOYU4obGluZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLm5leHRTZWxlY3Rpb25Nb2RlID0gJ2xpbmUnO1xuICAgIGlmICh0aGlzLmhhbmRsZVNlbGVjdGlvbkV2ZW50KGV2ZW50LmRvbUV2ZW50LCBbW2xpbmUsIDBdLCBbbGluZSwgSW5maW5pdHldXSkpIHtcbiAgICAgIHRoaXMubW91c2VTZWxlY3Rpb25JblByb2dyZXNzID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBkaWRNb3VzZU1vdmVPbkxpbmVOdW1iZXIoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMubW91c2VTZWxlY3Rpb25JblByb2dyZXNzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGluZSA9IGV2ZW50LmJ1ZmZlclJvdztcbiAgICBpZiAodGhpcy5sYXN0TW91c2VNb3ZlTGluZSA9PT0gbGluZSB8fCBsaW5lID09PSB1bmRlZmluZWQgfHwgaXNOYU4obGluZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5sYXN0TW91c2VNb3ZlTGluZSA9IGxpbmU7XG5cbiAgICB0aGlzLm5leHRTZWxlY3Rpb25Nb2RlID0gJ2xpbmUnO1xuICAgIHRoaXMuaGFuZGxlU2VsZWN0aW9uRXZlbnQoZXZlbnQuZG9tRXZlbnQsIFtbbGluZSwgMF0sIFtsaW5lLCBJbmZpbml0eV1dLCB7YWRkOiB0cnVlfSk7XG4gIH1cblxuICBkaWRNb3VzZVVwKCkge1xuICAgIHRoaXMubW91c2VTZWxlY3Rpb25JblByb2dyZXNzID0gZmFsc2U7XG4gIH1cblxuICBoYW5kbGVTZWxlY3Rpb25FdmVudChldmVudCwgcmFuZ2VMaWtlLCBvcHRzKSB7XG4gICAgaWYgKGV2ZW50LmJ1dHRvbiAhPT0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGlzV2luZG93cyA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMic7XG4gICAgaWYgKGV2ZW50LmN0cmxLZXkgJiYgIWlzV2luZG93cykge1xuICAgICAgLy8gQWxsb3cgdGhlIGNvbnRleHQgbWVudSB0byBvcGVuLlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBhZGQ6IGZhbHNlLFxuICAgICAgLi4ub3B0cyxcbiAgICB9O1xuXG4gICAgLy8gTm9ybWFsaXplIHRoZSB0YXJnZXQgc2VsZWN0aW9uIHJhbmdlXG4gICAgY29uc3QgY29udmVydGVkID0gUmFuZ2UuZnJvbU9iamVjdChyYW5nZUxpa2UpO1xuICAgIGNvbnN0IHJhbmdlID0gdGhpcy5yZWZFZGl0b3IubWFwKGVkaXRvciA9PiBlZGl0b3IuY2xpcEJ1ZmZlclJhbmdlKGNvbnZlcnRlZCkpLmdldE9yKGNvbnZlcnRlZCk7XG5cbiAgICBpZiAoZXZlbnQubWV0YUtleSB8fCAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqLyAoZXZlbnQuY3RybEtleSAmJiBpc1dpbmRvd3MpKSB7XG4gICAgICB0aGlzLnJlZkVkaXRvci5tYXAoZWRpdG9yID0+IHtcbiAgICAgICAgbGV0IGludGVyc2VjdHMgPSBmYWxzZTtcbiAgICAgICAgbGV0IHdpdGhvdXQgPSBudWxsO1xuXG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIGVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICBpZiAoc2VsZWN0aW9uLmludGVyc2VjdHNCdWZmZXJSYW5nZShyYW5nZSkpIHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSByYW5nZSBmcm9tIHRoaXMgc2VsZWN0aW9uIGJ5IHRydW5jYXRpbmcgaXQgdG8gdGhlIFwibmVhciBlZGdlXCIgb2YgdGhlIHJhbmdlIGFuZCBjcmVhdGluZyBhXG4gICAgICAgICAgICAvLyBuZXcgc2VsZWN0aW9uIGZyb20gdGhlIFwiZmFyIGVkZ2VcIiB0byB0aGUgcHJldmlvdXMgZW5kLiBPbWl0IGVpdGhlciBzaWRlIGlmIGl0IGlzIGVtcHR5LlxuICAgICAgICAgICAgaW50ZXJzZWN0cyA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3Rpb25SYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpO1xuXG4gICAgICAgICAgICBjb25zdCBuZXdSYW5nZXMgPSBbXTtcblxuICAgICAgICAgICAgaWYgKCFyYW5nZS5zdGFydC5pc0VxdWFsKHNlbGVjdGlvblJhbmdlLnN0YXJ0KSkge1xuICAgICAgICAgICAgICAvLyBJbmNsdWRlIHRoZSBiaXQgZnJvbSB0aGUgc2VsZWN0aW9uJ3MgcHJldmlvdXMgc3RhcnQgdG8gdGhlIHJhbmdlJ3Mgc3RhcnQuXG4gICAgICAgICAgICAgIGxldCBudWRnZWQgPSByYW5nZS5zdGFydDtcbiAgICAgICAgICAgICAgaWYgKHJhbmdlLnN0YXJ0LmNvbHVtbiA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RDb2x1bW4gPSBlZGl0b3IuZ2V0QnVmZmVyKCkubGluZUxlbmd0aEZvclJvdyhyYW5nZS5zdGFydC5yb3cgLSAxKTtcbiAgICAgICAgICAgICAgICBudWRnZWQgPSBbcmFuZ2Uuc3RhcnQucm93IC0gMSwgbGFzdENvbHVtbl07XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBuZXdSYW5nZXMucHVzaChbc2VsZWN0aW9uUmFuZ2Uuc3RhcnQsIG51ZGdlZF0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXJhbmdlLmVuZC5pc0VxdWFsKHNlbGVjdGlvblJhbmdlLmVuZCkpIHtcbiAgICAgICAgICAgICAgLy8gSW5jbHVkZSB0aGUgYml0IGZyb20gdGhlIHJhbmdlJ3MgZW5kIHRvIHRoZSBzZWxlY3Rpb24ncyBlbmQuXG4gICAgICAgICAgICAgIGxldCBudWRnZWQgPSByYW5nZS5lbmQ7XG4gICAgICAgICAgICAgIGNvbnN0IGxhc3RDb2x1bW4gPSBlZGl0b3IuZ2V0QnVmZmVyKCkubGluZUxlbmd0aEZvclJvdyhyYW5nZS5lbmQucm93KTtcbiAgICAgICAgICAgICAgaWYgKHJhbmdlLmVuZC5jb2x1bW4gPT09IGxhc3RDb2x1bW4pIHtcbiAgICAgICAgICAgICAgICBudWRnZWQgPSBbcmFuZ2UuZW5kLnJvdyArIDEsIDBdO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgbmV3UmFuZ2VzLnB1c2goW251ZGdlZCwgc2VsZWN0aW9uUmFuZ2UuZW5kXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChuZXdSYW5nZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UobmV3UmFuZ2VzWzBdKTtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBuZXdSYW5nZSBvZiBuZXdSYW5nZXMuc2xpY2UoMSkpIHtcbiAgICAgICAgICAgICAgICBlZGl0b3IuYWRkU2VsZWN0aW9uRm9yQnVmZmVyUmFuZ2UobmV3UmFuZ2UsIHtyZXZlcnNlZDogc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKX0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB3aXRob3V0ID0gc2VsZWN0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh3aXRob3V0ICE9PSBudWxsKSB7XG4gICAgICAgICAgY29uc3QgcmVwbGFjZW1lbnRSYW5nZXMgPSBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgICAuZmlsdGVyKGVhY2ggPT4gZWFjaCAhPT0gd2l0aG91dClcbiAgICAgICAgICAgIC5tYXAoZWFjaCA9PiBlYWNoLmdldEJ1ZmZlclJhbmdlKCkpO1xuICAgICAgICAgIGlmIChyZXBsYWNlbWVudFJhbmdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMocmVwbGFjZW1lbnRSYW5nZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaW50ZXJzZWN0cykge1xuICAgICAgICAgIC8vIEFkZCB0aGlzIHJhbmdlIGFzIGEgbmV3LCBkaXN0aW5jdCBzZWxlY3Rpb24uXG4gICAgICAgICAgZWRpdG9yLmFkZFNlbGVjdGlvbkZvckJ1ZmZlclJhbmdlKHJhbmdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLmFkZCB8fCBldmVudC5zaGlmdEtleSkge1xuICAgICAgLy8gRXh0ZW5kIHRoZSBleGlzdGluZyBzZWxlY3Rpb24gdG8gZW5jb21wYXNzIHRoaXMgcmFuZ2UuXG4gICAgICB0aGlzLnJlZkVkaXRvci5tYXAoZWRpdG9yID0+IHtcbiAgICAgICAgY29uc3QgbGFzdFNlbGVjdGlvbiA9IGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCk7XG4gICAgICAgIGNvbnN0IGxhc3RTZWxlY3Rpb25SYW5nZSA9IGxhc3RTZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKTtcblxuICAgICAgICAvLyBZb3UgYXJlIG5vdyBlbnRlcmluZyB0aGUgd2FsbCBvZiB0ZXJuZXJ5IG9wZXJhdG9ycy4gVGhpcyBpcyB5b3VyIGxhc3QgZXhpdCBiZWZvcmUgdGhlIHRvbGxib290aFxuICAgICAgICBjb25zdCBpc0JlZm9yZSA9IHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW4obGFzdFNlbGVjdGlvblJhbmdlLnN0YXJ0KTtcbiAgICAgICAgY29uc3QgZmFyRWRnZSA9IGlzQmVmb3JlID8gcmFuZ2Uuc3RhcnQgOiByYW5nZS5lbmQ7XG4gICAgICAgIGNvbnN0IG5ld1JhbmdlID0gaXNCZWZvcmUgPyBbZmFyRWRnZSwgbGFzdFNlbGVjdGlvblJhbmdlLmVuZF0gOiBbbGFzdFNlbGVjdGlvblJhbmdlLnN0YXJ0LCBmYXJFZGdlXTtcblxuICAgICAgICBsYXN0U2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKG5ld1JhbmdlLCB7cmV2ZXJzZWQ6IGlzQmVmb3JlfSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVmRWRpdG9yLm1hcChlZGl0b3IgPT4gZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UocmFuZ2UpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGRpZENvbmZpcm0oKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMudG9nZ2xlUm93cyh0aGlzLnByb3BzLnNlbGVjdGVkUm93cywgdGhpcy5wcm9wcy5zZWxlY3Rpb25Nb2RlKTtcbiAgfVxuXG4gIGRpZFRvZ2dsZVNlbGVjdGlvbk1vZGUoKSB7XG4gICAgY29uc3Qgc2VsZWN0ZWRIdW5rcyA9IHRoaXMuZ2V0U2VsZWN0ZWRIdW5rcygpO1xuICAgIHRoaXMud2l0aFNlbGVjdGlvbk1vZGUoe1xuICAgICAgbGluZTogKCkgPT4ge1xuICAgICAgICBjb25zdCBodW5rUmFuZ2VzID0gc2VsZWN0ZWRIdW5rcy5tYXAoaHVuayA9PiBodW5rLmdldFJhbmdlKCkpO1xuICAgICAgICB0aGlzLm5leHRTZWxlY3Rpb25Nb2RlID0gJ2h1bmsnO1xuICAgICAgICB0aGlzLnJlZkVkaXRvci5tYXAoZWRpdG9yID0+IGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcyhodW5rUmFuZ2VzKSk7XG4gICAgICB9LFxuICAgICAgaHVuazogKCkgPT4ge1xuICAgICAgICBsZXQgZmlyc3RDaGFuZ2VSb3cgPSBJbmZpbml0eTtcbiAgICAgICAgZm9yIChjb25zdCBodW5rIG9mIHNlbGVjdGVkSHVua3MpIHtcbiAgICAgICAgICBjb25zdCBbZmlyc3RDaGFuZ2VdID0gaHVuay5nZXRDaGFuZ2VzKCk7XG4gICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgICAgICBpZiAoZmlyc3RDaGFuZ2UgJiYgKCFmaXJzdENoYW5nZVJvdyB8fCBmaXJzdENoYW5nZS5nZXRTdGFydEJ1ZmZlclJvdygpIDwgZmlyc3RDaGFuZ2VSb3cpKSB7XG4gICAgICAgICAgICBmaXJzdENoYW5nZVJvdyA9IGZpcnN0Q2hhbmdlLmdldFN0YXJ0QnVmZmVyUm93KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5uZXh0U2VsZWN0aW9uTW9kZSA9ICdsaW5lJztcbiAgICAgICAgdGhpcy5yZWZFZGl0b3IubWFwKGVkaXRvciA9PiB7XG4gICAgICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKFtbW2ZpcnN0Q2hhbmdlUm93LCAwXSwgW2ZpcnN0Q2hhbmdlUm93LCBJbmZpbml0eV1dXSk7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIGRpZFRvZ2dsZU1vZGVDaGFuZ2UgPSAoKSA9PiB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgQXJyYXkuZnJvbSh0aGlzLmdldFNlbGVjdGVkRmlsZVBhdGNoZXMoKSlcbiAgICAgICAgLmZpbHRlcihmcCA9PiBmcC5kaWRDaGFuZ2VFeGVjdXRhYmxlTW9kZSgpKVxuICAgICAgICAubWFwKHRoaXMucHJvcHMudG9nZ2xlTW9kZUNoYW5nZSksXG4gICAgKTtcbiAgfVxuXG4gIGRpZFRvZ2dsZVN5bWxpbmtDaGFuZ2UgPSAoKSA9PiB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgQXJyYXkuZnJvbSh0aGlzLmdldFNlbGVjdGVkRmlsZVBhdGNoZXMoKSlcbiAgICAgICAgLmZpbHRlcihmcCA9PiBmcC5oYXNUeXBlY2hhbmdlKCkpXG4gICAgICAgIC5tYXAodGhpcy5wcm9wcy50b2dnbGVTeW1saW5rQ2hhbmdlKSxcbiAgICApO1xuICB9XG5cbiAgc2VsZWN0TmV4dEh1bmsoKSB7XG4gICAgdGhpcy5yZWZFZGl0b3IubWFwKGVkaXRvciA9PiB7XG4gICAgICBjb25zdCBuZXh0SHVua3MgPSBuZXcgU2V0KFxuICAgICAgICB0aGlzLndpdGhTZWxlY3RlZEh1bmtzKGh1bmsgPT4gdGhpcy5nZXRIdW5rQWZ0ZXIoaHVuaykgfHwgaHVuayksXG4gICAgICApO1xuICAgICAgY29uc3QgbmV4dFJhbmdlcyA9IEFycmF5LmZyb20obmV4dEh1bmtzLCBodW5rID0+IGh1bmsuZ2V0UmFuZ2UoKSk7XG4gICAgICB0aGlzLm5leHRTZWxlY3Rpb25Nb2RlID0gJ2h1bmsnO1xuICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKG5leHRSYW5nZXMpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSk7XG4gIH1cblxuICBzZWxlY3RQcmV2aW91c0h1bmsoKSB7XG4gICAgdGhpcy5yZWZFZGl0b3IubWFwKGVkaXRvciA9PiB7XG4gICAgICBjb25zdCBuZXh0SHVua3MgPSBuZXcgU2V0KFxuICAgICAgICB0aGlzLndpdGhTZWxlY3RlZEh1bmtzKGh1bmsgPT4gdGhpcy5nZXRIdW5rQmVmb3JlKGh1bmspIHx8IGh1bmspLFxuICAgICAgKTtcbiAgICAgIGNvbnN0IG5leHRSYW5nZXMgPSBBcnJheS5mcm9tKG5leHRIdW5rcywgaHVuayA9PiBodW5rLmdldFJhbmdlKCkpO1xuICAgICAgdGhpcy5uZXh0U2VsZWN0aW9uTW9kZSA9ICdodW5rJztcbiAgICAgIGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcyhuZXh0UmFuZ2VzKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pO1xuICB9XG5cbiAgZGlkT3BlbkZpbGUoe3NlbGVjdGVkRmlsZVBhdGNofSkge1xuICAgIGNvbnN0IGN1cnNvcnNCeUZpbGVQYXRjaCA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMucmVmRWRpdG9yLm1hcChlZGl0b3IgPT4ge1xuICAgICAgY29uc3QgcGxhY2VkUm93cyA9IG5ldyBTZXQoKTtcblxuICAgICAgZm9yIChjb25zdCBjdXJzb3Igb2YgZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgICBjb25zdCBjdXJzb3JSb3cgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS5yb3c7XG4gICAgICAgIGNvbnN0IGh1bmsgPSB0aGlzLnByb3BzLm11bHRpRmlsZVBhdGNoLmdldEh1bmtBdChjdXJzb3JSb3cpO1xuICAgICAgICBjb25zdCBmaWxlUGF0Y2ggPSB0aGlzLnByb3BzLm11bHRpRmlsZVBhdGNoLmdldEZpbGVQYXRjaEF0KGN1cnNvclJvdyk7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGlmICghaHVuaykge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG5ld1JvdyA9IGh1bmsuZ2V0TmV3Um93QXQoY3Vyc29yUm93KTtcbiAgICAgICAgbGV0IG5ld0NvbHVtbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLmNvbHVtbjtcbiAgICAgICAgaWYgKG5ld1JvdyA9PT0gbnVsbCkge1xuICAgICAgICAgIGxldCBuZWFyZXN0Um93ID0gaHVuay5nZXROZXdTdGFydFJvdygpO1xuICAgICAgICAgIGZvciAoY29uc3QgcmVnaW9uIG9mIGh1bmsuZ2V0UmVnaW9ucygpKSB7XG4gICAgICAgICAgICBpZiAoIXJlZ2lvbi5pbmNsdWRlc0J1ZmZlclJvdyhjdXJzb3JSb3cpKSB7XG4gICAgICAgICAgICAgIHJlZ2lvbi53aGVuKHtcbiAgICAgICAgICAgICAgICB1bmNoYW5nZWQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIG5lYXJlc3RSb3cgKz0gcmVnaW9uLmJ1ZmZlclJvd0NvdW50KCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBhZGRpdGlvbjogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgbmVhcmVzdFJvdyArPSByZWdpb24uYnVmZmVyUm93Q291bnQoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghcGxhY2VkUm93cy5oYXMobmVhcmVzdFJvdykpIHtcbiAgICAgICAgICAgIG5ld1JvdyA9IG5lYXJlc3RSb3c7XG4gICAgICAgICAgICBuZXdDb2x1bW4gPSAwO1xuICAgICAgICAgICAgcGxhY2VkUm93cy5hZGQobmVhcmVzdFJvdyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5ld1JvdyAhPT0gbnVsbCkge1xuICAgICAgICAgIC8vIFdoeSBpcyB0aGlzIG5lZWRlZD8gSSBfdGhpbmtfIGV2ZXJ5dGhpbmcgaXMgaW4gdGVybXMgb2YgYnVmZmVyIHBvc2l0aW9uXG4gICAgICAgICAgLy8gc28gdGhlcmUgc2hvdWxkbid0IGJlIGFuIG9mZi1ieS1vbmUgaXNzdWVcbiAgICAgICAgICBuZXdSb3cgLT0gMTtcbiAgICAgICAgICBjb25zdCBjdXJzb3JzID0gY3Vyc29yc0J5RmlsZVBhdGNoLmdldChmaWxlUGF0Y2gpO1xuICAgICAgICAgIGlmICghY3Vyc29ycykge1xuICAgICAgICAgICAgY3Vyc29yc0J5RmlsZVBhdGNoLnNldChmaWxlUGF0Y2gsIFtbbmV3Um93LCBuZXdDb2x1bW5dXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGN1cnNvcnMucHVzaChbbmV3Um93LCBuZXdDb2x1bW5dKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSk7XG5cbiAgICBjb25zdCBmaWxlUGF0Y2hlc1dpdGhDdXJzb3JzID0gbmV3IFNldChjdXJzb3JzQnlGaWxlUGF0Y2gua2V5cygpKTtcbiAgICBpZiAoc2VsZWN0ZWRGaWxlUGF0Y2ggJiYgIWZpbGVQYXRjaGVzV2l0aEN1cnNvcnMuaGFzKHNlbGVjdGVkRmlsZVBhdGNoKSkge1xuICAgICAgY29uc3QgW2ZpcnN0SHVua10gPSBzZWxlY3RlZEZpbGVQYXRjaC5nZXRIdW5rcygpO1xuICAgICAgY29uc3QgY3Vyc29yUm93ID0gZmlyc3RIdW5rID8gZmlyc3RIdW5rLmdldE5ld1N0YXJ0Um93KCkgLSAxIDogLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi8gMDtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLm9wZW5GaWxlKHNlbGVjdGVkRmlsZVBhdGNoLCBbW2N1cnNvclJvdywgMF1dLCB0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcGVuZGluZyA9IGN1cnNvcnNCeUZpbGVQYXRjaC5zaXplID09PSAxO1xuICAgICAgcmV0dXJuIFByb21pc2UuYWxsKEFycmF5LmZyb20oY3Vyc29yc0J5RmlsZVBhdGNoLCB2YWx1ZSA9PiB7XG4gICAgICAgIGNvbnN0IFtmaWxlUGF0Y2gsIGN1cnNvcnNdID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLm9wZW5GaWxlKGZpbGVQYXRjaCwgY3Vyc29ycywgcGVuZGluZyk7XG4gICAgICB9KSk7XG4gICAgfVxuXG4gIH1cblxuICBnZXRTZWxlY3RlZFJvd3MoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVmRWRpdG9yLm1hcChlZGl0b3IgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBTZXQoXG4gICAgICAgIGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgICAubWFwKHNlbGVjdGlvbiA9PiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSlcbiAgICAgICAgICAucmVkdWNlKChhY2MsIHJhbmdlKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiByYW5nZS5nZXRSb3dzKCkpIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuaXNDaGFuZ2VSb3cocm93KSkge1xuICAgICAgICAgICAgICAgIGFjYy5wdXNoKHJvdyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgfSwgW10pLFxuICAgICAgKTtcbiAgICB9KS5nZXRPcihuZXcgU2V0KCkpO1xuICB9XG5cbiAgZGlkQWRkU2VsZWN0aW9uKCkge1xuICAgIHRoaXMuZGlkQ2hhbmdlU2VsZWN0ZWRSb3dzKCk7XG4gIH1cblxuICBkaWRDaGFuZ2VTZWxlY3Rpb25SYW5nZShldmVudCkge1xuICAgIGlmIChcbiAgICAgICFldmVudCB8fFxuICAgICAgZXZlbnQub2xkQnVmZmVyUmFuZ2Uuc3RhcnQucm93ICE9PSBldmVudC5uZXdCdWZmZXJSYW5nZS5zdGFydC5yb3cgfHxcbiAgICAgIGV2ZW50Lm9sZEJ1ZmZlclJhbmdlLmVuZC5yb3cgIT09IGV2ZW50Lm5ld0J1ZmZlclJhbmdlLmVuZC5yb3dcbiAgICApIHtcbiAgICAgIHRoaXMuZGlkQ2hhbmdlU2VsZWN0ZWRSb3dzKCk7XG4gICAgfVxuICB9XG5cbiAgZGlkRGVzdHJveVNlbGVjdGlvbigpIHtcbiAgICB0aGlzLmRpZENoYW5nZVNlbGVjdGVkUm93cygpO1xuICB9XG5cbiAgZGlkQ2hhbmdlU2VsZWN0ZWRSb3dzKCkge1xuICAgIGlmICh0aGlzLnN1cHByZXNzQ2hhbmdlcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG5leHRDdXJzb3JSb3dzID0gdGhpcy5yZWZFZGl0b3IubWFwKGVkaXRvciA9PiB7XG4gICAgICByZXR1cm4gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpLm1hcChwb3NpdGlvbiA9PiBwb3NpdGlvbi5yb3cpO1xuICAgIH0pLmdldE9yKFtdKTtcbiAgICBjb25zdCBoYXNNdWx0aXBsZUZpbGVTZWxlY3Rpb25zID0gdGhpcy5wcm9wcy5tdWx0aUZpbGVQYXRjaC5zcGFuc011bHRpcGxlRmlsZXMobmV4dEN1cnNvclJvd3MpO1xuXG4gICAgdGhpcy5wcm9wcy5zZWxlY3RlZFJvd3NDaGFuZ2VkKFxuICAgICAgdGhpcy5nZXRTZWxlY3RlZFJvd3MoKSxcbiAgICAgIHRoaXMubmV4dFNlbGVjdGlvbk1vZGUgfHwgJ2xpbmUnLFxuICAgICAgaGFzTXVsdGlwbGVGaWxlU2VsZWN0aW9ucyxcbiAgICApO1xuICB9XG5cbiAgb2xkTGluZU51bWJlckxhYmVsKHtidWZmZXJSb3csIHNvZnRXcmFwcGVkfSkge1xuICAgIGNvbnN0IGh1bmsgPSB0aGlzLnByb3BzLm11bHRpRmlsZVBhdGNoLmdldEh1bmtBdChidWZmZXJSb3cpO1xuICAgIGlmIChodW5rID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhZCgnJyk7XG4gICAgfVxuXG4gICAgY29uc3Qgb2xkUm93ID0gaHVuay5nZXRPbGRSb3dBdChidWZmZXJSb3cpO1xuICAgIGlmIChzb2Z0V3JhcHBlZCkge1xuICAgICAgcmV0dXJuIHRoaXMucGFkKG9sZFJvdyA9PT0gbnVsbCA/ICcnIDogJ+KAoicpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnBhZChvbGRSb3cpO1xuICB9XG5cbiAgbmV3TGluZU51bWJlckxhYmVsKHtidWZmZXJSb3csIHNvZnRXcmFwcGVkfSkge1xuICAgIGNvbnN0IGh1bmsgPSB0aGlzLnByb3BzLm11bHRpRmlsZVBhdGNoLmdldEh1bmtBdChidWZmZXJSb3cpO1xuICAgIGlmIChodW5rID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhZCgnJyk7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3Um93ID0gaHVuay5nZXROZXdSb3dBdChidWZmZXJSb3cpO1xuICAgIGlmIChzb2Z0V3JhcHBlZCkge1xuICAgICAgcmV0dXJuIHRoaXMucGFkKG5ld1JvdyA9PT0gbnVsbCA/ICcnIDogJ+KAoicpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wYWQobmV3Um93KTtcbiAgfVxuXG4gIC8qXG4gICAqIFJldHVybiBhIFNldCBvZiB0aGUgSHVua3MgdGhhdCBpbmNsdWRlIGF0IGxlYXN0IG9uZSBlZGl0b3Igc2VsZWN0aW9uLiBUaGUgc2VsZWN0aW9uIG5lZWQgbm90IGNvbnRhaW4gYW4gYWN0dWFsXG4gICAqIGNoYW5nZSByb3cuXG4gICAqL1xuICBnZXRTZWxlY3RlZEh1bmtzKCkge1xuICAgIHJldHVybiB0aGlzLndpdGhTZWxlY3RlZEh1bmtzKGVhY2ggPT4gZWFjaCk7XG4gIH1cblxuICB3aXRoU2VsZWN0ZWRIdW5rcyhjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLnJlZkVkaXRvci5tYXAoZWRpdG9yID0+IHtcbiAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0KCk7XG4gICAgICByZXR1cm4gZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKCkucmVkdWNlKChhY2MsIHJhbmdlKSA9PiB7XG4gICAgICAgIGZvciAoY29uc3Qgcm93IG9mIHJhbmdlLmdldFJvd3MoKSkge1xuICAgICAgICAgIGNvbnN0IGh1bmsgPSB0aGlzLnByb3BzLm11bHRpRmlsZVBhdGNoLmdldEh1bmtBdChyb3cpO1xuICAgICAgICAgIGlmICghaHVuayB8fCBzZWVuLmhhcyhodW5rKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2Vlbi5hZGQoaHVuayk7XG4gICAgICAgICAgYWNjLnB1c2goY2FsbGJhY2soaHVuaykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY2M7XG4gICAgICB9LCBbXSk7XG4gICAgfSkuZ2V0T3IoW10pO1xuICB9XG5cbiAgLypcbiAgICogUmV0dXJuIGEgU2V0IG9mIEZpbGVQYXRjaGVzIHRoYXQgaW5jbHVkZSBhdCBsZWFzdCBvbmUgZWRpdG9yIHNlbGVjdGlvbi4gVGhlIHNlbGVjdGlvbiBuZWVkIG5vdCBjb250YWluIGFuIGFjdHVhbFxuICAgKiBjaGFuZ2Ugcm93LlxuICAgKi9cbiAgZ2V0U2VsZWN0ZWRGaWxlUGF0Y2hlcygpIHtcbiAgICByZXR1cm4gdGhpcy5yZWZFZGl0b3IubWFwKGVkaXRvciA9PiB7XG4gICAgICBjb25zdCBwYXRjaGVzID0gbmV3IFNldCgpO1xuICAgICAgZm9yIChjb25zdCByYW5nZSBvZiBlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoKSkge1xuICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiByYW5nZS5nZXRSb3dzKCkpIHtcbiAgICAgICAgICBjb25zdCBwYXRjaCA9IHRoaXMucHJvcHMubXVsdGlGaWxlUGF0Y2guZ2V0RmlsZVBhdGNoQXQocm93KTtcbiAgICAgICAgICBwYXRjaGVzLmFkZChwYXRjaCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBwYXRjaGVzO1xuICAgIH0pLmdldE9yKG5ldyBTZXQoKSk7XG4gIH1cblxuICBnZXRIdW5rQmVmb3JlKGh1bmspIHtcbiAgICBjb25zdCBwcmV2Um93ID0gaHVuay5nZXRSYW5nZSgpLnN0YXJ0LnJvdyAtIDE7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMubXVsdGlGaWxlUGF0Y2guZ2V0SHVua0F0KHByZXZSb3cpO1xuICB9XG5cbiAgZ2V0SHVua0FmdGVyKGh1bmspIHtcbiAgICBjb25zdCBuZXh0Um93ID0gaHVuay5nZXRSYW5nZSgpLmVuZC5yb3cgKyAxO1xuICAgIHJldHVybiB0aGlzLnByb3BzLm11bHRpRmlsZVBhdGNoLmdldEh1bmtBdChuZXh0Um93KTtcbiAgfVxuXG4gIGlzQ2hhbmdlUm93KGJ1ZmZlclJvdykge1xuICAgIGNvbnN0IGNoYW5nZUxheWVycyA9IFt0aGlzLnByb3BzLm11bHRpRmlsZVBhdGNoLmdldEFkZGl0aW9uTGF5ZXIoKSwgdGhpcy5wcm9wcy5tdWx0aUZpbGVQYXRjaC5nZXREZWxldGlvbkxheWVyKCldO1xuICAgIHJldHVybiBjaGFuZ2VMYXllcnMuc29tZShsYXllciA9PiBsYXllci5maW5kTWFya2Vycyh7aW50ZXJzZWN0c1JvdzogYnVmZmVyUm93fSkubGVuZ3RoID4gMCk7XG4gIH1cblxuICB3aXRoU2VsZWN0aW9uTW9kZShjYWxsYmFja3MpIHtcbiAgICBjb25zdCBjYWxsYmFjayA9IGNhbGxiYWNrc1t0aGlzLnByb3BzLnNlbGVjdGlvbk1vZGVdO1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBzZWxlY3Rpb24gbW9kZTogJHt0aGlzLnByb3BzLnNlbGVjdGlvbk1vZGV9YCk7XG4gICAgfVxuICAgIHJldHVybiBjYWxsYmFjaygpO1xuICB9XG5cbiAgcGFkKG51bSkge1xuICAgIGNvbnN0IG1heERpZ2l0cyA9IHRoaXMucHJvcHMubXVsdGlGaWxlUGF0Y2guZ2V0TWF4TGluZU51bWJlcldpZHRoKCk7XG4gICAgaWYgKG51bSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIE5CU1BfQ0hBUkFDVEVSLnJlcGVhdChtYXhEaWdpdHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gTkJTUF9DSEFSQUNURVIucmVwZWF0KG1heERpZ2l0cyAtIG51bS50b1N0cmluZygpLmxlbmd0aCkgKyBudW0udG9TdHJpbmcoKTtcbiAgICB9XG4gIH1cblxuICBzY3JvbGxUb0ZpbGUgPSAoe2NoYW5nZWRGaWxlUGF0aCwgY2hhbmdlZEZpbGVQb3NpdGlvbn0pID0+IHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIHRoaXMucmVmRWRpdG9yLm1hcChlID0+IHtcbiAgICAgIGNvbnN0IHJvdyA9IHRoaXMucHJvcHMubXVsdGlGaWxlUGF0Y2guZ2V0QnVmZmVyUm93Rm9yRGlmZlBvc2l0aW9uKGNoYW5nZWRGaWxlUGF0aCwgY2hhbmdlZEZpbGVQb3NpdGlvbik7XG4gICAgICBpZiAocm93ID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBlLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24oe3JvdywgY29sdW1uOiAwfSwge2NlbnRlcjogdHJ1ZX0pO1xuICAgICAgZS5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbih7cm93LCBjb2x1bW46IDB9KTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pO1xuICB9XG5cbiAgbWVhc3VyZVBlcmZvcm1hbmNlKGFjdGlvbikge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgaWYgKChhY3Rpb24gPT09ICd1cGRhdGUnIHx8IGFjdGlvbiA9PT0gJ21vdW50JylcbiAgICAgICYmIHBlcmZvcm1hbmNlLmdldEVudHJpZXNCeU5hbWUoYE11bHRpRmlsZVBhdGNoVmlldy0ke2FjdGlvbn0tc3RhcnRgKS5sZW5ndGggPiAwKSB7XG4gICAgICBwZXJmb3JtYW5jZS5tYXJrKGBNdWx0aUZpbGVQYXRjaFZpZXctJHthY3Rpb259LWVuZGApO1xuICAgICAgcGVyZm9ybWFuY2UubWVhc3VyZShcbiAgICAgICAgYE11bHRpRmlsZVBhdGNoVmlldy0ke2FjdGlvbn1gLFxuICAgICAgICBgTXVsdGlGaWxlUGF0Y2hWaWV3LSR7YWN0aW9ufS1zdGFydGAsXG4gICAgICAgIGBNdWx0aUZpbGVQYXRjaFZpZXctJHthY3Rpb259LWVuZGApO1xuICAgICAgY29uc3QgcGVyZiA9IHBlcmZvcm1hbmNlLmdldEVudHJpZXNCeU5hbWUoYE11bHRpRmlsZVBhdGNoVmlldy0ke2FjdGlvbn1gKVswXTtcbiAgICAgIHBlcmZvcm1hbmNlLmNsZWFyTWFya3MoYE11bHRpRmlsZVBhdGNoVmlldy0ke2FjdGlvbn0tc3RhcnRgKTtcbiAgICAgIHBlcmZvcm1hbmNlLmNsZWFyTWFya3MoYE11bHRpRmlsZVBhdGNoVmlldy0ke2FjdGlvbn0tZW5kYCk7XG4gICAgICBwZXJmb3JtYW5jZS5jbGVhck1lYXN1cmVzKGBNdWx0aUZpbGVQYXRjaFZpZXctJHthY3Rpb259YCk7XG4gICAgICBhZGRFdmVudChgTXVsdGlGaWxlUGF0Y2hWaWV3LSR7YWN0aW9ufWAsIHtcbiAgICAgICAgcGFja2FnZTogJ2dpdGh1YicsXG4gICAgICAgIGZpbGVQYXRjaGVzTGluZUNvdW50czogdGhpcy5wcm9wcy5tdWx0aUZpbGVQYXRjaC5nZXRGaWxlUGF0Y2hlcygpLm1hcChcbiAgICAgICAgICBmcCA9PiBmcC5nZXRQYXRjaCgpLmdldENoYW5nZWRMaW5lQ291bnQoKSxcbiAgICAgICAgKSxcbiAgICAgICAgZHVyYXRpb246IHBlcmYuZHVyYXRpb24sXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==