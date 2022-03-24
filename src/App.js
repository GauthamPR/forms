
import './App.css';
import Payments from './components/payments';
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import JobFair from './pages/jobfair';
import Confirmation from './components/confirmation';
function App() {
  return (
    <div className="App">
      < Router >
        <Routes>
          <Route path="/jobfair" element={<JobFair />} exact />
          <Route path="/confirmation/:type/:id" element={<Confirmation />} exact />
          <Route path="/" element={<Payments />} exact />
        </Routes>

      </Router >
    </div>)
}

export default App;
