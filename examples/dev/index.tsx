import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Sheet from '../../.';
import './styles.css';

const items = new Array(100).fill(null).map((_, index) => `Item ${index}`);

const App = () => {
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  return (
    <Sheet ref={sheetRef} snapPoints={[0, 0.25]} scrollRef={scrollRef}>
      <div className="header" />

      <div ref={scrollRef} className="list">
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
