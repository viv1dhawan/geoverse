"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesomeIcon
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"; // Import specific icons

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // State for editable fields
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const token = localStorage.getItem("access_token");

  // Effect to fetch user profile on component mount or token change
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://127.0.0.1:8000/users/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await response.json();
        setUser(data);
        // Pre-fill form fields with fetched data, ensuring they are always strings
        setFirstName(data.first_name ?? ""); // Use nullish coalescing to default to empty string
        setLastName(data.last_name ?? "");   // Use nullish coalescing to default to empty string
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserProfile();
    } else {
      setError("No access token found. Please sign in.");
      setLoading(false);
    }
  }, [token]);

  // Function to handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setIsUpdating(true);
    setError(null);
    setUpdateSuccess(null);

    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsUpdating(false);
      return;
    }

    const updatePayload: { first_name?: string; last_name?: string; password?: string } = {};
    if (firstName !== user?.first_name) {
      updatePayload.first_name = firstName;
    }
    if (lastName !== user?.last_name) {
      updatePayload.last_name = lastName;
    }
    if (password) { // Only send password if it's not empty
      updatePayload.password = password;
    }

    // If no changes were made, don't send the request
    if (Object.keys(updatePayload).length === 0) {
      setUpdateSuccess("No changes to update.");
      setIsUpdating(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update profile.");
      }

      const updatedUserData = await response.json();
      setUser(updatedUserData); // Update local user state with new data
      setFirstName(updatedUserData.first_name ?? ""); // Ensure string after update
      setLastName(updatedUserData.last_name ?? "");   // Ensure string after update
      setPassword(""); // Clear password fields on success
      setConfirmPassword("");
      setUpdateSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px] font-sans">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center">
          <div className="w-full px-4 max-w-2xl"> {/* Increased max-width for better form layout */}
            <div className="shadow-xl rounded-xl bg-white dark:bg-gray-800 p-8 sm:p-10 border border-gray-200 dark:border-gray-700">
              <h3 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
                User Profile
              </h3>

              {loading && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">Loading profile data...</div>
              )}

              {error && (
                <div className="text-center text-red-500 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-3 mb-4">
                  {error}
                </div>
              )}

              {updateSuccess && (
                <div className="text-center text-green-700 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md p-3 mb-4">
                  {updateSuccess}
                </div>
              )}

              {!loading && !error && !user && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">No user data available.</div>
              )}

              {!loading && !error && user && (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Display fields */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      User ID:
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {user.id}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email:
                    </label>
                    <p className="text-lg text-gray-800 dark:text-gray-200">
                      {user.email}
                    </p>
                  </div>

                  {/* Editable fields */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name:
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2 px-4 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name:
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2 px-4 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password:
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2 px-4 pr-10 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Leave blank to keep current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                      >
                        {showPassword ? (
                          <FontAwesomeIcon icon={faEyeSlash} className="h-5 w-5" />
                        ) : (
                          <FontAwesomeIcon icon={faEye} className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password:
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2 px-4 pr-10 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Re-enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                      >
                        {showPassword ? (
                          <FontAwesomeIcon icon={faEyeSlash} className="h-5 w-5" />
                        ) : (
                          <FontAwesomeIcon icon={faEye} className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : (
                        "Update Profile"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
