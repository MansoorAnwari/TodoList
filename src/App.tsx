import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TodoProvider } from "./context/TodoContext";
import Home from "./pages/Home";
import TaskDetails from "./pages/TaskDetails";
import React from "react";

function App() {
  return (
    <TodoProvider>
      <Router basename="/TodoList">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/task/:id" element={<TaskDetails />} />
        </Routes>
      </Router>
    </TodoProvider>
  );
}

export default App;
