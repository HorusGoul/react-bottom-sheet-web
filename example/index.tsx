import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Sheet from '../.';

const App = () => {
  return (
    <div
      style={{
        backgroundColor: 'black',
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
      }}
    >
      <Sheet />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
