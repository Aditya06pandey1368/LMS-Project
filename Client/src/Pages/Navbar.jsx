import { Dropdown } from '@/assets/Dropdown';
import { Button } from '@/components/ui/button';
import {
  School,
  Menu,
} from 'lucide-react';
import React, { useEffect } from 'react';
import DarkMode from './DarkMode';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useLogoutUserMutation } from '@/Features/api/authApi';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || "";
  const [logoutUser, { isSuccess, data }] = useLogoutUserMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
    } catch (err) {
      toast.error("Failed to log out.");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Logged out");
      navigate("/login?type=login");
    }
  }, [isSuccess]);

  return (
    // 👇 The classes on this line have been changed
    <div className='h-16 dark:bg-[#0A0A0A] bg-white border-b-2 dark:border-gray-800 border-gray-200 fixed top-0 left-0 right-0 duration-300 z-50'>
      <div className='max-w-7xl mx-auto flex justify-between items-center h-full px-4'>
        {/* Logo and title */}
        <div className='flex items-center gap-2'>
          <School size={26} />
          <Link to="/"><h1 className='text-xl font-bold'>E-Learning</h1></Link>
        </div>

        {/* Desktop navigation */}
        <div className='hidden md:flex items-center gap-4'>
          {user ? (
            <Dropdown />
          ) : (
            <div className='flex gap-2'>
              <Button variant='outline' onClick={() => navigate("/login?type=signup")}>Signup</Button>
              <Button onClick={() => navigate("/login?type=login")}>Login</Button>
            </div>
          )}
          <DarkMode />
        </div>

        {/* Mobile menu */}
        <div className='md:hidden'>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[260px] sm:w-[300px]">
              <div className='mt-4 flex flex-col gap-4 justify-center'>
                <div className='flex justify-between m-10'>
                  <SheetTitle className='text-2xl'>E-Learning</SheetTitle>
                  <DarkMode />
                </div>
                <nav className='flex flex-col space-y-4 text-xl ml-4'>
                  {user ? (
                    <>
                      <span className='cursor-pointer' onClick={() => navigate("/my-learning")}>My Learning</span>
                      <span className='cursor-pointer' onClick={() => navigate("/profile")}>Edit Profile</span>
                      <span className='cursor-pointer text-red-600' onClick={handleLogout}>Log out</span>
                    </>
                  ) : (
                    <>
                      <span className='cursor-pointer' onClick={() => navigate("/login?type=login")}>Login</span>
                      <span className='cursor-pointer' onClick={() => navigate("/login?type=signup")}>Signup</span>
                    </>
                  )}
                </nav>
                {role === "instructor" && (
                  <Link to="/admin/dashboard">
                  <Button className="m-10">DashBoard</Button>
                  </Link>
                )}
              </div>
            </SheetContent>
            <SheetDescription className='ml-4 text-sm text-muted-foreground'>
            </SheetDescription>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default Navbar;