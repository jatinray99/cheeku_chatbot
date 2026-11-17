
import React, { useState } from "react";
import "./Login.css";

const API = "http://localhost:5000";

function Login() {
    const [page, setPage] = useState(
        new URLSearchParams(window.location.search).has("token")
            ? "reset"
            : "login"
    );

    const [loginId, setLoginId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");

    const callAPI = async (endpoint, data) => {
        try {
            const response = await fetch(`${API}/${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Something went wrong");
            }

            return result;

        } catch (error) {
            throw error;
        }
    };

    // LOGIN
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const result = await callAPI("login", {
                login_id: loginId,
                password: password
            });

            localStorage.setItem("token", result.token);

            setMessage("Login successful!");

            // Redirect to chatbot after login
            window.location.href = "/home";

        } catch (error) {
            setMessage(error.message);
        }
    };

    // REGISTER
    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const result = await callAPI("register", {
                login_id: loginId,
                email: email,
                password: password
            });

            setMessage(result.message);

            setLoginId("");
            setEmail("");
            setPassword("");

            setPage("login");

        } catch (error) {
            setMessage(error.message);
        }
    };

    // FORGOT PASSWORD
    const handleForgot = async (e) => {
        e.preventDefault();

        try {
            const result = await callAPI("forgot-password", {
                login_id: loginId
            });

            setMessage(result.message);

        } catch (error) {
            setMessage(error.message);
        }
    };

    // RESET PASSWORD
    const handleReset = async (e) => {
        e.preventDefault();

        const token = new URLSearchParams(
            window.location.search
        ).get("token");

        try {
            const result = await callAPI("reset-password", {
                token: token,
                new_password: newPassword
            });

            setMessage(result.message);
            setNewPassword("");

            window.history.replaceState(
                {},
                "",
                window.location.pathname
            );

            setPage("login");

        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div className="login-container">

            <div className="login-box">

                <h2>
                    {page === "login" && "Welcome Back"}
                    {page === "register" && "Create Account"}
                    {page === "forgot" && "Forgot Password"}
                    {page === "reset" && "Reset Password"}
                </h2>

                <p className="subtitle">
                    {page === "login" && "Login to continue"}
                    {page === "register" && "Register as a new user"}
                    {page === "forgot" && "Enter your Login ID"}
                    {page === "reset" && "Enter your new password"}
                </p>

                {message && (
                    <p className="message">{message}</p>
                )}

                {/* LOGIN FORM */}

                {page === "login" && (
                    <form onSubmit={handleLogin}>

                        <input
                            type="text"
                            placeholder="Login ID"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            required
                        />

                        <div className="password-field">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                title="Show or hide password"
                            >
                                {showPassword ? "🙈" : "👁"}
                            </span>
                        </div>

                        <div className="forgot-link">
                            <span onClick={() => {
                                setMessage("");
                                setPage("forgot");
                            }}>
                                Forgot Password?
                            </span>
                        </div>

                        <button type="submit">Login</button>

                        <p>
                            New user?
                            <span onClick={() => {
                                setMessage("");
                                setPage("register");
                            }}>
                                {" "}Register Here
                            </span>
                        </p>

                    </form>
                )}

                {/* REGISTER FORM */}

                {page === "register" && (
                    <form onSubmit={handleRegister}>

                        <input
                            type="text"
                            placeholder="Create Login ID"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            required
                        />

                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Create Password (8 characters minimum)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                            required
                        />

                        <button type="submit">Register</button>

                        <p>
                            Already registered?
                            <span onClick={() => {
                                setMessage("");
                                setPage("login");
                            }}>
                                {" "}Login Here
                            </span>
                        </p>

                    </form>
                )}

                {/* FORGOT PASSWORD FORM */}

                {page === "forgot" && (
                    <form onSubmit={handleForgot}>

                        <input
                            type="text"
                            placeholder="Enter your Login ID"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            required
                        />

                        <button type="submit">
                            Send Reset Link
                        </button>

                        <p>
                            <span onClick={() => {
                                setMessage("");
                                setPage("login");
                            }}>
                                Back to Login
                            </span>
                        </p>

                    </form>
                )}

                {/* RESET PASSWORD FORM */}

                {page === "reset" && (
                    <form onSubmit={handleReset}>

                        <input
                            type="password"
                            placeholder="Enter New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            minLength={8}
                            required
                        />

                        <button type="submit">
                            Update Password
                        </button>

                        <p>
                            <span onClick={() => setPage("login")}>
                                Back to Login
                            </span>
                        </p>

                    </form>
                )}

            </div>
        </div>
    );
}

export default Login;
