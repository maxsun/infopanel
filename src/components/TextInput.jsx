import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { Controlled as CodeMirror } from 'react-codemirror2';
// import './DefaultTheme.css';
import './styles/CustomCodeMirror.css';

// import CodeMirror utilities
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/gfm/gfm';
// import './markdown_mode';

import 'codemirror/mode/python/python';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/haskell/haskell';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/edit/continuelist';
import 'codemirror/addon/edit/indentlist';

// import CodeMirror themes
import 'codemirror/theme/cobalt.css';
import 'codemirror/theme/night.css';
import 'codemirror/theme/rubyblue.css';
import 'codemirror/theme/pastel-on-dark.css';
import 'codemirror/theme/xq-dark.css';
import 'codemirror/theme/xq-light.css';
import 'codemirror/theme/neat.css';

import { isNull } from 'util';

export default class TextInput extends React.Component {
  constructor(props) {
    super();
    const t = document.getElementById('root');
    const options = {
      mode: 'gfm',
      theme: 'default',
      lineNumbers: false,
      lineWrapping: false,
      autoRefresh: true,
      highlightFormatting: true,
      fencedCodeBlockHighlighting: false,
      extraKeys: {
        Enter: 'newlineAndIndentContinueMarkdownList',
        Tab: 'autoIndentMarkdownList',
        'Shift-Tab': 'autoUnindentMarkdownList',
        'Ctrl-Space': (cm) => cm.showHint({
          hint: cm.hint,
          container: document.getElementById('app'),
          closeOnUnfocus: false,
        }),
      },
    };
    this.state = {
      text: props.initialText,
      codeMirrorOptions: options,
    };
    this.inputRef = React.createRef();
    this.hint = props.hint;
  }

  componentDidMount() {
    const cm = this.editor;
    if (isNull(cm)) throw Error('Component mounted, but editor is null!');
    cm.hint = (editor) => { // eslint-disable-line no-param-reassign
      const regex = /[\S$]+/;
      const cursor = editor.getCursor();
      const line = editor.getLine(cursor.line);
      let start = cursor.ch;
      let end = start;
      while (end < line.length && regex.test(line.charAt(end))) end += 1;
      while (start && regex.test(line.charAt(start - 1))) start -= 1;
      const curWord = start !== end && line.slice(start, end);
      return {
        list: this.hint(curWord),
        from: { line: cursor.line, ch: start },
        to: { line: cursor.line, ch: end },
      };
    };
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(props) {
    this.setState({ text: props.initialText });
  }

  render() {
    const { text } = this.state;
    const { codeMirrorOptions } = this.state;
    const { onChange } = this.props;
    return (
      <div className="editorContainer">
        <CodeMirror
          ref={this.inputRef}
          value={text}
          options={codeMirrorOptions}
          onBeforeChange={(cm, e, value) => {
            this.setState({ text: value });
          }}
          onChange={onChange}
          editorDidMount={(editor) => { this.editor = editor; }}
        />
      </div>
    );
  }
}

TextInput.defaultProps = {
  onChange: () => {},
  initialText: '',
  hint: (curWord) => [curWord],
};

TextInput.propTypes = {
  onChange: PropTypes.func,
  initialText: PropTypes.string,
  hint: PropTypes.func,
};
