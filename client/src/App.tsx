import { Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginGuard from "./routes/LoginGuard";
import Home from "./pages/home/Home";
import Register from "./pages/auth/Register";
import Layout from "./components/layout";
import CourseDetails from "./pages/course/Course";
import Lesson from "./pages/lesson/Lesson";


function App() {


  return (
    <div className="bg-gray-900 dark">

      <Routes>
        <Route element={<ProtectedRoute />} >
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/course/:id" element={<CourseDetails />} />
            <Route path="/course/:courseId/module/:modNum/lesson/:lessonNum" element={<Lesson />} />
          </Route>
        </Route>
        <Route
          path="/login"
          element={
            <LoginGuard>
              <Login />
            </LoginGuard>
          }
        />
        <Route
          path="/register"
          element={
            <LoginGuard>
              <Register />
            </LoginGuard>
          }
        />
      </Routes>
    </div >
  );
}

export default App;
