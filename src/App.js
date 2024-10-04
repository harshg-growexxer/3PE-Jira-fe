import './App.css';
import LabelDropdown from './views/LabelDropdown';
function App() {
  return (
    <div className="App">
      <div className="label-dropdown-container">
        <LabelDropdown />
      </div>
      <style jsx>{`
        .label-dropdown-container {
          padding: 20px;
        }
      `}</style>
    </div>
  );
}

export default App;
