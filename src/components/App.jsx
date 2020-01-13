import React from 'react';
import TextInput from './TextInput';
import Panes from './Panes';
import ListDisplay from './ListDisplay';
import '../Theme.css';
import './styles/App.css';
import { ReactComponent as Contrast } from '../assets/contrast.svg';
import { ReactComponent as Logo } from '../assets/favicon.svg';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      text: localStorage.getItem('editorText') || '',
      inverted: false,
    };
    this.textInput = React.createRef();
  }

  handleEditorChange(text) {
    this.setState({ text });
    localStorage.setItem('editorText', text);
  }

  handleListClick(x) {
    this.setState({ text: x });
  }

  handleInvert() {
    const currState = () => this.state;
    this.setState({ inverted: !currState().inverted });
  }

  render() {
    const { text } = this.state;
    const items = text.split(/\s/).filter((x) => x.replace(' ', '').length > 0);
    const { inverted } = this.state;
    return (
      <div id="app" className={inverted ? 'app inverted' : 'app'}>
        <div className="header">
          <button type="button" onClick={() => { this.handleInvert(); }}>
            <Contrast />
          </button>
          <h1>
            <Logo />
            <span>Magic Notes</span>
          </h1>
        </div>
        <Panes>
          <ListDisplay
            items={items}
            onItemClick={(x) => this.handleListClick(x)}
          />
          <TextInput
            ref={this.textInput}
            initialText={text}
            onChange={(cm, opt, x) => { this.handleEditorChange(x); }}
            hint={(curWord) => items.filter(
              (x) => (x.replace(' ', '').length > 0 && x.startsWith(curWord)),
            )}
          />
        </Panes>
      </div>
    );
  }
}
