import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import Login from "./login";
import TimesheetApp from "./App";

function Main() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('loggedInUser')));
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('loggedInUser', JSON.stringify(userData));
  };
  return user ? (
    <TimesheetApp setUser={setUser} />
  ) : (
    <Login onLoginSuccess={handleLoginSuccess} />
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Main />);
