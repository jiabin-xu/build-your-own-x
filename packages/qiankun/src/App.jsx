import "./App.css";

function App() {
  const fire = (event) => {
    console.log("event :>> ", event);
    console.log("fire");
  };

  const onClick = () => {
    console.log("click");
    window.history.pushState({}, "", "client/cloud/cs");
  };

  return (
    <div className="app">
      <ul className="navbar">
        <li onClick={onClick}>Home</li>
        <li>About</li>
        <li>Contact</li>
      </ul>
      <div className="container" id="container">
        Container
      </div>
    </div>
  );
}

export default App;
