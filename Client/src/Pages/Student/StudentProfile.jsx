import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import CourseCard from "./CourseCard";
import {
  useLogoutUserMutation,
  useUpdateUserMutation,
} from "@/Features/api/authApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { userLoggedOut } from "@/Features/authSlice";

const StudentProfile = ({ enrolledCourses = [] }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    user?.photoUrl || "https://github.com/shadcn.png"
  );
  const [originalAvatar, setOriginalAvatar] = useState(
    user?.photoUrl || "https://github.com/shadcn.png"
  );
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userData, setUserData] = useState(user || null);
  const [updateUser] = useUpdateUserMutation();
  const [logoutUser, { isSuccess }] = useLogoutUserMutation();

  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (user) {
      setUserData(user);
      setAvatarPreview(user.photoUrl || "https://github.com/shadcn.png");
      setOriginalAvatar(user.photoUrl || "https://github.com/shadcn.png");
    } else {
      setUserData(null);
      setAvatarPreview("https://github.com/shadcn.png");
      setOriginalAvatar("https://github.com/shadcn.png");
    }
  }, [user]);

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const updateUserHandler = async () => {
    if (!editName.trim() && !editAvatar) {
      toast.warning("Please update name or upload a profile photo.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      if (editName.trim()) formData.append("name", editName.trim());
      if (editAvatar) formData.append("profilePhoto", editAvatar);

      await updateUser(formData).unwrap();
      toast.success("Profile updated successfully!");
      setDialogOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDialogOpen = () => {
    if (userData) {
      setEditName(userData.name || "");
      setEditAvatar(null);
      const current = userData.photoUrl || "https://github.com/shadcn.png";
      setOriginalAvatar(current);
      setAvatarPreview(current);
      setDialogOpen(true);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await logoutUser().unwrap();
      toast.success(res.message || "Logged out successfully!");
      dispatch(userLoggedOut());
      setUserData(null);
      setAvatarPreview("https://github.com/shadcn.png");
      navigate("/login");
      setLogoutDialog(false);
    } catch (error) {
      toast.error("Failed to log out.");
    } finally {
      setLoggingOut(false);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <section className="px-10 sm:px-10 py-7 min-h-screen bg-white dark:bg-gray-900 transition-all">
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10"
      >
        <div className="flex items-center gap-4 mt-20">
          <Avatar className="w-20 h-20 ring-4 ring-indigo-500 dark:ring-indigo-400">
            <AvatarImage src={avatarPreview} />
            <AvatarFallback>{userData?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {userData.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{userData.email}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {user && (
            <Dialog open={dialogOpen} onOpenChange={(isOpen) => {
              if (!isOpen) {
                setAvatarPreview(originalAvatar);
                setEditAvatar(null);
                setEditName(userData?.name || "");
              }
              setDialogOpen(isOpen);
            }}>
              <DialogTrigger asChild>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={handleDialogOpen}
                >
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your name and/or profile picture.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile">Profile Photo</Label>
                    <Input
                      id="profile"
                      type="file"
                      accept="image/*"
                      onChange={onChangeHandler}
                    />
                    <Avatar className="w-16 h-16 mt-2">
                      <AvatarImage src={avatarPreview} />
                      <AvatarFallback>{editName?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={updateUserHandler}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={saving}
                  >
                    {saving ? "Saving Changes..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {user ? (
            <Dialog open={logoutDialog} onOpenChange={setLogoutDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-gray-300">
                  Log Out
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Are you sure you want to log out?</DialogTitle>
                  <DialogDescription>
                    You’ll be signed out of your account immediately.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-end gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setLogoutDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    {loggingOut ? "Logging Out..." : "Log Out"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Button
              variant="outline"
              className="bg-indigo-600 text-white"
              onClick={() => navigate("/login")}
            >
              Log In
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
          Enrolled Courses
        </h3>

        {enrolledCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-indigo-300 rounded-lg dark:border-indigo-500">
            <img
              src="https://cdni.iconscout.com/illustration/premium/thumb/no-data-9435782-7703885.png"
              alt="No courses"
              className="w-48 mb-6"
            />
            <p className="text-lg text-gray-500 dark:text-gray-300">
              You have not enrolled in any course yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {enrolledCourses.map((course, index) => (
              <CourseCard key={index} {...course} />
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default StudentProfile;
