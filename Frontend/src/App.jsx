import { useEffect, useState } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import axios from "axios";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard/Dashboard";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);

  // ------------------ BODY SCROLL ------------------
  useEffect(() => {
    if (["/", "/login"].includes(location.pathname)) {
      document.body.classList.add("overflow-hidden");
      document.body.classList.remove("overflow-auto");
    } else {
      document.body.classList.add("overflow-auto");
      document.body.classList.remove("overflow-hidden");
    }
  }, [location]);

  // ------------------ CHECK LOGIN ON LOAD ------------------
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await axios.get("http://localhost:5000/api/me", {
          withCredentials: true,
        });
        setCurrentUser(response.data.user);

        // redirect to dashboard if already logged in
        if (["/", "/login"].includes(location.pathname)) {
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.log("No logged in user");
        setCurrentUser(null);
      }
    }

    fetchCurrentUser();
  }, []);

  // ------------------ AUTH FUNCTIONS ------------------
  async function signUp(formData) {
    try {
      await axios.post("http://localhost:5000/api/signup", formData);
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data || err);
      throw err;
    }
  }

  async function login(formData) {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/login",
        formData,
        { withCredentials: true }
      );

      setCurrentUser(response.data.user);
      navigate("/dashboard");
    } catch (err) {
      throw err;
    }
  }

  async function logout() {
    try {
      await axios.post("http://localhost:5000/api/logout", {}, { withCredentials: true });
      setCurrentUser(null);
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data || err);
    }
  }

  // ------------------ EXPENSE FUNCTIONS ------------------
  async function fetchExpenses(userId) {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/expenses/${userId}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (err) {
      console.error(err.response?.data || err);
      return [];
    }
  }

  async function addExpense(expenseData) {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/expenses",
        expenseData,
        { withCredentials: true }
      );
      return response.data;
    } catch (err) {
      console.error(err.response?.data || err);
      return null;
    }
  }

  async function editExpense(expenseId, updatedData) {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/expenses/${expenseId}`,
        updatedData,
        { withCredentials: true }
      );
      return response.data.expense;
    } catch (err) {
      console.error(err.response?.data || err);
      return null;
    }
  }

  async function deleteExpense(expenseId) {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/expenses/${expenseId}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (err) {
      console.error(err.response?.data || err);
      return null;
    }
  }

  async function fetchAIInsights(expenses) {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/ai/insights",
        { expenses },
        { withCredentials: true }
      );
      return response.data.insights;
    } catch (err) {
      console.error(err.response?.data || err);
      return [];
    }
  }

  async function loadAIInsights() {
    if (!currentUser?._id) return [];

    const expenses = await fetchExpenses(currentUser._id);
    if (!expenses || !expenses.length) return [];

    const insights = await fetchAIInsights(expenses);
    return insights;
  }


  async function logout() {
    try {
      await axios.post("http://localhost:5000/api/logout", {}, { withCredentials: true });
      setCurrentUser(null);
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data || err);
    }
  }

  return (
    <Routes>
      <Route path="/" element={<SignUp signUp={signUp} />} />
      <Route path="/login" element={<Login login={login} />} />
      <Route
        path="/dashboard"
        element={
          currentUser ? (
            <Dashboard
              userId={currentUser._id}
              fetchExpenses={fetchExpenses}
              addExpense={addExpense}
              editExpense={editExpense}
              deleteExpense={deleteExpense}
              loadAIInsights={loadAIInsights}
              logout={logout}
              currentUser={currentUser}
            />
          ) : (
            <Login login={login} />
          )
        }
      />
    </Routes>
  );
}

export default App;
