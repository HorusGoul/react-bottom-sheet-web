import React from 'react';
import Sheet from 'react-bottom-sheet-web';
import './App.css';

const items = new Array(100).fill(null).map((_, index) => `Item ${index}`);

function App() {
  const sheetRef = React.useRef(null);
  const scrollRef = React.useRef(null);

  return (
    <Sheet
      ref={sheetRef}
      snapPoints={[0, 0.25, 0.8]}
      initialSnapPoint={0.8}
      scrollRef={scrollRef}
    >
      <div className="container">
        <div className="header" />

        <div ref={scrollRef} className="list">
          {items.map(item => (
            <div key={item} className="item">
              {item}
            </div>
          ))}
        </div>
      </div>
    </Sheet>
  );
}

export default App;
