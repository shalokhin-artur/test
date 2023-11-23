import { useRef } from 'react';
// import '@web3modal/wagmi';
import './App.css';
import { useInitCryptoCasino } from './lib/crypto-casino/useInitCryptoCasino';

function App() {
  const ref = useRef(null);
  const { isLoading } = useInitCryptoCasino(ref, "en");

  return (
    <div className="App" ref={ref} style={{ height: "500px", overflow: "hidden" }}>
      {isLoading && "Loading casino..."}
    </div>
  );
}

export default App;
