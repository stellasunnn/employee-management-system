import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route
              path="/"
              element={<div className="p-4">Welcome to Onboarding Portal</div>}
            />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
