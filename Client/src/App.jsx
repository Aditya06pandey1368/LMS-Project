import { createBrowserRouter } from 'react-router-dom'
import './App.css'
import { Button } from './components/ui/button'
import Login from './Pages/Login'
import Navbar from './Pages/Navbar'
import MyLearning from './Pages/Student/MyLearning'
import MainLayout from './layout/MainLayout'
import { RouterProvider } from 'react-router'
import StudentProfile from './Pages/Student/StudentProfile'
import { Toaster } from 'sonner'
import AdminSidebar from './Pages/Admin/AdminSidebar'
import CourseTable from './Pages/Admin/course/CourseTable'
import AddCourse from './Pages/Admin/course/AddCourse'
import Dashboard from './Pages/Admin/Dashboard'
import EditCourse from './Pages/Admin/course/EditCourse'
import CreateLecture from './Pages/Admin/lecture/CreateLecture'
import EditLecture from './Pages/Admin/lecture/EditLecture'
import CourseDetail from './Pages/Student/CourseDetail'
import HomePage from './Pages/Student/HomePage'
import CourseProgress from './Pages/Student/CourseProgress'


const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <HomePage/>
      },
      {
        path: "login",
        element: <Login />
      },
      {
        path: "my-learning",
        element: <MyLearning />
      },
      {
        path: "profile",
        element: <StudentProfile />
      },
      {
        path: "course-detail/:courseId",
        element: <CourseDetail />
      },
      {
        path: "/course-progress/:courseId",
        element: <CourseProgress/>
      },
      {
        path: "admin",
        element: <AdminSidebar />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />
          },
          {
            path: "course",
            element: <CourseTable />
          },
          {
            path: "course/create",
            element: <AddCourse />
          },
          {
            path: "course/:courseId",
            element: <EditCourse />
          },
          {
            path: "course/:courseId/lecture",
            element: <CreateLecture />
          },
          {
            path: "course/:courseId/lecture/:lectureId",
            element: <EditLecture/>
          }

        ]
      }
    ]
  }
])

function App() {
  return (
    <main>
      <Toaster position="bottom-right" />
      <RouterProvider router={appRouter} />
    </main>
  )
}

export default App
