"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _eventKit = require("event-kit");

var _classnames = _interopRequireDefault(require("classnames"));

var _reactSelect = _interopRequireDefault(require("react-select"));

var _tooltip = _interopRequireDefault(require("../atom/tooltip"));

var _atomTextEditor = _interopRequireDefault(require("../atom/atom-text-editor"));

var _coAuthorForm = _interopRequireDefault(require("./co-author-form"));

var _recentCommitsView = _interopRequireDefault(require("./recent-commits-view"));

var _stagingView = _interopRequireDefault(require("./staging-view"));

var _commands = _interopRequireWildcard(require("../atom/commands"));

var _refHolder = _interopRequireDefault(require("../models/ref-holder"));

var _author = _interopRequireDefault(require("../models/author"));

var _observeModel = _interopRequireDefault(require("./observe-model"));

var _helpers = require("../helpers");

var _propTypes2 = require("../prop-types");

var _reporterProxy = require("../reporter-proxy");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const TOOLTIP_DELAY = 200; // CustomEvent is a DOM primitive, which v8 can't access
// so we're essentially lazy loading to keep snapshotting from breaking.

let FakeKeyDownEvent;

class CommitView extends _react.default.Component {
  constructor(props, context) {
    super(props, context);
    (0, _helpers.autobind)(this, 'submitNewCoAuthor', 'cancelNewCoAuthor', 'didMoveCursor', 'toggleHardWrap', 'toggleCoAuthorInput', 'abortMerge', 'commit', 'amendLastCommit', 'toggleExpandedCommitMessageEditor', 'renderCoAuthorListItem', 'onSelectedCoAuthorsChanged', 'excludeCoAuthor');
    this.state = {
      showWorking: false,
      showCoAuthorInput: false,
      showCoAuthorForm: false,
      coAuthorInput: ''
    };
    this.timeoutHandle = null;
    this.subscriptions = new _eventKit.CompositeDisposable();
    this.refRoot = new _refHolder.default();
    this.refCommitPreviewButton = new _refHolder.default();
    this.refExpandButton = new _refHolder.default();
    this.refCommitButton = new _refHolder.default();
    this.refHardWrapButton = new _refHolder.default();
    this.refAbortMergeButton = new _refHolder.default();
    this.refCoAuthorToggle = new _refHolder.default();
    this.refCoAuthorSelect = new _refHolder.default();
    this.refCoAuthorForm = new _refHolder.default();
    this.refEditorComponent = new _refHolder.default();
    this.refEditorModel = new _refHolder.default();
    this.subs = new _eventKit.CompositeDisposable();
  }

  proxyKeyCode(keyCode) {
    return e => {
      if (this.refCoAuthorSelect.isEmpty()) {
        return;
      }

      if (!FakeKeyDownEvent) {
        FakeKeyDownEvent = class extends CustomEvent {
          constructor(kCode) {
            super('keydown');
            this.keyCode = kCode;
          }

        };
      }

      const fakeEvent = new FakeKeyDownEvent(keyCode);
      this.refCoAuthorSelect.get().handleKeyDown(fakeEvent);

      if (!fakeEvent.defaultPrevented) {
        e.abortKeyBinding();
      }
    };
  } // eslint-disable-next-line camelcase


  UNSAFE_componentWillMount() {
    this.scheduleShowWorking(this.props);
    this.subs.add(this.props.config.onDidChange('github.automaticCommitMessageWrapping', () => this.forceUpdate()), this.props.messageBuffer.onDidChange(() => this.forceUpdate()));
  }

  render() {
    let remainingCharsClassName = '';
    const remainingCharacters = parseInt(this.getRemainingCharacters(), 10);

    if (remainingCharacters < 0) {
      remainingCharsClassName = 'is-error';
    } else if (remainingCharacters < this.props.maximumCharacterLimit / 4) {
      remainingCharsClassName = 'is-warning';
    }

    const showAbortMergeButton = this.props.isMerging || null;
    /* istanbul ignore next */

    const modKey = process.platform === 'darwin' ? 'Cmd' : 'Ctrl';
    return _react.default.createElement("div", {
      className: "github-CommitView",
      ref: this.refRoot.setter
    }, _react.default.createElement(_commands.default, {
      registry: this.props.commands,
      target: "atom-workspace"
    }, _react.default.createElement(_commands.Command, {
      command: "github:commit",
      callback: this.commit
    }), _react.default.createElement(_commands.Command, {
      command: "github:amend-last-commit",
      callback: this.amendLastCommit
    }), _react.default.createElement(_commands.Command, {
      command: "github:toggle-expanded-commit-message-editor",
      callback: this.toggleExpandedCommitMessageEditor
    })), _react.default.createElement(_commands.default, {
      registry: this.props.commands,
      target: ".github-CommitView-coAuthorEditor"
    }, _react.default.createElement(_commands.Command, {
      command: "github:selectbox-down",
      callback: this.proxyKeyCode(40)
    }), _react.default.createElement(_commands.Command, {
      command: "github:selectbox-up",
      callback: this.proxyKeyCode(38)
    }), _react.default.createElement(_commands.Command, {
      command: "github:selectbox-enter",
      callback: this.proxyKeyCode(13)
    }), _react.default.createElement(_commands.Command, {
      command: "github:selectbox-tab",
      callback: this.proxyKeyCode(9)
    }), _react.default.createElement(_commands.Command, {
      command: "github:selectbox-backspace",
      callback: this.proxyKeyCode(8)
    }), _react.default.createElement(_commands.Command, {
      command: "github:selectbox-pageup",
      callback: this.proxyKeyCode(33)
    }), _react.default.createElement(_commands.Command, {
      command: "github:selectbox-pagedown",
      callback: this.proxyKeyCode(34)
    }), _react.default.createElement(_commands.Command, {
      command: "github:selectbox-end",
      callback: this.proxyKeyCode(35)
    }), _react.default.createElement(_commands.Command, {
      command: "github:selectbox-home",
      callback: this.proxyKeyCode(36)
    }), _react.default.createElement(_commands.Command, {
      command: "github:selectbox-delete",
      callback: this.proxyKeyCode(46)
    }), _react.default.createElement(_commands.Command, {
      command: "github:selectbox-escape",
      callback: this.proxyKeyCode(27)
    }), _react.default.createElement(_commands.Command, {
      command: "github:co-author-exclude",
      callback: this.excludeCoAuthor
    })), _react.default.createElement(_commands.default, {
      registry: this.props.commands,
      target: ".github-CommitView-commitPreview"
    }, _react.default.createElement(_commands.Command, {
      command: "github:dive",
      callback: this.props.activateCommitPreview
    })), _react.default.createElement("div", {
      className: "github-CommitView-buttonWrapper"
    }, _react.default.createElement("button", {
      ref: this.refCommitPreviewButton.setter,
      className: "github-CommitView-commitPreview github-CommitView-button btn",
      disabled: !this.props.stagedChangesExist,
      onClick: this.props.toggleCommitPreview
    }, this.props.commitPreviewActive ? 'Hide All Staged Changes' : 'See All Staged Changes')), _react.default.createElement("div", {
      className: (0, _classnames.default)('github-CommitView-editor', {
        'is-expanded': this.props.deactivateCommitBox
      })
    }, _react.default.createElement(_atomTextEditor.default, {
      ref: this.refEditorComponent.setter,
      refModel: this.refEditorModel,
      softWrapped: true,
      placeholderText: "Commit message",
      lineNumberGutterVisible: false,
      showInvisibles: false,
      autoHeight: false,
      scrollPastEnd: false,
      buffer: this.props.messageBuffer,
      workspace: this.props.workspace,
      didChangeCursorPosition: this.didMoveCursor
    }), _react.default.createElement("button", {
      ref: this.refCoAuthorToggle.setter,
      className: (0, _classnames.default)('github-CommitView-coAuthorToggle', {
        focused: this.state.showCoAuthorInput
      }),
      onClick: this.toggleCoAuthorInput
    }, this.renderCoAuthorToggleIcon()), _react.default.createElement(_tooltip.default, {
      manager: this.props.tooltips,
      target: this.refCoAuthorToggle,
      title: `${this.state.showCoAuthorInput ? 'Remove' : 'Add'} co-authors`,
      showDelay: TOOLTIP_DELAY
    }), _react.default.createElement("button", {
      ref: this.refHardWrapButton.setter,
      onClick: this.toggleHardWrap,
      className: "github-CommitView-hardwrap hard-wrap-icons"
    }, this.renderHardWrapIcon()), _react.default.createElement(_tooltip.default, {
      manager: this.props.tooltips,
      target: this.refHardWrapButton,
      className: "github-CommitView-hardwrap-tooltip",
      title: "Toggle hard wrap on commit",
      showDelay: TOOLTIP_DELAY
    }), _react.default.createElement("button", {
      ref: this.refExpandButton.setter,
      className: "github-CommitView-expandButton icon icon-screen-full",
      onClick: this.toggleExpandedCommitMessageEditor
    }), _react.default.createElement(_tooltip.default, {
      manager: this.props.tooltips,
      target: this.refExpandButton,
      className: "github-CommitView-expandButton-tooltip",
      title: "Expand commit message editor",
      showDelay: TOOLTIP_DELAY
    })), this.renderCoAuthorForm(), this.renderCoAuthorInput(), _react.default.createElement("footer", {
      className: "github-CommitView-bar"
    }, showAbortMergeButton && _react.default.createElement("button", {
      ref: this.refAbortMergeButton.setter,
      className: "btn github-CommitView-button github-CommitView-abortMerge is-secondary",
      onClick: this.abortMerge
    }, "Abort Merge"), _react.default.createElement("button", {
      ref: this.refCommitButton.setter,
      className: "github-CommitView-button github-CommitView-commit btn btn-primary native-key-bindings",
      onClick: this.commit,
      disabled: !this.commitIsEnabled(false)
    }, this.commitButtonText()), this.commitIsEnabled(false) && _react.default.createElement(_tooltip.default, {
      manager: this.props.tooltips,
      target: this.refCommitButton,
      className: "github-CommitView-button-tooltip",
      title: `${modKey}-enter to commit`,
      showDelay: TOOLTIP_DELAY
    }), _react.default.createElement("div", {
      className: `github-CommitView-remaining-characters ${remainingCharsClassName}`
    }, this.getRemainingCharacters())));
  }

  renderCoAuthorToggleIcon() {
    /* eslint-disable max-len */
    const svgPath = 'M9.875 2.125H12v1.75H9.875V6h-1.75V3.875H6v-1.75h2.125V0h1.75v2.125zM6 6.5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5V6c0-1.316 2-2 2-2s.114-.204 0-.5c-.42-.31-.472-.795-.5-2C1.587.293 2.434 0 3 0s1.413.293 1.5 1.5c-.028 1.205-.08 1.69-.5 2-.114.295 0 .5 0 .5s2 .684 2 2v.5z';
    return _react.default.createElement("svg", {
      className: (0, _classnames.default)('github-CommitView-coAuthorToggleIcon', {
        focused: this.state.showCoAuthorInput
      }),
      viewBox: "0 0 12 7",
      xmlns: "http://www.w3.org/2000/svg"
    }, _react.default.createElement("title", null, "Add or remove co-authors"), _react.default.createElement("path", {
      d: svgPath
    }));
  }

  renderCoAuthorInput() {
    if (!this.state.showCoAuthorInput) {
      return null;
    }

    return _react.default.createElement(_observeModel.default, {
      model: this.props.userStore,
      fetchData: store => store.getUsers()
    }, mentionableUsers => _react.default.createElement(_reactSelect.default, {
      ref: this.refCoAuthorSelect.setter,
      className: "github-CommitView-coAuthorEditor input-textarea native-key-bindings",
      placeholder: "Co-Authors",
      arrowRenderer: null,
      options: mentionableUsers,
      labelKey: "fullName",
      valueKey: "email",
      filterOptions: this.matchAuthors,
      optionRenderer: this.renderCoAuthorListItem,
      valueRenderer: this.renderCoAuthorValue,
      onChange: this.onSelectedCoAuthorsChanged,
      value: this.props.selectedCoAuthors,
      multi: true,
      openOnClick: false,
      openOnFocus: false,
      tabIndex: "5"
    }));
  }

  renderHardWrapIcon() {
    const singleLineMessage = this.props.messageBuffer.getText().split(_helpers.LINE_ENDING_REGEX).length === 1;
    const hardWrap = this.props.config.get('github.automaticCommitMessageWrapping');
    const notApplicable = this.props.deactivateCommitBox || singleLineMessage;
    /* eslint-disable max-len */

    const svgPaths = {
      hardWrapEnabled: {
        path1: 'M7.058 10.2h-.975v2.4L2 9l4.083-3.6v2.4h.97l1.202 1.203L7.058 10.2zm2.525-4.865V4.2h2.334v1.14l-1.164 1.165-1.17-1.17z',
        // eslint-disable-line max-len
        path2: 'M7.842 6.94l2.063 2.063-2.122 2.12.908.91 2.123-2.123 1.98 1.98.85-.848L11.58 8.98l2.12-2.123-.824-.825-2.122 2.12-2.062-2.06z' // eslint-disable-line max-len

      },
      hardWrapDisabled: {
        path1: 'M11.917 8.4c0 .99-.788 1.8-1.75 1.8H6.083v2.4L2 9l4.083-3.6v2.4h3.5V4.2h2.334v4.2z'
      }
    };
    /* eslint-enable max-len */

    if (notApplicable) {
      return null;
    }

    if (hardWrap) {
      return _react.default.createElement("div", {
        className: (0, _classnames.default)('icon', 'hardwrap', 'icon-hardwrap-enabled', {
          hidden: notApplicable || !hardWrap
        })
      }, _react.default.createElement("svg", {
        width: "16",
        height: "16",
        viewBox: "0 0 16 16",
        xmlns: "http://www.w3.org/2000/svg"
      }, _react.default.createElement("path", {
        d: svgPaths.hardWrapDisabled.path1,
        fillRule: "evenodd"
      })));
    } else {
      return _react.default.createElement("div", {
        className: (0, _classnames.default)('icon', 'no-hardwrap', 'icon-hardwrap-disabled', {
          hidden: notApplicable || hardWrap
        })
      }, _react.default.createElement("svg", {
        width: "16",
        height: "16",
        viewBox: "0 0 16 16",
        xmlns: "http://www.w3.org/2000/svg"
      }, _react.default.createElement("g", {
        fillRule: "evenodd"
      }, _react.default.createElement("path", {
        d: svgPaths.hardWrapEnabled.path1
      }), _react.default.createElement("path", {
        fillRule: "nonzero",
        d: svgPaths.hardWrapEnabled.path2
      }))));
    }
  }

  renderCoAuthorForm() {
    if (!this.state.showCoAuthorForm) {
      return null;
    }

    return _react.default.createElement(_coAuthorForm.default, {
      ref: this.refCoAuthorForm.setter,
      commands: this.props.commands,
      onSubmit: this.submitNewCoAuthor,
      onCancel: this.cancelNewCoAuthor,
      name: this.state.coAuthorInput
    });
  }

  submitNewCoAuthor(newAuthor) {
    this.props.updateSelectedCoAuthors(this.props.selectedCoAuthors, newAuthor);
    this.hideNewAuthorForm();
  }

  cancelNewCoAuthor() {
    this.hideNewAuthorForm();
  }

  hideNewAuthorForm() {
    this.setState({
      showCoAuthorForm: false
    }, () => {
      this.refCoAuthorSelect.map(c => c.focus());
    });
  } // eslint-disable-next-line camelcase


  UNSAFE_componentWillReceiveProps(nextProps) {
    this.scheduleShowWorking(nextProps);
  }

  componentWillUnmount() {
    this.subs.dispose();
  }

  didMoveCursor() {
    this.forceUpdate();
  }

  toggleHardWrap() {
    const currentSetting = this.props.config.get('github.automaticCommitMessageWrapping');
    this.props.config.set('github.automaticCommitMessageWrapping', !currentSetting);
  }

  toggleCoAuthorInput() {
    this.setState({
      showCoAuthorInput: !this.state.showCoAuthorInput
    }, () => {
      if (this.state.showCoAuthorInput) {
        (0, _reporterProxy.incrementCounter)('show-co-author-input');
        this.refCoAuthorSelect.map(c => c.focus());
      } else {
        // if input is closed, remove all co-authors
        this.props.updateSelectedCoAuthors([]);
        (0, _reporterProxy.incrementCounter)('hide-co-author-input');
      }
    });
  }

  excludeCoAuthor() {
    const author = this.refCoAuthorSelect.map(c => c.getFocusedOption()).getOr(null);

    if (!author || author.isNew()) {
      return;
    }

    let excluded = this.props.config.get('github.excludedUsers');

    if (excluded && excluded !== '') {
      excluded += ', ';
    }

    excluded += author.getEmail();
    this.props.config.set('github.excludedUsers', excluded);
  }

  abortMerge() {
    this.props.abortMerge();
  }

  async commit(event, amend) {
    if ((await this.props.prepareToCommit()) && this.commitIsEnabled(amend)) {
      try {
        await this.props.commit(this.props.messageBuffer.getText(), this.props.selectedCoAuthors, amend);
      } catch (e) {
        // do nothing - error was taken care of in pipeline manager
        if (!atom.isReleasedVersion()) {
          throw e;
        }
      }
    } else {
      this.setFocus(CommitView.focus.EDITOR);
    }
  }

  amendLastCommit() {
    (0, _reporterProxy.incrementCounter)('amend');
    this.commit(null, true);
  }

  getRemainingCharacters() {
    return this.refEditorModel.map(editor => {
      if (editor.getCursorBufferPosition().row === 0) {
        return (this.props.maximumCharacterLimit - editor.lineTextForBufferRow(0).length).toString();
      } else {
        return '∞';
      }
    }).getOr(this.props.maximumCharacterLimit || '');
  } // We don't want the user to see the UI flicker in the case
  // the commit takes a very small time to complete. Instead we
  // will only show the working message if we are working for longer
  // than 1 second as per https://www.nngroup.com/articles/response-times-3-important-limits/
  //
  // The closure is created to restrict variable access


  scheduleShowWorking(props) {
    if (props.isCommitting) {
      if (!this.state.showWorking && this.timeoutHandle === null) {
        this.timeoutHandle = setTimeout(() => {
          this.timeoutHandle = null;
          this.setState({
            showWorking: true
          });
        }, 1000);
      }
    } else {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
      this.setState({
        showWorking: false
      });
    }
  }

  isValidMessage() {
    // ensure that there are at least some non-comment lines in the commit message.
    // Commented lines are stripped out of commit messages by git, by default configuration.
    return this.props.messageBuffer.getText().replace(/^#.*$/gm, '').trim().length !== 0;
  }

  commitIsEnabled(amend) {
    return !this.props.isCommitting && (amend || this.props.stagedChangesExist) && !this.props.mergeConflictsExist && this.props.lastCommit.isPresent() && (this.props.deactivateCommitBox || amend || this.isValidMessage());
  }

  commitButtonText() {
    if (this.state.showWorking) {
      return 'Working...';
    } else if (this.props.currentBranch.isDetached()) {
      return 'Create detached commit';
    } else if (this.props.currentBranch.isPresent()) {
      return `Commit to ${this.props.currentBranch.getName()}`;
    } else {
      return 'Commit';
    }
  }

  toggleExpandedCommitMessageEditor() {
    return this.props.toggleExpandedCommitMessageEditor(this.props.messageBuffer.getText());
  }

  matchAuthors(authors, filterText, selectedAuthors) {
    const matchedAuthors = authors.filter((author, index) => {
      const isAlreadySelected = selectedAuthors && selectedAuthors.find(selected => selected.matches(author));
      const matchesFilter = [author.getLogin(), author.getFullName(), author.getEmail()].some(field => field && field.toLowerCase().indexOf(filterText.toLowerCase()) !== -1);
      return !isAlreadySelected && matchesFilter;
    });
    matchedAuthors.push(_author.default.createNew('Add new author', filterText));
    return matchedAuthors;
  }

  renderCoAuthorListItemField(fieldName, value) {
    if (!value || value.length === 0) {
      return null;
    }

    return _react.default.createElement("span", {
      className: `github-CommitView-coAuthorEditor-${fieldName}`
    }, value);
  }

  renderCoAuthorListItem(author) {
    return _react.default.createElement("div", {
      className: (0, _classnames.default)('github-CommitView-coAuthorEditor-selectListItem', {
        'new-author': author.isNew()
      })
    }, this.renderCoAuthorListItemField('name', author.getFullName()), author.hasLogin() && this.renderCoAuthorListItemField('login', '@' + author.getLogin()), this.renderCoAuthorListItemField('email', author.getEmail()));
  }

  renderCoAuthorValue(author) {
    const fullName = author.getFullName();

    if (fullName && fullName.length > 0) {
      return _react.default.createElement("span", null, author.getFullName());
    }

    if (author.hasLogin()) {
      return _react.default.createElement("span", null, "@", author.getLogin());
    }

    return _react.default.createElement("span", null, author.getEmail());
  }

  onSelectedCoAuthorsChanged(selectedCoAuthors) {
    (0, _reporterProxy.incrementCounter)('selected-co-authors-changed');
    const newAuthor = selectedCoAuthors.find(author => author.isNew());

    if (newAuthor) {
      this.setState({
        coAuthorInput: newAuthor.getFullName(),
        showCoAuthorForm: true
      });
    } else {
      this.props.updateSelectedCoAuthors(selectedCoAuthors);
    }
  }

  hasFocus() {
    return this.refRoot.map(element => element.contains(document.activeElement)).getOr(false);
  }

  getFocus(element) {
    if (this.refCommitPreviewButton.map(button => button.contains(element)).getOr(false)) {
      return CommitView.focus.COMMIT_PREVIEW_BUTTON;
    }

    if (this.refEditorComponent.map(editor => editor.contains(element)).getOr(false)) {
      return CommitView.focus.EDITOR;
    }

    if (this.refAbortMergeButton.map(e => e.contains(element)).getOr(false)) {
      return CommitView.focus.ABORT_MERGE_BUTTON;
    }

    if (this.refCommitButton.map(e => e.contains(element)).getOr(false)) {
      return CommitView.focus.COMMIT_BUTTON;
    }

    if (this.refCoAuthorSelect.map(c => c.wrapper && c.wrapper.contains(element)).getOr(false)) {
      return CommitView.focus.COAUTHOR_INPUT;
    }

    return null;
  }

  setFocus(focus) {
    let fallback = false;

    const focusElement = element => {
      element.focus();
      return true;
    };

    if (focus === CommitView.focus.COMMIT_PREVIEW_BUTTON) {
      if (this.refCommitPreviewButton.map(focusElement).getOr(false)) {
        return true;
      }
    }

    if (focus === CommitView.focus.EDITOR) {
      if (this.refEditorComponent.map(focusElement).getOr(false)) {
        if (this.props.messageBuffer.getText().length > 0 && !this.isValidMessage()) {
          // there is likely a commit message template present
          // we want the cursor to be at the beginning, not at the and of the template
          this.refEditorComponent.get().getModel().setCursorBufferPosition([0, 0]);
        }

        return true;
      }
    }

    if (focus === CommitView.focus.ABORT_MERGE_BUTTON) {
      if (this.refAbortMergeButton.map(focusElement).getOr(false)) {
        return true;
      }

      fallback = true;
    }

    if (focus === CommitView.focus.COMMIT_BUTTON) {
      if (this.refCommitButton.map(focusElement).getOr(false)) {
        return true;
      }

      fallback = true;
    }

    if (focus === CommitView.focus.COAUTHOR_INPUT) {
      if (this.refCoAuthorSelect.map(focusElement).getOr(false)) {
        return true;
      }

      fallback = true;
    }

    if (focus === CommitView.lastFocus) {
      if (this.commitIsEnabled(false)) {
        return this.setFocus(CommitView.focus.COMMIT_BUTTON);
      } else if (this.props.isMerging) {
        return this.setFocus(CommitView.focus.ABORT_MERGE_BUTTON);
      } else if (this.state.showCoAuthorInput) {
        return this.setFocus(CommitView.focus.COAUTHOR_INPUT);
      } else {
        return this.setFocus(CommitView.focus.EDITOR);
      }
    }

    if (fallback && this.refEditorComponent.map(focusElement).getOr(false)) {
      return true;
    }

    return false;
  }

  advanceFocusFrom(focus) {
    const f = this.constructor.focus;
    let next = null;

    switch (focus) {
      case f.COMMIT_PREVIEW_BUTTON:
        next = f.EDITOR;
        break;

      case f.EDITOR:
        if (this.state.showCoAuthorInput) {
          next = f.COAUTHOR_INPUT;
        } else if (this.props.isMerging) {
          next = f.ABORT_MERGE_BUTTON;
        } else if (this.commitIsEnabled(false)) {
          next = f.COMMIT_BUTTON;
        } else {
          next = _recentCommitsView.default.firstFocus;
        }

        break;

      case f.COAUTHOR_INPUT:
        if (this.props.isMerging) {
          next = f.ABORT_MERGE_BUTTON;
        } else if (this.commitIsEnabled(false)) {
          next = f.COMMIT_BUTTON;
        } else {
          next = _recentCommitsView.default.firstFocus;
        }

        break;

      case f.ABORT_MERGE_BUTTON:
        next = this.commitIsEnabled(false) ? f.COMMIT_BUTTON : _recentCommitsView.default.firstFocus;
        break;

      case f.COMMIT_BUTTON:
        next = _recentCommitsView.default.firstFocus;
        break;
    }

    return Promise.resolve(next);
  }

  retreatFocusFrom(focus) {
    const f = this.constructor.focus;
    let previous = null;

    switch (focus) {
      case f.COMMIT_BUTTON:
        if (this.props.isMerging) {
          previous = f.ABORT_MERGE_BUTTON;
        } else if (this.state.showCoAuthorInput) {
          previous = f.COAUTHOR_INPUT;
        } else {
          previous = f.EDITOR;
        }

        break;

      case f.ABORT_MERGE_BUTTON:
        previous = this.state.showCoAuthorInput ? f.COAUTHOR_INPUT : f.EDITOR;
        break;

      case f.COAUTHOR_INPUT:
        previous = f.EDITOR;
        break;

      case f.EDITOR:
        previous = f.COMMIT_PREVIEW_BUTTON;
        break;

      case f.COMMIT_PREVIEW_BUTTON:
        previous = _stagingView.default.lastFocus;
        break;
    }

    return Promise.resolve(previous);
  }

}

exports.default = CommitView;

_defineProperty(CommitView, "focus", {
  COMMIT_PREVIEW_BUTTON: Symbol('commit-preview-button'),
  EDITOR: Symbol('commit-editor'),
  COAUTHOR_INPUT: Symbol('coauthor-input'),
  ABORT_MERGE_BUTTON: Symbol('commit-abort-merge-button'),
  COMMIT_BUTTON: Symbol('commit-button')
});

_defineProperty(CommitView, "firstFocus", CommitView.focus.COMMIT_PREVIEW_BUTTON);

_defineProperty(CommitView, "lastFocus", Symbol('last-focus'));

_defineProperty(CommitView, "propTypes", {
  workspace: _propTypes.default.object.isRequired,
  config: _propTypes.default.object.isRequired,
  tooltips: _propTypes.default.object.isRequired,
  commands: _propTypes.default.object.isRequired,
  lastCommit: _propTypes.default.object.isRequired,
  currentBranch: _propTypes.default.object.isRequired,
  isMerging: _propTypes.default.bool.isRequired,
  mergeConflictsExist: _propTypes.default.bool.isRequired,
  stagedChangesExist: _propTypes.default.bool.isRequired,
  isCommitting: _propTypes.default.bool.isRequired,
  commitPreviewActive: _propTypes.default.bool.isRequired,
  deactivateCommitBox: _propTypes.default.bool.isRequired,
  maximumCharacterLimit: _propTypes.default.number.isRequired,
  messageBuffer: _propTypes.default.object.isRequired,
  // FIXME more specific proptype
  userStore: _propTypes2.UserStorePropType.isRequired,
  selectedCoAuthors: _propTypes.default.arrayOf(_propTypes2.AuthorPropType),
  updateSelectedCoAuthors: _propTypes.default.func,
  commit: _propTypes.default.func.isRequired,
  abortMerge: _propTypes.default.func.isRequired,
  prepareToCommit: _propTypes.default.func.isRequired,
  toggleExpandedCommitMessageEditor: _propTypes.default.func.isRequired,
  toggleCommitPreview: _propTypes.default.func.isRequired,
  activateCommitPreview: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi92aWV3cy9jb21taXQtdmlldy5qcyJdLCJuYW1lcyI6WyJUT09MVElQX0RFTEFZIiwiRmFrZUtleURvd25FdmVudCIsIkNvbW1pdFZpZXciLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjb250ZXh0Iiwic3RhdGUiLCJzaG93V29ya2luZyIsInNob3dDb0F1dGhvcklucHV0Iiwic2hvd0NvQXV0aG9yRm9ybSIsImNvQXV0aG9ySW5wdXQiLCJ0aW1lb3V0SGFuZGxlIiwic3Vic2NyaXB0aW9ucyIsIkNvbXBvc2l0ZURpc3Bvc2FibGUiLCJyZWZSb290IiwiUmVmSG9sZGVyIiwicmVmQ29tbWl0UHJldmlld0J1dHRvbiIsInJlZkV4cGFuZEJ1dHRvbiIsInJlZkNvbW1pdEJ1dHRvbiIsInJlZkhhcmRXcmFwQnV0dG9uIiwicmVmQWJvcnRNZXJnZUJ1dHRvbiIsInJlZkNvQXV0aG9yVG9nZ2xlIiwicmVmQ29BdXRob3JTZWxlY3QiLCJyZWZDb0F1dGhvckZvcm0iLCJyZWZFZGl0b3JDb21wb25lbnQiLCJyZWZFZGl0b3JNb2RlbCIsInN1YnMiLCJwcm94eUtleUNvZGUiLCJrZXlDb2RlIiwiZSIsImlzRW1wdHkiLCJDdXN0b21FdmVudCIsImtDb2RlIiwiZmFrZUV2ZW50IiwiZ2V0IiwiaGFuZGxlS2V5RG93biIsImRlZmF1bHRQcmV2ZW50ZWQiLCJhYm9ydEtleUJpbmRpbmciLCJVTlNBRkVfY29tcG9uZW50V2lsbE1vdW50Iiwic2NoZWR1bGVTaG93V29ya2luZyIsImFkZCIsImNvbmZpZyIsIm9uRGlkQ2hhbmdlIiwiZm9yY2VVcGRhdGUiLCJtZXNzYWdlQnVmZmVyIiwicmVuZGVyIiwicmVtYWluaW5nQ2hhcnNDbGFzc05hbWUiLCJyZW1haW5pbmdDaGFyYWN0ZXJzIiwicGFyc2VJbnQiLCJnZXRSZW1haW5pbmdDaGFyYWN0ZXJzIiwibWF4aW11bUNoYXJhY3RlckxpbWl0Iiwic2hvd0Fib3J0TWVyZ2VCdXR0b24iLCJpc01lcmdpbmciLCJtb2RLZXkiLCJwcm9jZXNzIiwicGxhdGZvcm0iLCJzZXR0ZXIiLCJjb21tYW5kcyIsImNvbW1pdCIsImFtZW5kTGFzdENvbW1pdCIsInRvZ2dsZUV4cGFuZGVkQ29tbWl0TWVzc2FnZUVkaXRvciIsImV4Y2x1ZGVDb0F1dGhvciIsImFjdGl2YXRlQ29tbWl0UHJldmlldyIsInN0YWdlZENoYW5nZXNFeGlzdCIsInRvZ2dsZUNvbW1pdFByZXZpZXciLCJjb21taXRQcmV2aWV3QWN0aXZlIiwiZGVhY3RpdmF0ZUNvbW1pdEJveCIsIndvcmtzcGFjZSIsImRpZE1vdmVDdXJzb3IiLCJmb2N1c2VkIiwidG9nZ2xlQ29BdXRob3JJbnB1dCIsInJlbmRlckNvQXV0aG9yVG9nZ2xlSWNvbiIsInRvb2x0aXBzIiwidG9nZ2xlSGFyZFdyYXAiLCJyZW5kZXJIYXJkV3JhcEljb24iLCJyZW5kZXJDb0F1dGhvckZvcm0iLCJyZW5kZXJDb0F1dGhvcklucHV0IiwiYWJvcnRNZXJnZSIsImNvbW1pdElzRW5hYmxlZCIsImNvbW1pdEJ1dHRvblRleHQiLCJzdmdQYXRoIiwidXNlclN0b3JlIiwic3RvcmUiLCJnZXRVc2VycyIsIm1lbnRpb25hYmxlVXNlcnMiLCJtYXRjaEF1dGhvcnMiLCJyZW5kZXJDb0F1dGhvckxpc3RJdGVtIiwicmVuZGVyQ29BdXRob3JWYWx1ZSIsIm9uU2VsZWN0ZWRDb0F1dGhvcnNDaGFuZ2VkIiwic2VsZWN0ZWRDb0F1dGhvcnMiLCJzaW5nbGVMaW5lTWVzc2FnZSIsImdldFRleHQiLCJzcGxpdCIsIkxJTkVfRU5ESU5HX1JFR0VYIiwibGVuZ3RoIiwiaGFyZFdyYXAiLCJub3RBcHBsaWNhYmxlIiwic3ZnUGF0aHMiLCJoYXJkV3JhcEVuYWJsZWQiLCJwYXRoMSIsInBhdGgyIiwiaGFyZFdyYXBEaXNhYmxlZCIsImhpZGRlbiIsInN1Ym1pdE5ld0NvQXV0aG9yIiwiY2FuY2VsTmV3Q29BdXRob3IiLCJuZXdBdXRob3IiLCJ1cGRhdGVTZWxlY3RlZENvQXV0aG9ycyIsImhpZGVOZXdBdXRob3JGb3JtIiwic2V0U3RhdGUiLCJtYXAiLCJjIiwiZm9jdXMiLCJVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIm5leHRQcm9wcyIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwiZGlzcG9zZSIsImN1cnJlbnRTZXR0aW5nIiwic2V0IiwiYXV0aG9yIiwiZ2V0Rm9jdXNlZE9wdGlvbiIsImdldE9yIiwiaXNOZXciLCJleGNsdWRlZCIsImdldEVtYWlsIiwiZXZlbnQiLCJhbWVuZCIsInByZXBhcmVUb0NvbW1pdCIsImF0b20iLCJpc1JlbGVhc2VkVmVyc2lvbiIsInNldEZvY3VzIiwiRURJVE9SIiwiZWRpdG9yIiwiZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24iLCJyb3ciLCJsaW5lVGV4dEZvckJ1ZmZlclJvdyIsInRvU3RyaW5nIiwiaXNDb21taXR0aW5nIiwic2V0VGltZW91dCIsImNsZWFyVGltZW91dCIsImlzVmFsaWRNZXNzYWdlIiwicmVwbGFjZSIsInRyaW0iLCJtZXJnZUNvbmZsaWN0c0V4aXN0IiwibGFzdENvbW1pdCIsImlzUHJlc2VudCIsImN1cnJlbnRCcmFuY2giLCJpc0RldGFjaGVkIiwiZ2V0TmFtZSIsImF1dGhvcnMiLCJmaWx0ZXJUZXh0Iiwic2VsZWN0ZWRBdXRob3JzIiwibWF0Y2hlZEF1dGhvcnMiLCJmaWx0ZXIiLCJpbmRleCIsImlzQWxyZWFkeVNlbGVjdGVkIiwiZmluZCIsInNlbGVjdGVkIiwibWF0Y2hlcyIsIm1hdGNoZXNGaWx0ZXIiLCJnZXRMb2dpbiIsImdldEZ1bGxOYW1lIiwic29tZSIsImZpZWxkIiwidG9Mb3dlckNhc2UiLCJpbmRleE9mIiwicHVzaCIsIkF1dGhvciIsImNyZWF0ZU5ldyIsInJlbmRlckNvQXV0aG9yTGlzdEl0ZW1GaWVsZCIsImZpZWxkTmFtZSIsInZhbHVlIiwiaGFzTG9naW4iLCJmdWxsTmFtZSIsImhhc0ZvY3VzIiwiZWxlbWVudCIsImNvbnRhaW5zIiwiZG9jdW1lbnQiLCJhY3RpdmVFbGVtZW50IiwiZ2V0Rm9jdXMiLCJidXR0b24iLCJDT01NSVRfUFJFVklFV19CVVRUT04iLCJBQk9SVF9NRVJHRV9CVVRUT04iLCJDT01NSVRfQlVUVE9OIiwid3JhcHBlciIsIkNPQVVUSE9SX0lOUFVUIiwiZmFsbGJhY2siLCJmb2N1c0VsZW1lbnQiLCJnZXRNb2RlbCIsInNldEN1cnNvckJ1ZmZlclBvc2l0aW9uIiwibGFzdEZvY3VzIiwiYWR2YW5jZUZvY3VzRnJvbSIsImYiLCJuZXh0IiwiUmVjZW50Q29tbWl0c1ZpZXciLCJmaXJzdEZvY3VzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZXRyZWF0Rm9jdXNGcm9tIiwicHJldmlvdXMiLCJTdGFnaW5nVmlldyIsIlN5bWJvbCIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJib29sIiwibnVtYmVyIiwiVXNlclN0b3JlUHJvcFR5cGUiLCJhcnJheU9mIiwiQXV0aG9yUHJvcFR5cGUiLCJmdW5jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBRUEsTUFBTUEsYUFBYSxHQUFHLEdBQXRCLEMsQ0FFQTtBQUNBOztBQUNBLElBQUlDLGdCQUFKOztBQUVlLE1BQU1DLFVBQU4sU0FBeUJDLGVBQU1DLFNBQS9CLENBQXlDO0FBd0N0REMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVFDLE9BQVIsRUFBaUI7QUFDMUIsVUFBTUQsS0FBTixFQUFhQyxPQUFiO0FBQ0EsMkJBQ0UsSUFERixFQUVFLG1CQUZGLEVBRXVCLG1CQUZ2QixFQUU0QyxlQUY1QyxFQUU2RCxnQkFGN0QsRUFHRSxxQkFIRixFQUd5QixZQUh6QixFQUd1QyxRQUh2QyxFQUdpRCxpQkFIakQsRUFHb0UsbUNBSHBFLEVBSUUsd0JBSkYsRUFJNEIsNEJBSjVCLEVBSTBELGlCQUoxRDtBQU9BLFNB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VUFabkI7QUFhakJ6SSxFQUFBQSxtQkFBbUIsRUFBRXVJLG1CQUFVRyxJQUFWLENBQWVELFVBYm5CO0FBY2pCekosRUFBQUEscUJBQXFCLEVBQUV1SixtQkFBVUksTUFBVixDQUFpQkYsVUFkdkI7QUFlakIvSixFQUFBQSxhQUFhLEVBQUU2SixtQkFBVUMsTUFBVixDQUFpQkMsVUFmZjtBQWUyQjtBQUM1QzFILEVBQUFBLFNBQVMsRUFBRTZILDhCQUFrQkgsVUFoQlo7QUFpQmpCbEgsRUFBQUEsaUJBQWlCLEVBQUVnSCxtQkFBVU0sT0FBVixDQUFrQkMsMEJBQWxCLENBakJGO0FBa0JqQnRHLEVBQUFBLHVCQUF1QixFQUFFK0YsbUJBQVVRLElBbEJsQjtBQW1CakJ2SixFQUFBQSxNQUFNLEVBQUUrSSxtQkFBVVEsSUFBVixDQUFlTixVQW5CTjtBQW9CakI5SCxFQUFBQSxVQUFVLEVBQUU0SCxtQkFBVVEsSUFBVixDQUFlTixVQXBCVjtBQXFCakI3RSxFQUFBQSxlQUFlLEVBQUUyRSxtQkFBVVEsSUFBVixDQUFlTixVQXJCZjtBQXNCakIvSSxFQUFBQSxpQ0FBaUMsRUFBRTZJLG1CQUFVUSxJQUFWLENBQWVOLFVBdEJqQztBQXVCakIzSSxFQUFBQSxtQkFBbUIsRUFBRXlJLG1CQUFVUSxJQUFWLENBQWVOLFVBdkJuQjtBQXdCakI3SSxFQUFBQSxxQkFBcUIsRUFBRTJJLG1CQUFVUSxJQUFWLENBQWVOO0FBeEJyQixDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2V2ZW50LWtpdCc7XG5pbXBvcnQgY3ggZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgU2VsZWN0IGZyb20gJ3JlYWN0LXNlbGVjdCc7XG5cbmltcG9ydCBUb29sdGlwIGZyb20gJy4uL2F0b20vdG9vbHRpcCc7XG5pbXBvcnQgQXRvbVRleHRFZGl0b3IgZnJvbSAnLi4vYXRvbS9hdG9tLXRleHQtZWRpdG9yJztcbmltcG9ydCBDb0F1dGhvckZvcm0gZnJvbSAnLi9jby1hdXRob3ItZm9ybSc7XG5pbXBvcnQgUmVjZW50Q29tbWl0c1ZpZXcgZnJvbSAnLi9yZWNlbnQtY29tbWl0cy12aWV3JztcbmltcG9ydCBTdGFnaW5nVmlldyBmcm9tICcuL3N0YWdpbmctdmlldyc7XG5pbXBvcnQgQ29tbWFuZHMsIHtDb21tYW5kfSBmcm9tICcuLi9hdG9tL2NvbW1hbmRzJztcbmltcG9ydCBSZWZIb2xkZXIgZnJvbSAnLi4vbW9kZWxzL3JlZi1ob2xkZXInO1xuaW1wb3J0IEF1dGhvciBmcm9tICcuLi9tb2RlbHMvYXV0aG9yJztcbmltcG9ydCBPYnNlcnZlTW9kZWwgZnJvbSAnLi9vYnNlcnZlLW1vZGVsJztcbmltcG9ydCB7TElORV9FTkRJTkdfUkVHRVgsIGF1dG9iaW5kfSBmcm9tICcuLi9oZWxwZXJzJztcbmltcG9ydCB7QXV0aG9yUHJvcFR5cGUsIFVzZXJTdG9yZVByb3BUeXBlfSBmcm9tICcuLi9wcm9wLXR5cGVzJztcbmltcG9ydCB7aW5jcmVtZW50Q291bnRlcn0gZnJvbSAnLi4vcmVwb3J0ZXItcHJveHknO1xuXG5jb25zdCBUT09MVElQX0RFTEFZID0gMjAwO1xuXG4vLyBDdXN0b21FdmVudCBpcyBhIERPTSBwcmltaXRpdmUsIHdoaWNoIHY4IGNhbid0IGFjY2Vzc1xuLy8gc28gd2UncmUgZXNzZW50aWFsbHkgbGF6eSBsb2FkaW5nIHRvIGtlZXAgc25hcHNob3R0aW5nIGZyb20gYnJlYWtpbmcuXG5sZXQgRmFrZUtleURvd25FdmVudDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWl0VmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBmb2N1cyA9IHtcbiAgICBDT01NSVRfUFJFVklFV19CVVRUT046IFN5bWJvbCgnY29tbWl0LXByZXZpZXctYnV0dG9uJyksXG4gICAgRURJVE9SOiBTeW1ib2woJ2NvbW1pdC1lZGl0b3InKSxcbiAgICBDT0FVVEhPUl9JTlBVVDogU3ltYm9sKCdjb2F1dGhvci1pbnB1dCcpLFxuICAgIEFCT1JUX01FUkdFX0JVVFRPTjogU3ltYm9sKCdjb21taXQtYWJvcnQtbWVyZ2UtYnV0dG9uJyksXG4gICAgQ09NTUlUX0JVVFRPTjogU3ltYm9sKCdjb21taXQtYnV0dG9uJyksXG4gIH07XG5cbiAgc3RhdGljIGZpcnN0Rm9jdXMgPSBDb21taXRWaWV3LmZvY3VzLkNPTU1JVF9QUkVWSUVXX0JVVFRPTjtcblxuICBzdGF0aWMgbGFzdEZvY3VzID0gU3ltYm9sKCdsYXN0LWZvY3VzJyk7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICB3b3Jrc3BhY2U6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBjb25maWc6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICB0b29sdGlwczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIGNvbW1hbmRzOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG5cbiAgICBsYXN0Q29tbWl0OiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgY3VycmVudEJyYW5jaDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIGlzTWVyZ2luZzogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBtZXJnZUNvbmZsaWN0c0V4aXN0OiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIHN0YWdlZENoYW5nZXNFeGlzdDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBpc0NvbW1pdHRpbmc6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgY29tbWl0UHJldmlld0FjdGl2ZTogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBkZWFjdGl2YXRlQ29tbWl0Qm94OiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIG1heGltdW1DaGFyYWN0ZXJMaW1pdDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIG1lc3NhZ2VCdWZmZXI6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCwgLy8gRklYTUUgbW9yZSBzcGVjaWZpYyBwcm9wdHlwZVxuICAgIHVzZXJTdG9yZTogVXNlclN0b3JlUHJvcFR5cGUuaXNSZXF1aXJlZCxcbiAgICBzZWxlY3RlZENvQXV0aG9yczogUHJvcFR5cGVzLmFycmF5T2YoQXV0aG9yUHJvcFR5cGUpLFxuICAgIHVwZGF0ZVNlbGVjdGVkQ29BdXRob3JzOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBjb21taXQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgYWJvcnRNZXJnZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBwcmVwYXJlVG9Db21taXQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgdG9nZ2xlRXhwYW5kZWRDb21taXRNZXNzYWdlRWRpdG9yOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHRvZ2dsZUNvbW1pdFByZXZpZXc6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgYWN0aXZhdGVDb21taXRQcmV2aWV3OiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgc3VwZXIocHJvcHMsIGNvbnRleHQpO1xuICAgIGF1dG9iaW5kKFxuICAgICAgdGhpcyxcbiAgICAgICdzdWJtaXROZXdDb0F1dGhvcicsICdjYW5jZWxOZXdDb0F1dGhvcicsICdkaWRNb3ZlQ3Vyc29yJywgJ3RvZ2dsZUhhcmRXcmFwJyxcbiAgICAgICd0b2dnbGVDb0F1dGhvcklucHV0JywgJ2Fib3J0TWVyZ2UnLCAnY29tbWl0JywgJ2FtZW5kTGFzdENvbW1pdCcsICd0b2dnbGVFeHBhbmRlZENvbW1pdE1lc3NhZ2VFZGl0b3InLFxuICAgICAgJ3JlbmRlckNvQXV0aG9yTGlzdEl0ZW0nLCAnb25TZWxlY3RlZENvQXV0aG9yc0NoYW5nZWQnLCAnZXhjbHVkZUNvQXV0aG9yJyxcbiAgICApO1xuXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHNob3dXb3JraW5nOiBmYWxzZSxcbiAgICAgIHNob3dDb0F1dGhvcklucHV0OiBmYWxzZSxcbiAgICAgIHNob3dDb0F1dGhvckZvcm06IGZhbHNlLFxuICAgICAgY29BdXRob3JJbnB1dDogJycsXG4gICAgfTtcblxuICAgIHRoaXMudGltZW91dEhhbmRsZSA9IG51bGw7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIHRoaXMucmVmUm9vdCA9IG5ldyBSZWZIb2xkZXIoKTtcbiAgICB0aGlzLnJlZkNvbW1pdFByZXZpZXdCdXR0b24gPSBuZXcgUmVmSG9sZGVyKCk7XG4gICAgdGhpcy5yZWZFeHBhbmRCdXR0b24gPSBuZXcgUmVmSG9sZGVyKCk7XG4gICAgdGhpcy5yZWZDb21taXRCdXR0b24gPSBuZXcgUmVmSG9sZGVyKCk7XG4gICAgdGhpcy5yZWZIYXJkV3JhcEJ1dHRvbiA9IG5ldyBSZWZIb2xkZXIoKTtcbiAgICB0aGlzLnJlZkFib3J0TWVyZ2VCdXR0b24gPSBuZXcgUmVmSG9sZGVyKCk7XG4gICAgdGhpcy5yZWZDb0F1dGhvclRvZ2dsZSA9IG5ldyBSZWZIb2xkZXIoKTtcbiAgICB0aGlzLnJlZkNvQXV0aG9yU2VsZWN0ID0gbmV3IFJlZkhvbGRlcigpO1xuICAgIHRoaXMucmVmQ29BdXRob3JGb3JtID0gbmV3IFJlZkhvbGRlcigpO1xuICAgIHRoaXMucmVmRWRpdG9yQ29tcG9uZW50ID0gbmV3IFJlZkhvbGRlcigpO1xuICAgIHRoaXMucmVmRWRpdG9yTW9kZWwgPSBuZXcgUmVmSG9sZGVyKCk7XG5cbiAgICB0aGlzLnN1YnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICB9XG5cbiAgcHJveHlLZXlDb2RlKGtleUNvZGUpIHtcbiAgICByZXR1cm4gZSA9PiB7XG4gICAgICBpZiAodGhpcy5yZWZDb0F1dGhvclNlbGVjdC5pc0VtcHR5KCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoIUZha2VLZXlEb3duRXZlbnQpIHtcbiAgICAgICAgRmFrZUtleURvd25FdmVudCA9IGNsYXNzIGV4dGVuZHMgQ3VzdG9tRXZlbnQge1xuICAgICAgICAgIGNvbnN0cnVjdG9yKGtDb2RlKSB7XG4gICAgICAgICAgICBzdXBlcigna2V5ZG93bicpO1xuICAgICAgICAgICAgdGhpcy5rZXlDb2RlID0ga0NvZGU7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBjb25zdCBmYWtlRXZlbnQgPSBuZXcgRmFrZUtleURvd25FdmVudChrZXlDb2RlKTtcbiAgICAgIHRoaXMucmVmQ29BdXRob3JTZWxlY3QuZ2V0KCkuaGFuZGxlS2V5RG93bihmYWtlRXZlbnQpO1xuXG4gICAgICBpZiAoIWZha2VFdmVudC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgIGUuYWJvcnRLZXlCaW5kaW5nKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgVU5TQUZFX2NvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICB0aGlzLnNjaGVkdWxlU2hvd1dvcmtpbmcodGhpcy5wcm9wcyk7XG5cbiAgICB0aGlzLnN1YnMuYWRkKFxuICAgICAgdGhpcy5wcm9wcy5jb25maWcub25EaWRDaGFuZ2UoJ2dpdGh1Yi5hdXRvbWF0aWNDb21taXRNZXNzYWdlV3JhcHBpbmcnLCAoKSA9PiB0aGlzLmZvcmNlVXBkYXRlKCkpLFxuICAgICAgdGhpcy5wcm9wcy5tZXNzYWdlQnVmZmVyLm9uRGlkQ2hhbmdlKCgpID0+IHRoaXMuZm9yY2VVcGRhdGUoKSksXG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBsZXQgcmVtYWluaW5nQ2hhcnNDbGFzc05hbWUgPSAnJztcbiAgICBjb25zdCByZW1haW5pbmdDaGFyYWN0ZXJzID0gcGFyc2VJbnQodGhpcy5nZXRSZW1haW5pbmdDaGFyYWN0ZXJzKCksIDEwKTtcbiAgICBpZiAocmVtYWluaW5nQ2hhcmFjdGVycyA8IDApIHtcbiAgICAgIHJlbWFpbmluZ0NoYXJzQ2xhc3NOYW1lID0gJ2lzLWVycm9yJztcbiAgICB9IGVsc2UgaWYgKHJlbWFpbmluZ0NoYXJhY3RlcnMgPCB0aGlzLnByb3BzLm1heGltdW1DaGFyYWN0ZXJMaW1pdCAvIDQpIHtcbiAgICAgIHJlbWFpbmluZ0NoYXJzQ2xhc3NOYW1lID0gJ2lzLXdhcm5pbmcnO1xuICAgIH1cblxuICAgIGNvbnN0IHNob3dBYm9ydE1lcmdlQnV0dG9uID0gdGhpcy5wcm9wcy5pc01lcmdpbmcgfHwgbnVsbDtcblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgY29uc3QgbW9kS2V5ID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicgPyAnQ21kJyA6ICdDdHJsJztcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImdpdGh1Yi1Db21taXRWaWV3XCIgcmVmPXt0aGlzLnJlZlJvb3Quc2V0dGVyfT5cbiAgICAgICAgPENvbW1hbmRzIHJlZ2lzdHJ5PXt0aGlzLnByb3BzLmNvbW1hbmRzfSB0YXJnZXQ9XCJhdG9tLXdvcmtzcGFjZVwiPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6Y29tbWl0XCIgY2FsbGJhY2s9e3RoaXMuY29tbWl0fSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6YW1lbmQtbGFzdC1jb21taXRcIiBjYWxsYmFjaz17dGhpcy5hbWVuZExhc3RDb21taXR9IC8+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1Yjp0b2dnbGUtZXhwYW5kZWQtY29tbWl0LW1lc3NhZ2UtZWRpdG9yXCJcbiAgICAgICAgICAgIGNhbGxiYWNrPXt0aGlzLnRvZ2dsZUV4cGFuZGVkQ29tbWl0TWVzc2FnZUVkaXRvcn1cbiAgICAgICAgICAvPlxuICAgICAgICA8L0NvbW1hbmRzPlxuICAgICAgICA8Q29tbWFuZHMgcmVnaXN0cnk9e3RoaXMucHJvcHMuY29tbWFuZHN9IHRhcmdldD1cIi5naXRodWItQ29tbWl0Vmlldy1jb0F1dGhvckVkaXRvclwiPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6c2VsZWN0Ym94LWRvd25cIiBjYWxsYmFjaz17dGhpcy5wcm94eUtleUNvZGUoNDApfSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6c2VsZWN0Ym94LXVwXCIgY2FsbGJhY2s9e3RoaXMucHJveHlLZXlDb2RlKDM4KX0gLz5cbiAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiZ2l0aHViOnNlbGVjdGJveC1lbnRlclwiIGNhbGxiYWNrPXt0aGlzLnByb3h5S2V5Q29kZSgxMyl9IC8+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1YjpzZWxlY3Rib3gtdGFiXCIgY2FsbGJhY2s9e3RoaXMucHJveHlLZXlDb2RlKDkpfSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6c2VsZWN0Ym94LWJhY2tzcGFjZVwiIGNhbGxiYWNrPXt0aGlzLnByb3h5S2V5Q29kZSg4KX0gLz5cbiAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiZ2l0aHViOnNlbGVjdGJveC1wYWdldXBcIiBjYWxsYmFjaz17dGhpcy5wcm94eUtleUNvZGUoMzMpfSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6c2VsZWN0Ym94LXBhZ2Vkb3duXCIgY2FsbGJhY2s9e3RoaXMucHJveHlLZXlDb2RlKDM0KX0gLz5cbiAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiZ2l0aHViOnNlbGVjdGJveC1lbmRcIiBjYWxsYmFjaz17dGhpcy5wcm94eUtleUNvZGUoMzUpfSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6c2VsZWN0Ym94LWhvbWVcIiBjYWxsYmFjaz17dGhpcy5wcm94eUtleUNvZGUoMzYpfSAvPlxuICAgICAgICAgIDxDb21tYW5kIGNvbW1hbmQ9XCJnaXRodWI6c2VsZWN0Ym94LWRlbGV0ZVwiIGNhbGxiYWNrPXt0aGlzLnByb3h5S2V5Q29kZSg0Nil9IC8+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1YjpzZWxlY3Rib3gtZXNjYXBlXCIgY2FsbGJhY2s9e3RoaXMucHJveHlLZXlDb2RlKDI3KX0gLz5cbiAgICAgICAgICA8Q29tbWFuZCBjb21tYW5kPVwiZ2l0aHViOmNvLWF1dGhvci1leGNsdWRlXCIgY2FsbGJhY2s9e3RoaXMuZXhjbHVkZUNvQXV0aG9yfSAvPlxuICAgICAgICA8L0NvbW1hbmRzPlxuICAgICAgICA8Q29tbWFuZHMgcmVnaXN0cnk9e3RoaXMucHJvcHMuY29tbWFuZHN9IHRhcmdldD1cIi5naXRodWItQ29tbWl0Vmlldy1jb21taXRQcmV2aWV3XCI+XG4gICAgICAgICAgPENvbW1hbmQgY29tbWFuZD1cImdpdGh1YjpkaXZlXCIgY2FsbGJhY2s9e3RoaXMucHJvcHMuYWN0aXZhdGVDb21taXRQcmV2aWV3fSAvPlxuICAgICAgICA8L0NvbW1hbmRzPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdpdGh1Yi1Db21taXRWaWV3LWJ1dHRvbldyYXBwZXJcIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICByZWY9e3RoaXMucmVmQ29tbWl0UHJldmlld0J1dHRvbi5zZXR0ZXJ9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJnaXRodWItQ29tbWl0Vmlldy1jb21taXRQcmV2aWV3IGdpdGh1Yi1Db21taXRWaWV3LWJ1dHRvbiBidG5cIlxuICAgICAgICAgICAgZGlzYWJsZWQ9eyF0aGlzLnByb3BzLnN0YWdlZENoYW5nZXNFeGlzdH1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMudG9nZ2xlQ29tbWl0UHJldmlld30+XG4gICAgICAgICAgICB7dGhpcy5wcm9wcy5jb21taXRQcmV2aWV3QWN0aXZlID8gJ0hpZGUgQWxsIFN0YWdlZCBDaGFuZ2VzJyA6ICdTZWUgQWxsIFN0YWdlZCBDaGFuZ2VzJ31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjeCgnZ2l0aHViLUNvbW1pdFZpZXctZWRpdG9yJywgeydpcy1leHBhbmRlZCc6IHRoaXMucHJvcHMuZGVhY3RpdmF0ZUNvbW1pdEJveH0pfT5cbiAgICAgICAgICA8QXRvbVRleHRFZGl0b3JcbiAgICAgICAgICAgIHJlZj17dGhpcy5yZWZFZGl0b3JDb21wb25lbnQuc2V0dGVyfVxuICAgICAgICAgICAgcmVmTW9kZWw9e3RoaXMucmVmRWRpdG9yTW9kZWx9XG4gICAgICAgICAgICBzb2Z0V3JhcHBlZD17dHJ1ZX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyVGV4dD1cIkNvbW1pdCBtZXNzYWdlXCJcbiAgICAgICAgICAgIGxpbmVOdW1iZXJHdXR0ZXJWaXNpYmxlPXtmYWxzZX1cbiAgICAgICAgICAgIHNob3dJbnZpc2libGVzPXtmYWxzZX1cbiAgICAgICAgICAgIGF1dG9IZWlnaHQ9e2ZhbHNlfVxuICAgICAgICAgICAgc2Nyb2xsUGFzdEVuZD17ZmFsc2V9XG4gICAgICAgICAgICBidWZmZXI9e3RoaXMucHJvcHMubWVzc2FnZUJ1ZmZlcn1cbiAgICAgICAgICAgIHdvcmtzcGFjZT17dGhpcy5wcm9wcy53b3Jrc3BhY2V9XG4gICAgICAgICAgICBkaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbj17dGhpcy5kaWRNb3ZlQ3Vyc29yfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgcmVmPXt0aGlzLnJlZkNvQXV0aG9yVG9nZ2xlLnNldHRlcn1cbiAgICAgICAgICAgIGNsYXNzTmFtZT17Y3goJ2dpdGh1Yi1Db21taXRWaWV3LWNvQXV0aG9yVG9nZ2xlJywge2ZvY3VzZWQ6IHRoaXMuc3RhdGUuc2hvd0NvQXV0aG9ySW5wdXR9KX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMudG9nZ2xlQ29BdXRob3JJbnB1dH0+XG4gICAgICAgICAgICB7dGhpcy5yZW5kZXJDb0F1dGhvclRvZ2dsZUljb24oKX1cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8VG9vbHRpcFxuICAgICAgICAgICAgbWFuYWdlcj17dGhpcy5wcm9wcy50b29sdGlwc31cbiAgICAgICAgICAgIHRhcmdldD17dGhpcy5yZWZDb0F1dGhvclRvZ2dsZX1cbiAgICAgICAgICAgIHRpdGxlPXtgJHt0aGlzLnN0YXRlLnNob3dDb0F1dGhvcklucHV0ID8gJ1JlbW92ZScgOiAnQWRkJ30gY28tYXV0aG9yc2B9XG4gICAgICAgICAgICBzaG93RGVsYXk9e1RPT0xUSVBfREVMQVl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICByZWY9e3RoaXMucmVmSGFyZFdyYXBCdXR0b24uc2V0dGVyfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy50b2dnbGVIYXJkV3JhcH1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImdpdGh1Yi1Db21taXRWaWV3LWhhcmR3cmFwIGhhcmQtd3JhcC1pY29uc1wiPlxuICAgICAgICAgICAge3RoaXMucmVuZGVySGFyZFdyYXBJY29uKCl9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPFRvb2x0aXBcbiAgICAgICAgICAgIG1hbmFnZXI9e3RoaXMucHJvcHMudG9vbHRpcHN9XG4gICAgICAgICAgICB0YXJnZXQ9e3RoaXMucmVmSGFyZFdyYXBCdXR0b259XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJnaXRodWItQ29tbWl0Vmlldy1oYXJkd3JhcC10b29sdGlwXCJcbiAgICAgICAgICAgIHRpdGxlPVwiVG9nZ2xlIGhhcmQgd3JhcCBvbiBjb21taXRcIlxuICAgICAgICAgICAgc2hvd0RlbGF5PXtUT09MVElQX0RFTEFZfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgcmVmPXt0aGlzLnJlZkV4cGFuZEJ1dHRvbi5zZXR0ZXJ9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJnaXRodWItQ29tbWl0Vmlldy1leHBhbmRCdXR0b24gaWNvbiBpY29uLXNjcmVlbi1mdWxsXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMudG9nZ2xlRXhwYW5kZWRDb21taXRNZXNzYWdlRWRpdG9yfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPFRvb2x0aXBcbiAgICAgICAgICAgIG1hbmFnZXI9e3RoaXMucHJvcHMudG9vbHRpcHN9XG4gICAgICAgICAgICB0YXJnZXQ9e3RoaXMucmVmRXhwYW5kQnV0dG9ufVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiZ2l0aHViLUNvbW1pdFZpZXctZXhwYW5kQnV0dG9uLXRvb2x0aXBcIlxuICAgICAgICAgICAgdGl0bGU9XCJFeHBhbmQgY29tbWl0IG1lc3NhZ2UgZWRpdG9yXCJcbiAgICAgICAgICAgIHNob3dEZWxheT17VE9PTFRJUF9ERUxBWX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICB7dGhpcy5yZW5kZXJDb0F1dGhvckZvcm0oKX1cbiAgICAgICAge3RoaXMucmVuZGVyQ29BdXRob3JJbnB1dCgpfVxuXG4gICAgICAgIDxmb290ZXIgY2xhc3NOYW1lPVwiZ2l0aHViLUNvbW1pdFZpZXctYmFyXCI+XG4gICAgICAgICAge3Nob3dBYm9ydE1lcmdlQnV0dG9uICYmXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHJlZj17dGhpcy5yZWZBYm9ydE1lcmdlQnV0dG9uLnNldHRlcn1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGdpdGh1Yi1Db21taXRWaWV3LWJ1dHRvbiBnaXRodWItQ29tbWl0Vmlldy1hYm9ydE1lcmdlIGlzLXNlY29uZGFyeVwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuYWJvcnRNZXJnZX0+QWJvcnQgTWVyZ2U8L2J1dHRvbj5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICByZWY9e3RoaXMucmVmQ29tbWl0QnV0dG9uLnNldHRlcn1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImdpdGh1Yi1Db21taXRWaWV3LWJ1dHRvbiBnaXRodWItQ29tbWl0Vmlldy1jb21taXQgYnRuIGJ0bi1wcmltYXJ5IG5hdGl2ZS1rZXktYmluZGluZ3NcIlxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5jb21taXR9XG4gICAgICAgICAgICBkaXNhYmxlZD17IXRoaXMuY29tbWl0SXNFbmFibGVkKGZhbHNlKX0+e3RoaXMuY29tbWl0QnV0dG9uVGV4dCgpfTwvYnV0dG9uPlxuICAgICAgICAgIHt0aGlzLmNvbW1pdElzRW5hYmxlZChmYWxzZSkgJiZcbiAgICAgICAgICAgIDxUb29sdGlwXG4gICAgICAgICAgICAgIG1hbmFnZXI9e3RoaXMucHJvcHMudG9vbHRpcHN9XG4gICAgICAgICAgICAgIHRhcmdldD17dGhpcy5yZWZDb21taXRCdXR0b259XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImdpdGh1Yi1Db21taXRWaWV3LWJ1dHRvbi10b29sdGlwXCJcbiAgICAgICAgICAgICAgdGl0bGU9e2Ake21vZEtleX0tZW50ZXIgdG8gY29tbWl0YH1cbiAgICAgICAgICAgICAgc2hvd0RlbGF5PXtUT09MVElQX0RFTEFZfVxuICAgICAgICAgICAgLz59XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BnaXRodWItQ29tbWl0Vmlldy1yZW1haW5pbmctY2hhcmFjdGVycyAke3JlbWFpbmluZ0NoYXJzQ2xhc3NOYW1lfWB9PlxuICAgICAgICAgICAge3RoaXMuZ2V0UmVtYWluaW5nQ2hhcmFjdGVycygpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Zvb3Rlcj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICByZW5kZXJDb0F1dGhvclRvZ2dsZUljb24oKSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuICAgIGNvbnN0IHN2Z1BhdGggPSAnTTkuODc1IDIuMTI1SDEydjEuNzVIOS44NzVWNmgtMS43NVYzLjg3NUg2di0xLjc1aDIuMTI1VjBoMS43NXYyLjEyNXpNNiA2LjVhLjUuNSAwIDAgMS0uNS41aC01YS41LjUgMCAwIDEtLjUtLjVWNmMwLTEuMzE2IDItMiAyLTJzLjExNC0uMjA0IDAtLjVjLS40Mi0uMzEtLjQ3Mi0uNzk1LS41LTJDMS41ODcuMjkzIDIuNDM0IDAgMyAwczEuNDEzLjI5MyAxLjUgMS41Yy0uMDI4IDEuMjA1LS4wOCAxLjY5LS41IDItLjExNC4yOTUgMCAuNSAwIC41czIgLjY4NCAyIDJ2LjV6JztcbiAgICByZXR1cm4gKFxuICAgICAgPHN2ZyBjbGFzc05hbWU9e2N4KCdnaXRodWItQ29tbWl0Vmlldy1jb0F1dGhvclRvZ2dsZUljb24nLCB7Zm9jdXNlZDogdGhpcy5zdGF0ZS5zaG93Q29BdXRob3JJbnB1dH0pfSB2aWV3Qm94PVwiMCAwIDEyIDdcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG4gICAgICAgIDx0aXRsZT5BZGQgb3IgcmVtb3ZlIGNvLWF1dGhvcnM8L3RpdGxlPlxuICAgICAgICA8cGF0aCBkPXtzdmdQYXRofSAvPlxuICAgICAgPC9zdmc+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlckNvQXV0aG9ySW5wdXQoKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLnNob3dDb0F1dGhvcklucHV0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPE9ic2VydmVNb2RlbCBtb2RlbD17dGhpcy5wcm9wcy51c2VyU3RvcmV9IGZldGNoRGF0YT17c3RvcmUgPT4gc3RvcmUuZ2V0VXNlcnMoKX0+XG4gICAgICAgIHttZW50aW9uYWJsZVVzZXJzID0+IChcbiAgICAgICAgICA8U2VsZWN0XG4gICAgICAgICAgICByZWY9e3RoaXMucmVmQ29BdXRob3JTZWxlY3Quc2V0dGVyfVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiZ2l0aHViLUNvbW1pdFZpZXctY29BdXRob3JFZGl0b3IgaW5wdXQtdGV4dGFyZWEgbmF0aXZlLWtleS1iaW5kaW5nc1wiXG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkNvLUF1dGhvcnNcIlxuICAgICAgICAgICAgYXJyb3dSZW5kZXJlcj17bnVsbH1cbiAgICAgICAgICAgIG9wdGlvbnM9e21lbnRpb25hYmxlVXNlcnN9XG4gICAgICAgICAgICBsYWJlbEtleT1cImZ1bGxOYW1lXCJcbiAgICAgICAgICAgIHZhbHVlS2V5PVwiZW1haWxcIlxuICAgICAgICAgICAgZmlsdGVyT3B0aW9ucz17dGhpcy5tYXRjaEF1dGhvcnN9XG4gICAgICAgICAgICBvcHRpb25SZW5kZXJlcj17dGhpcy5yZW5kZXJDb0F1dGhvckxpc3RJdGVtfVxuICAgICAgICAgICAgdmFsdWVSZW5kZXJlcj17dGhpcy5yZW5kZXJDb0F1dGhvclZhbHVlfVxuICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25TZWxlY3RlZENvQXV0aG9yc0NoYW5nZWR9XG4gICAgICAgICAgICB2YWx1ZT17dGhpcy5wcm9wcy5zZWxlY3RlZENvQXV0aG9yc31cbiAgICAgICAgICAgIG11bHRpPXt0cnVlfVxuICAgICAgICAgICAgb3Blbk9uQ2xpY2s9e2ZhbHNlfVxuICAgICAgICAgICAgb3Blbk9uRm9jdXM9e2ZhbHNlfVxuICAgICAgICAgICAgdGFiSW5kZXg9XCI1XCJcbiAgICAgICAgICAvPlxuICAgICAgICApfVxuICAgICAgPC9PYnNlcnZlTW9kZWw+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlckhhcmRXcmFwSWNvbigpIHtcbiAgICBjb25zdCBzaW5nbGVMaW5lTWVzc2FnZSA9IHRoaXMucHJvcHMubWVzc2FnZUJ1ZmZlci5nZXRUZXh0KCkuc3BsaXQoTElORV9FTkRJTkdfUkVHRVgpLmxlbmd0aCA9PT0gMTtcbiAgICBjb25zdCBoYXJkV3JhcCA9IHRoaXMucHJvcHMuY29uZmlnLmdldCgnZ2l0aHViLmF1dG9tYXRpY0NvbW1pdE1lc3NhZ2VXcmFwcGluZycpO1xuICAgIGNvbnN0IG5vdEFwcGxpY2FibGUgPSB0aGlzLnByb3BzLmRlYWN0aXZhdGVDb21taXRCb3ggfHwgc2luZ2xlTGluZU1lc3NhZ2U7XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuICovXG4gICAgY29uc3Qgc3ZnUGF0aHMgPSB7XG4gICAgICBoYXJkV3JhcEVuYWJsZWQ6IHtcbiAgICAgICAgcGF0aDE6ICdNNy4wNTggMTAuMmgtLjk3NXYyLjRMMiA5bDQuMDgzLTMuNnYyLjRoLjk3bDEuMjAyIDEuMjAzTDcuMDU4IDEwLjJ6bTIuNTI1LTQuODY1VjQuMmgyLjMzNHYxLjE0bC0xLjE2NCAxLjE2NS0xLjE3LTEuMTd6JywgLy8gZXNsaW50LWRpc2FibGUtbGluZSBtYXgtbGVuXG4gICAgICAgIHBhdGgyOiAnTTcuODQyIDYuOTRsMi4wNjMgMi4wNjMtMi4xMjIgMi4xMi45MDguOTEgMi4xMjMtMi4xMjMgMS45OCAxLjk4Ljg1LS44NDhMMTEuNTggOC45OGwyLjEyLTIuMTIzLS44MjQtLjgyNS0yLjEyMiAyLjEyLTIuMDYyLTIuMDZ6JywgLy8gZXNsaW50LWRpc2FibGUtbGluZSBtYXgtbGVuXG4gICAgICB9LFxuICAgICAgaGFyZFdyYXBEaXNhYmxlZDoge1xuICAgICAgICBwYXRoMTogJ00xMS45MTcgOC40YzAgLjk5LS43ODggMS44LTEuNzUgMS44SDYuMDgzdjIuNEwyIDlsNC4wODMtMy42djIuNGgzLjVWNC4yaDIuMzM0djQuMnonLFxuICAgICAgfSxcbiAgICB9O1xuICAgIC8qIGVzbGludC1lbmFibGUgbWF4LWxlbiAqL1xuXG4gICAgaWYgKG5vdEFwcGxpY2FibGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmIChoYXJkV3JhcCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2N4KCdpY29uJywgJ2hhcmR3cmFwJywgJ2ljb24taGFyZHdyYXAtZW5hYmxlZCcsIHtoaWRkZW46IG5vdEFwcGxpY2FibGUgfHwgIWhhcmRXcmFwfSl9PlxuICAgICAgICAgIDxzdmcgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgdmlld0JveD1cIjAgMCAxNiAxNlwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cbiAgICAgICAgICAgIDxwYXRoIGQ9e3N2Z1BhdGhzLmhhcmRXcmFwRGlzYWJsZWQucGF0aDF9IGZpbGxSdWxlPVwiZXZlbm9kZFwiIC8+XG4gICAgICAgICAgPC9zdmc+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2N4KCdpY29uJywgJ25vLWhhcmR3cmFwJywgJ2ljb24taGFyZHdyYXAtZGlzYWJsZWQnLCB7aGlkZGVuOiBub3RBcHBsaWNhYmxlIHx8IGhhcmRXcmFwfSl9PlxuICAgICAgICAgIDxzdmcgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgdmlld0JveD1cIjAgMCAxNiAxNlwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cbiAgICAgICAgICAgIDxnIGZpbGxSdWxlPVwiZXZlbm9kZFwiPlxuICAgICAgICAgICAgICA8cGF0aCBkPXtzdmdQYXRocy5oYXJkV3JhcEVuYWJsZWQucGF0aDF9IC8+XG4gICAgICAgICAgICAgIDxwYXRoIGZpbGxSdWxlPVwibm9uemVyb1wiIGQ9e3N2Z1BhdGhzLmhhcmRXcmFwRW5hYmxlZC5wYXRoMn0gLz5cbiAgICAgICAgICAgIDwvZz5cbiAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlckNvQXV0aG9yRm9ybSgpIHtcbiAgICBpZiAoIXRoaXMuc3RhdGUuc2hvd0NvQXV0aG9yRm9ybSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxDb0F1dGhvckZvcm1cbiAgICAgICAgcmVmPXt0aGlzLnJlZkNvQXV0aG9yRm9ybS5zZXR0ZXJ9XG4gICAgICAgIGNvbW1hbmRzPXt0aGlzLnByb3BzLmNvbW1hbmRzfVxuICAgICAgICBvblN1Ym1pdD17dGhpcy5zdWJtaXROZXdDb0F1dGhvcn1cbiAgICAgICAgb25DYW5jZWw9e3RoaXMuY2FuY2VsTmV3Q29BdXRob3J9XG4gICAgICAgIG5hbWU9e3RoaXMuc3RhdGUuY29BdXRob3JJbnB1dH1cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIHN1Ym1pdE5ld0NvQXV0aG9yKG5ld0F1dGhvcikge1xuICAgIHRoaXMucHJvcHMudXBkYXRlU2VsZWN0ZWRDb0F1dGhvcnModGhpcy5wcm9wcy5zZWxlY3RlZENvQXV0aG9ycywgbmV3QXV0aG9yKTtcbiAgICB0aGlzLmhpZGVOZXdBdXRob3JGb3JtKCk7XG4gIH1cblxuICBjYW5jZWxOZXdDb0F1dGhvcigpIHtcbiAgICB0aGlzLmhpZGVOZXdBdXRob3JGb3JtKCk7XG4gIH1cblxuICBoaWRlTmV3QXV0aG9yRm9ybSgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtzaG93Q29BdXRob3JGb3JtOiBmYWxzZX0sICgpID0+IHtcbiAgICAgIHRoaXMucmVmQ29BdXRob3JTZWxlY3QubWFwKGMgPT4gYy5mb2N1cygpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgdGhpcy5zY2hlZHVsZVNob3dXb3JraW5nKG5leHRQcm9wcyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLnN1YnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgZGlkTW92ZUN1cnNvcigpIHtcbiAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gIH1cblxuICB0b2dnbGVIYXJkV3JhcCgpIHtcbiAgICBjb25zdCBjdXJyZW50U2V0dGluZyA9IHRoaXMucHJvcHMuY29uZmlnLmdldCgnZ2l0aHViLmF1dG9tYXRpY0NvbW1pdE1lc3NhZ2VXcmFwcGluZycpO1xuICAgIHRoaXMucHJvcHMuY29uZmlnLnNldCgnZ2l0aHViLmF1dG9tYXRpY0NvbW1pdE1lc3NhZ2VXcmFwcGluZycsICFjdXJyZW50U2V0dGluZyk7XG4gIH1cblxuICB0b2dnbGVDb0F1dGhvcklucHV0KCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2hvd0NvQXV0aG9ySW5wdXQ6ICF0aGlzLnN0YXRlLnNob3dDb0F1dGhvcklucHV0LFxuICAgIH0sICgpID0+IHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLnNob3dDb0F1dGhvcklucHV0KSB7XG4gICAgICAgIGluY3JlbWVudENvdW50ZXIoJ3Nob3ctY28tYXV0aG9yLWlucHV0Jyk7XG4gICAgICAgIHRoaXMucmVmQ29BdXRob3JTZWxlY3QubWFwKGMgPT4gYy5mb2N1cygpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGlmIGlucHV0IGlzIGNsb3NlZCwgcmVtb3ZlIGFsbCBjby1hdXRob3JzXG4gICAgICAgIHRoaXMucHJvcHMudXBkYXRlU2VsZWN0ZWRDb0F1dGhvcnMoW10pO1xuICAgICAgICBpbmNyZW1lbnRDb3VudGVyKCdoaWRlLWNvLWF1dGhvci1pbnB1dCcpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZXhjbHVkZUNvQXV0aG9yKCkge1xuICAgIGNvbnN0IGF1dGhvciA9IHRoaXMucmVmQ29BdXRob3JTZWxlY3QubWFwKGMgPT4gYy5nZXRGb2N1c2VkT3B0aW9uKCkpLmdldE9yKG51bGwpO1xuICAgIGlmICghYXV0aG9yIHx8IGF1dGhvci5pc05ldygpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGV4Y2x1ZGVkID0gdGhpcy5wcm9wcy5jb25maWcuZ2V0KCdnaXRodWIuZXhjbHVkZWRVc2VycycpO1xuICAgIGlmIChleGNsdWRlZCAmJiBleGNsdWRlZCAhPT0gJycpIHtcbiAgICAgIGV4Y2x1ZGVkICs9ICcsICc7XG4gICAgfVxuICAgIGV4Y2x1ZGVkICs9IGF1dGhvci5nZXRFbWFpbCgpO1xuICAgIHRoaXMucHJvcHMuY29uZmlnLnNldCgnZ2l0aHViLmV4Y2x1ZGVkVXNlcnMnLCBleGNsdWRlZCk7XG4gIH1cblxuICBhYm9ydE1lcmdlKCkge1xuICAgIHRoaXMucHJvcHMuYWJvcnRNZXJnZSgpO1xuICB9XG5cbiAgYXN5bmMgY29tbWl0KGV2ZW50LCBhbWVuZCkge1xuICAgIGlmIChhd2FpdCB0aGlzLnByb3BzLnByZXBhcmVUb0NvbW1pdCgpICYmIHRoaXMuY29tbWl0SXNFbmFibGVkKGFtZW5kKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5wcm9wcy5jb21taXQodGhpcy5wcm9wcy5tZXNzYWdlQnVmZmVyLmdldFRleHQoKSwgdGhpcy5wcm9wcy5zZWxlY3RlZENvQXV0aG9ycywgYW1lbmQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBkbyBub3RoaW5nIC0gZXJyb3Igd2FzIHRha2VuIGNhcmUgb2YgaW4gcGlwZWxpbmUgbWFuYWdlclxuICAgICAgICBpZiAoIWF0b20uaXNSZWxlYXNlZFZlcnNpb24oKSkge1xuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRGb2N1cyhDb21taXRWaWV3LmZvY3VzLkVESVRPUik7XG4gICAgfVxuICB9XG5cbiAgYW1lbmRMYXN0Q29tbWl0KCkge1xuICAgIGluY3JlbWVudENvdW50ZXIoJ2FtZW5kJyk7XG4gICAgdGhpcy5jb21taXQobnVsbCwgdHJ1ZSk7XG4gIH1cblxuICBnZXRSZW1haW5pbmdDaGFyYWN0ZXJzKCkge1xuICAgIHJldHVybiB0aGlzLnJlZkVkaXRvck1vZGVsLm1hcChlZGl0b3IgPT4ge1xuICAgICAgaWYgKGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvdyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gKHRoaXMucHJvcHMubWF4aW11bUNoYXJhY3RlckxpbWl0IC0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KDApLmxlbmd0aCkudG9TdHJpbmcoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAn4oieJztcbiAgICAgIH1cbiAgICB9KS5nZXRPcih0aGlzLnByb3BzLm1heGltdW1DaGFyYWN0ZXJMaW1pdCB8fCAnJyk7XG4gIH1cblxuICAvLyBXZSBkb24ndCB3YW50IHRoZSB1c2VyIHRvIHNlZSB0aGUgVUkgZmxpY2tlciBpbiB0aGUgY2FzZVxuICAvLyB0aGUgY29tbWl0IHRha2VzIGEgdmVyeSBzbWFsbCB0aW1lIHRvIGNvbXBsZXRlLiBJbnN0ZWFkIHdlXG4gIC8vIHdpbGwgb25seSBzaG93IHRoZSB3b3JraW5nIG1lc3NhZ2UgaWYgd2UgYXJlIHdvcmtpbmcgZm9yIGxvbmdlclxuICAvLyB0aGFuIDEgc2Vjb25kIGFzIHBlciBodHRwczovL3d3dy5ubmdyb3VwLmNvbS9hcnRpY2xlcy9yZXNwb25zZS10aW1lcy0zLWltcG9ydGFudC1saW1pdHMvXG4gIC8vXG4gIC8vIFRoZSBjbG9zdXJlIGlzIGNyZWF0ZWQgdG8gcmVzdHJpY3QgdmFyaWFibGUgYWNjZXNzXG4gIHNjaGVkdWxlU2hvd1dvcmtpbmcocHJvcHMpIHtcbiAgICBpZiAocHJvcHMuaXNDb21taXR0aW5nKSB7XG4gICAgICBpZiAoIXRoaXMuc3RhdGUuc2hvd1dvcmtpbmcgJiYgdGhpcy50aW1lb3V0SGFuZGxlID09PSBudWxsKSB7XG4gICAgICAgIHRoaXMudGltZW91dEhhbmRsZSA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMudGltZW91dEhhbmRsZSA9IG51bGw7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c2hvd1dvcmtpbmc6IHRydWV9KTtcbiAgICAgICAgfSwgMTAwMCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRIYW5kbGUpO1xuICAgICAgdGhpcy50aW1lb3V0SGFuZGxlID0gbnVsbDtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dXb3JraW5nOiBmYWxzZX0pO1xuICAgIH1cbiAgfVxuXG4gIGlzVmFsaWRNZXNzYWdlKCkge1xuICAgIC8vIGVuc3VyZSB0aGF0IHRoZXJlIGFyZSBhdCBsZWFzdCBzb21lIG5vbi1jb21tZW50IGxpbmVzIGluIHRoZSBjb21taXQgbWVzc2FnZS5cbiAgICAvLyBDb21tZW50ZWQgbGluZXMgYXJlIHN0cmlwcGVkIG91dCBvZiBjb21taXQgbWVzc2FnZXMgYnkgZ2l0LCBieSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24uXG4gICAgcmV0dXJuIHRoaXMucHJvcHMubWVzc2FnZUJ1ZmZlci5nZXRUZXh0KCkucmVwbGFjZSgvXiMuKiQvZ20sICcnKS50cmltKCkubGVuZ3RoICE9PSAwO1xuICB9XG5cbiAgY29tbWl0SXNFbmFibGVkKGFtZW5kKSB7XG4gICAgcmV0dXJuICF0aGlzLnByb3BzLmlzQ29tbWl0dGluZyAmJlxuICAgICAgKGFtZW5kIHx8IHRoaXMucHJvcHMuc3RhZ2VkQ2hhbmdlc0V4aXN0KSAmJlxuICAgICAgIXRoaXMucHJvcHMubWVyZ2VDb25mbGljdHNFeGlzdCAmJlxuICAgICAgdGhpcy5wcm9wcy5sYXN0Q29tbWl0LmlzUHJlc2VudCgpICYmXG4gICAgICAodGhpcy5wcm9wcy5kZWFjdGl2YXRlQ29tbWl0Qm94IHx8IChhbWVuZCB8fCB0aGlzLmlzVmFsaWRNZXNzYWdlKCkpKTtcbiAgfVxuXG4gIGNvbW1pdEJ1dHRvblRleHQoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuc2hvd1dvcmtpbmcpIHtcbiAgICAgIHJldHVybiAnV29ya2luZy4uLic7XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmN1cnJlbnRCcmFuY2guaXNEZXRhY2hlZCgpKSB7XG4gICAgICByZXR1cm4gJ0NyZWF0ZSBkZXRhY2hlZCBjb21taXQnO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5jdXJyZW50QnJhbmNoLmlzUHJlc2VudCgpKSB7XG4gICAgICByZXR1cm4gYENvbW1pdCB0byAke3RoaXMucHJvcHMuY3VycmVudEJyYW5jaC5nZXROYW1lKCl9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdDb21taXQnO1xuICAgIH1cbiAgfVxuXG4gIHRvZ2dsZUV4cGFuZGVkQ29tbWl0TWVzc2FnZUVkaXRvcigpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy50b2dnbGVFeHBhbmRlZENvbW1pdE1lc3NhZ2VFZGl0b3IodGhpcy5wcm9wcy5tZXNzYWdlQnVmZmVyLmdldFRleHQoKSk7XG4gIH1cblxuICBtYXRjaEF1dGhvcnMoYXV0aG9ycywgZmlsdGVyVGV4dCwgc2VsZWN0ZWRBdXRob3JzKSB7XG4gICAgY29uc3QgbWF0Y2hlZEF1dGhvcnMgPSBhdXRob3JzLmZpbHRlcigoYXV0aG9yLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgaXNBbHJlYWR5U2VsZWN0ZWQgPSBzZWxlY3RlZEF1dGhvcnMgJiYgc2VsZWN0ZWRBdXRob3JzLmZpbmQoc2VsZWN0ZWQgPT4gc2VsZWN0ZWQubWF0Y2hlcyhhdXRob3IpKTtcbiAgICAgIGNvbnN0IG1hdGNoZXNGaWx0ZXIgPSBbXG4gICAgICAgIGF1dGhvci5nZXRMb2dpbigpLFxuICAgICAgICBhdXRob3IuZ2V0RnVsbE5hbWUoKSxcbiAgICAgICAgYXV0aG9yLmdldEVtYWlsKCksXG4gICAgICBdLnNvbWUoZmllbGQgPT4gZmllbGQgJiYgZmllbGQudG9Mb3dlckNhc2UoKS5pbmRleE9mKGZpbHRlclRleHQudG9Mb3dlckNhc2UoKSkgIT09IC0xKTtcblxuICAgICAgcmV0dXJuICFpc0FscmVhZHlTZWxlY3RlZCAmJiBtYXRjaGVzRmlsdGVyO1xuICAgIH0pO1xuICAgIG1hdGNoZWRBdXRob3JzLnB1c2goQXV0aG9yLmNyZWF0ZU5ldygnQWRkIG5ldyBhdXRob3InLCBmaWx0ZXJUZXh0KSk7XG4gICAgcmV0dXJuIG1hdGNoZWRBdXRob3JzO1xuICB9XG5cbiAgcmVuZGVyQ29BdXRob3JMaXN0SXRlbUZpZWxkKGZpZWxkTmFtZSwgdmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlIHx8IHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGdpdGh1Yi1Db21taXRWaWV3LWNvQXV0aG9yRWRpdG9yLSR7ZmllbGROYW1lfWB9Pnt2YWx1ZX08L3NwYW4+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlckNvQXV0aG9yTGlzdEl0ZW0oYXV0aG9yKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtjeCgnZ2l0aHViLUNvbW1pdFZpZXctY29BdXRob3JFZGl0b3Itc2VsZWN0TGlzdEl0ZW0nLCB7J25ldy1hdXRob3InOiBhdXRob3IuaXNOZXcoKX0pfT5cbiAgICAgICAge3RoaXMucmVuZGVyQ29BdXRob3JMaXN0SXRlbUZpZWxkKCduYW1lJywgYXV0aG9yLmdldEZ1bGxOYW1lKCkpfVxuICAgICAgICB7YXV0aG9yLmhhc0xvZ2luKCkgJiYgdGhpcy5yZW5kZXJDb0F1dGhvckxpc3RJdGVtRmllbGQoJ2xvZ2luJywgJ0AnICsgYXV0aG9yLmdldExvZ2luKCkpfVxuICAgICAgICB7dGhpcy5yZW5kZXJDb0F1dGhvckxpc3RJdGVtRmllbGQoJ2VtYWlsJywgYXV0aG9yLmdldEVtYWlsKCkpfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlckNvQXV0aG9yVmFsdWUoYXV0aG9yKSB7XG4gICAgY29uc3QgZnVsbE5hbWUgPSBhdXRob3IuZ2V0RnVsbE5hbWUoKTtcbiAgICBpZiAoZnVsbE5hbWUgJiYgZnVsbE5hbWUubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIDxzcGFuPnthdXRob3IuZ2V0RnVsbE5hbWUoKX08L3NwYW4+O1xuICAgIH1cbiAgICBpZiAoYXV0aG9yLmhhc0xvZ2luKCkpIHtcbiAgICAgIHJldHVybiA8c3Bhbj5Ae2F1dGhvci5nZXRMb2dpbigpfTwvc3Bhbj47XG4gICAgfVxuXG4gICAgcmV0dXJuIDxzcGFuPnthdXRob3IuZ2V0RW1haWwoKX08L3NwYW4+O1xuICB9XG5cbiAgb25TZWxlY3RlZENvQXV0aG9yc0NoYW5nZWQoc2VsZWN0ZWRDb0F1dGhvcnMpIHtcbiAgICBpbmNyZW1lbnRDb3VudGVyKCdzZWxlY3RlZC1jby1hdXRob3JzLWNoYW5nZWQnKTtcbiAgICBjb25zdCBuZXdBdXRob3IgPSBzZWxlY3RlZENvQXV0aG9ycy5maW5kKGF1dGhvciA9PiBhdXRob3IuaXNOZXcoKSk7XG5cbiAgICBpZiAobmV3QXV0aG9yKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtjb0F1dGhvcklucHV0OiBuZXdBdXRob3IuZ2V0RnVsbE5hbWUoKSwgc2hvd0NvQXV0aG9yRm9ybTogdHJ1ZX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb3BzLnVwZGF0ZVNlbGVjdGVkQ29BdXRob3JzKHNlbGVjdGVkQ29BdXRob3JzKTtcbiAgICB9XG4gIH1cblxuICBoYXNGb2N1cygpIHtcbiAgICByZXR1cm4gdGhpcy5yZWZSb290Lm1hcChlbGVtZW50ID0+IGVsZW1lbnQuY29udGFpbnMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkpLmdldE9yKGZhbHNlKTtcbiAgfVxuXG4gIGdldEZvY3VzKGVsZW1lbnQpIHtcbiAgICBpZiAodGhpcy5yZWZDb21taXRQcmV2aWV3QnV0dG9uLm1hcChidXR0b24gPT4gYnV0dG9uLmNvbnRhaW5zKGVsZW1lbnQpKS5nZXRPcihmYWxzZSkpIHtcbiAgICAgIHJldHVybiBDb21taXRWaWV3LmZvY3VzLkNPTU1JVF9QUkVWSUVXX0JVVFRPTjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5yZWZFZGl0b3JDb21wb25lbnQubWFwKGVkaXRvciA9PiBlZGl0b3IuY29udGFpbnMoZWxlbWVudCkpLmdldE9yKGZhbHNlKSkge1xuICAgICAgcmV0dXJuIENvbW1pdFZpZXcuZm9jdXMuRURJVE9SO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnJlZkFib3J0TWVyZ2VCdXR0b24ubWFwKGUgPT4gZS5jb250YWlucyhlbGVtZW50KSkuZ2V0T3IoZmFsc2UpKSB7XG4gICAgICByZXR1cm4gQ29tbWl0Vmlldy5mb2N1cy5BQk9SVF9NRVJHRV9CVVRUT047XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucmVmQ29tbWl0QnV0dG9uLm1hcChlID0+IGUuY29udGFpbnMoZWxlbWVudCkpLmdldE9yKGZhbHNlKSkge1xuICAgICAgcmV0dXJuIENvbW1pdFZpZXcuZm9jdXMuQ09NTUlUX0JVVFRPTjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5yZWZDb0F1dGhvclNlbGVjdC5tYXAoYyA9PiBjLndyYXBwZXIgJiYgYy53cmFwcGVyLmNvbnRhaW5zKGVsZW1lbnQpKS5nZXRPcihmYWxzZSkpIHtcbiAgICAgIHJldHVybiBDb21taXRWaWV3LmZvY3VzLkNPQVVUSE9SX0lOUFVUO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgc2V0Rm9jdXMoZm9jdXMpIHtcbiAgICBsZXQgZmFsbGJhY2sgPSBmYWxzZTtcbiAgICBjb25zdCBmb2N1c0VsZW1lbnQgPSBlbGVtZW50ID0+IHtcbiAgICAgIGVsZW1lbnQuZm9jdXMoKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBpZiAoZm9jdXMgPT09IENvbW1pdFZpZXcuZm9jdXMuQ09NTUlUX1BSRVZJRVdfQlVUVE9OKSB7XG4gICAgICBpZiAodGhpcy5yZWZDb21taXRQcmV2aWV3QnV0dG9uLm1hcChmb2N1c0VsZW1lbnQpLmdldE9yKGZhbHNlKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZm9jdXMgPT09IENvbW1pdFZpZXcuZm9jdXMuRURJVE9SKSB7XG4gICAgICBpZiAodGhpcy5yZWZFZGl0b3JDb21wb25lbnQubWFwKGZvY3VzRWxlbWVudCkuZ2V0T3IoZmFsc2UpKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm1lc3NhZ2VCdWZmZXIuZ2V0VGV4dCgpLmxlbmd0aCA+IDAgJiYgIXRoaXMuaXNWYWxpZE1lc3NhZ2UoKSkge1xuICAgICAgICAgIC8vIHRoZXJlIGlzIGxpa2VseSBhIGNvbW1pdCBtZXNzYWdlIHRlbXBsYXRlIHByZXNlbnRcbiAgICAgICAgICAvLyB3ZSB3YW50IHRoZSBjdXJzb3IgdG8gYmUgYXQgdGhlIGJlZ2lubmluZywgbm90IGF0IHRoZSBhbmQgb2YgdGhlIHRlbXBsYXRlXG4gICAgICAgICAgdGhpcy5yZWZFZGl0b3JDb21wb25lbnQuZ2V0KCkuZ2V0TW9kZWwoKS5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMF0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmb2N1cyA9PT0gQ29tbWl0Vmlldy5mb2N1cy5BQk9SVF9NRVJHRV9CVVRUT04pIHtcbiAgICAgIGlmICh0aGlzLnJlZkFib3J0TWVyZ2VCdXR0b24ubWFwKGZvY3VzRWxlbWVudCkuZ2V0T3IoZmFsc2UpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgZmFsbGJhY2sgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChmb2N1cyA9PT0gQ29tbWl0Vmlldy5mb2N1cy5DT01NSVRfQlVUVE9OKSB7XG4gICAgICBpZiAodGhpcy5yZWZDb21taXRCdXR0b24ubWFwKGZvY3VzRWxlbWVudCkuZ2V0T3IoZmFsc2UpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgZmFsbGJhY2sgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChmb2N1cyA9PT0gQ29tbWl0Vmlldy5mb2N1cy5DT0FVVEhPUl9JTlBVVCkge1xuICAgICAgaWYgKHRoaXMucmVmQ29BdXRob3JTZWxlY3QubWFwKGZvY3VzRWxlbWVudCkuZ2V0T3IoZmFsc2UpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgZmFsbGJhY2sgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChmb2N1cyA9PT0gQ29tbWl0Vmlldy5sYXN0Rm9jdXMpIHtcbiAgICAgIGlmICh0aGlzLmNvbW1pdElzRW5hYmxlZChmYWxzZSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0Rm9jdXMoQ29tbWl0Vmlldy5mb2N1cy5DT01NSVRfQlVUVE9OKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5pc01lcmdpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0Rm9jdXMoQ29tbWl0Vmlldy5mb2N1cy5BQk9SVF9NRVJHRV9CVVRUT04pO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnNob3dDb0F1dGhvcklucHV0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEZvY3VzKENvbW1pdFZpZXcuZm9jdXMuQ09BVVRIT1JfSU5QVVQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0Rm9jdXMoQ29tbWl0Vmlldy5mb2N1cy5FRElUT1IpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmYWxsYmFjayAmJiB0aGlzLnJlZkVkaXRvckNvbXBvbmVudC5tYXAoZm9jdXNFbGVtZW50KS5nZXRPcihmYWxzZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGFkdmFuY2VGb2N1c0Zyb20oZm9jdXMpIHtcbiAgICBjb25zdCBmID0gdGhpcy5jb25zdHJ1Y3Rvci5mb2N1cztcblxuICAgIGxldCBuZXh0ID0gbnVsbDtcbiAgICBzd2l0Y2ggKGZvY3VzKSB7XG4gICAgY2FzZSBmLkNPTU1JVF9QUkVWSUVXX0JVVFRPTjpcbiAgICAgIG5leHQgPSBmLkVESVRPUjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgZi5FRElUT1I6XG4gICAgICBpZiAodGhpcy5zdGF0ZS5zaG93Q29BdXRob3JJbnB1dCkge1xuICAgICAgICBuZXh0ID0gZi5DT0FVVEhPUl9JTlBVVDtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5pc01lcmdpbmcpIHtcbiAgICAgICAgbmV4dCA9IGYuQUJPUlRfTUVSR0VfQlVUVE9OO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmNvbW1pdElzRW5hYmxlZChmYWxzZSkpIHtcbiAgICAgICAgbmV4dCA9IGYuQ09NTUlUX0JVVFRPTjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHQgPSBSZWNlbnRDb21taXRzVmlldy5maXJzdEZvY3VzO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBmLkNPQVVUSE9SX0lOUFVUOlxuICAgICAgaWYgKHRoaXMucHJvcHMuaXNNZXJnaW5nKSB7XG4gICAgICAgIG5leHQgPSBmLkFCT1JUX01FUkdFX0JVVFRPTjtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5jb21taXRJc0VuYWJsZWQoZmFsc2UpKSB7XG4gICAgICAgIG5leHQgPSBmLkNPTU1JVF9CVVRUT047XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0ID0gUmVjZW50Q29tbWl0c1ZpZXcuZmlyc3RGb2N1cztcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgZi5BQk9SVF9NRVJHRV9CVVRUT046XG4gICAgICBuZXh0ID0gdGhpcy5jb21taXRJc0VuYWJsZWQoZmFsc2UpID8gZi5DT01NSVRfQlVUVE9OIDogUmVjZW50Q29tbWl0c1ZpZXcuZmlyc3RGb2N1cztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgZi5DT01NSVRfQlVUVE9OOlxuICAgICAgbmV4dCA9IFJlY2VudENvbW1pdHNWaWV3LmZpcnN0Rm9jdXM7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5leHQpO1xuICB9XG5cbiAgcmV0cmVhdEZvY3VzRnJvbShmb2N1cykge1xuICAgIGNvbnN0IGYgPSB0aGlzLmNvbnN0cnVjdG9yLmZvY3VzO1xuXG4gICAgbGV0IHByZXZpb3VzID0gbnVsbDtcbiAgICBzd2l0Y2ggKGZvY3VzKSB7XG4gICAgY2FzZSBmLkNPTU1JVF9CVVRUT046XG4gICAgICBpZiAodGhpcy5wcm9wcy5pc01lcmdpbmcpIHtcbiAgICAgICAgcHJldmlvdXMgPSBmLkFCT1JUX01FUkdFX0JVVFRPTjtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5zaG93Q29BdXRob3JJbnB1dCkge1xuICAgICAgICBwcmV2aW91cyA9IGYuQ09BVVRIT1JfSU5QVVQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcmV2aW91cyA9IGYuRURJVE9SO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBmLkFCT1JUX01FUkdFX0JVVFRPTjpcbiAgICAgIHByZXZpb3VzID0gdGhpcy5zdGF0ZS5zaG93Q29BdXRob3JJbnB1dCA/IGYuQ09BVVRIT1JfSU5QVVQgOiBmLkVESVRPUjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgZi5DT0FVVEhPUl9JTlBVVDpcbiAgICAgIHByZXZpb3VzID0gZi5FRElUT1I7XG4gICAgICBicmVhaztcbiAgICBjYXNlIGYuRURJVE9SOlxuICAgICAgcHJldmlvdXMgPSBmLkNPTU1JVF9QUkVWSUVXX0JVVFRPTjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgZi5DT01NSVRfUFJFVklFV19CVVRUT046XG4gICAgICBwcmV2aW91cyA9IFN0YWdpbmdWaWV3Lmxhc3RGb2N1cztcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocHJldmlvdXMpO1xuICB9XG59XG4iXX0=