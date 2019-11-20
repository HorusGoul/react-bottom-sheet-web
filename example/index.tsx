import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Sheet from '../.';
import './styles.css';

const items = new Array(100).fill(null).map((_, index) => `Item ${index}`);

const App = () => {
  const sheetRef = React.useRef<HTMLDivElement>(null);

  return (
    <Sheet ref={sheetRef} snapPoints={[0, 0.4, 0.8]} minimumVisibleHeight={120}>
      <div className="header" />

      <div className="list">
        {items.map(item => (
          <div key={item} className="item">
            {item}
          </div>
        ))}
      </div>
    </Sheet>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
