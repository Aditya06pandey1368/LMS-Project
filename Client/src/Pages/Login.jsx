import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { useLoginUserMutation, useRegisterUserMutation } from "@/Features/api/authApi";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export function Login() {
    const [SignUp, setSignUp] = useState({ name: "", email: "", password: "" });
    const [Login, setLogin] = useState({ email: "", password: "" });
    const [tabValue, setTabValue] = useState("SignUp");

    const [searchParams] = useSearchParams();
    useEffect(() => {
        const type = searchParams.get("type");
        if (type === "login") setTabValue("Login");
        else setTabValue("SignUp");
    }, [searchParams]);

    const [registerUser, { error: registerError, isLoading: registerIsLoading }] = useRegisterUserMutation();
    const [loginUser, { error: loginError, isLoading: loginIsLoading }] = useLoginUserMutation();

    const changeInputHandler = (e, type) => {
        const { name, value } = e.target;
        if (type === "SignUp") setSignUp({ ...SignUp, [name]: value });
        else setLogin({ ...Login, [name]: value });
    };

    const navigate = useNavigate();

    const isValidEmail = (email) => {
        const pattern = /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|mil|in)$/i;
        return pattern.test(email);
    };

    const isValidPassword = (password) => {
        if (password.includes(" ")) {
            toast.error("Password should not contain spaces.");
            return false;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return false;
        }
        return true;
    };

    const handleRegistration = async (type) => {
        const inputData = type === "SignUp" ? SignUp : Login;
        const action = type === "SignUp" ? registerUser : loginUser;

        if (!isValidEmail(inputData.email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        if (!isValidPassword(inputData.password)) return;

        try {
            const res = await action(inputData).unwrap();

            if (type === "SignUp") {
                setSignUp({ name: "", email: "", password: "" });
                const loginRes = await loginUser({ email: inputData.email, password: inputData.password }).unwrap();
                toast.success(loginRes.message || "Logged in successfully.");
                navigate("/");
            } else {
                toast.success(res.message || "Login successful.");
                navigate("/");
            }
        } catch (err) {
            const errorMsg = err?.data?.message || `${type} failed`;
            toast.error(errorMsg);
        }
    };

    return (
        <div className="flex align-center justify-center w-full mt-22">
            <Tabs value={tabValue} onValueChange={setTabValue} className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="SignUp">SignUp</TabsTrigger>
                    <TabsTrigger value="Login">Login</TabsTrigger>
                </TabsList>

                <TabsContent value="SignUp">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sign Up</CardTitle>
                            <CardDescription>Create a new account and click Sign Up when you are done.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" type="text" name="name" value={SignUp.name} onChange={(e) => changeInputHandler(e, "SignUp")} placeholder="Enter name" required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" name="email" value={SignUp.email} onChange={(e) => changeInputHandler(e, "SignUp")} placeholder="xyz@gmail.com" required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" name="password" value={SignUp.password} onChange={(e) => changeInputHandler(e, "SignUp")} placeholder="Password" required />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button disabled={registerIsLoading} onClick={() => handleRegistration("SignUp")}>{
                                registerIsLoading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</>
                                ) : "SignUp"
                            }</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="Login">
                    <Card>
                        <CardHeader>
                            <CardTitle>Login</CardTitle>
                            <CardDescription>Login with your credentials.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" name="email" value={Login.email} onChange={(e) => changeInputHandler(e, "Login")} placeholder="email" required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" name="password" value={Login.password} onChange={(e) => changeInputHandler(e, "Login")} placeholder="Password" required />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button disabled={loginIsLoading} onClick={() => handleRegistration("Login")}>{
                                loginIsLoading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</>
                                ) : "Login"
                            }</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default Login;
