"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    reenter_password: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const router = useRouter();

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/users/signup", { // Replace with your FastAPI URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Account Created Successfully, Check Your Email !");
        setTimeout(() => {
          router.push("/");
        }, 3000); // Redirect after 2 seconds
      } else {
        setError(data.detail || "Signup failed. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };


  return (

    <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px]">
      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold px-8 py-5 rounded-2xl shadow-2xl w-[320px] text-center animate-fade-in">
            <p className="mb-2">{success}</p>
            <button
              onClick={() => setSuccess(null)}
              className="absolute top-3 right-3 text-white hover:text-gray-200 transition duration-200 text-xl"
            >
              ✖
            </button>
            <div className="mt-3">
            <button
              onClick={() => router.push("/")} // Redirect immediately
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition duration-300"
            >
              OK
            </button>
          </div>
          </div>
        </div>
      )}

      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="shadow-three mx-auto max-w-[500px] rounded bg-white px-6 py-10 dark:bg-dark sm:p-[60px]">
              <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                Create your account
              </h3>
              <p className="mb-11 text-center text-base font-medium text-body-color">
                It’s totally free and super easy
              </p>

              {error && <p className="text-red-500 text-center">{error}</p>}
              {success && <p className="text-green-500 text-center">{success}</p>}

              <form onSubmit={handleSubmit}>
                <div className="mb-8 flex space-x-4">
                  <div className="w-1/2">
                    <label className="mb-3 block text-sm text-dark dark:text-white">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      required
                      className="w-full rounded-sm bg-[#f8f8f8] px-6 py-3 text-base outline-none dark:bg-[#2C303B]"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="mb-3 block text-sm text-dark dark:text-white">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                      required
                      className="w-full rounded-sm bg-[#f8f8f8] px-6 py-3 text-base outline-none dark:bg-[#2C303B]"
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <label className="mb-3 block text-sm text-dark dark:text-white">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your Email"
                    required
                    className="w-full rounded-sm bg-[#f8f8f8] px-6 py-3 text-base outline-none dark:bg-[#2C303B]"
                  />
                </div>

                <div className="mb-8 relative">
                  <label className="mb-3 block text-sm text-dark dark:text-white">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your Password"
                      required
                      className="w-full rounded-sm bg-[#f8f8f8] px-6 py-3 pr-10 text-base outline-none dark:bg-[#2C303B]"
                    />
                    <FontAwesomeIcon
                      icon={passwordVisible ? faEyeSlash : faEye}
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    />
                  </div>
                </div>

                <div className="mb-8 relative">
                  <label className="mb-3 block text-sm text-dark dark:text-white">
                    Re-Enter Password
                  </label>
                  <div className="relative">
                    <input
                      type={confirmPasswordVisible ? "text" : "password"}
                      name="reenter_password"
                      value={formData.reenter_password}
                      onChange={handleChange}
                      placeholder="Enter your Password Again"
                      required
                      className="w-full rounded-sm bg-[#f8f8f8] px-6 py-3 pr-10 text-base outline-none dark:bg-[#2C303B]"
                    />
                    <FontAwesomeIcon
                      icon={confirmPasswordVisible ? faEyeSlash : faEye}
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                      onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    />
                  </div>
                </div>

                <div className="mb-8 flex">
                  <input type="checkbox" id="terms" className="mr-2" required />
                  <label htmlFor="terms" className="text-sm">
                    By creating an account, you agree to the
                    <a href="#0" className="text-primary hover:underline"> Terms and Conditions </a>
                    and our
                    <a href="#0" className="text-primary hover:underline"> Privacy Policy </a>
                  </label>
                </div>

                <div className="mb-6">
                  <button
                    type="submit"
                    className="w-full rounded-sm bg-primary px-9 py-4 text-base font-medium text-white hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? "Signing up..." : "Sign up"}
                  </button>
                </div>
              </form>

              <p className="text-center text-base font-medium text-body-color">
                Already have an account?{" "}
                <Link href="/signin" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignupPage;
