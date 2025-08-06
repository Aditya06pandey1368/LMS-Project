import { Link, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChartBar, Library } from "lucide-react";

const AdminSidebar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen pt-15 w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-300 w-16 md:w-64 overflow-y-auto">
        <div className="h-full flex flex-col space-y-3 items-center md:items-start w-full">
          {/* Dashboard */}
          <Link to="/admin/dashboard" className="w-full group mt-15">
            <div className="flex items-center gap-2 px-4 py-2 rounded transition group-hover:bg-gray-200 dark:group-hover:bg-gray-800">
              <ChartBar size={22} />
              <span className="hidden md:inline">Dashboard</span>
            </div>
          </Link>

          {/* Courses */}
          <Link to="/admin/course" className="w-full group">
            <div className="flex items-center gap-2 px-4 py-2 rounded transition group-hover:bg-gray-200 dark:group-hover:bg-gray-800">
              <Library size={22} />
              <span className="hidden md:inline">Courses</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-white dark:bg-black transition-colors duration-300 min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminSidebar;
