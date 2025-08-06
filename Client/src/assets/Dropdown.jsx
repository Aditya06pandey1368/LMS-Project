import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogoutUserMutation } from "@/Features/api/authApi";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { userLoggedOut } from "@/Features/authSlice"; // ✅ import the logout action

export function Dropdown() {
  const { user, isAuthenticated } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutUser, { isSuccess }] = useLogoutUserMutation();

  const logoutHandler = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(userLoggedOut()); // ✅ clear state
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 rounded-full cursor-pointer">
          <AvatarImage
            className="h-8 w-8 rounded-full"
            src={user?.photoUrl || "https://github.com/shadcn.png"}
          />
          <AvatarFallback className="text-xs">CN</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          {isAuthenticated && (
            <>
              <DropdownMenuItem>
                <Link to="/my-learning">My Learning</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/profile">Edit Profile</Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {isAuthenticated ? (
          <DropdownMenuItem onClick={logoutHandler}>Log Out</DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => navigate("/login")}>Log In</DropdownMenuItem>
        )}

        <DropdownMenuItem>
          <Link to="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
