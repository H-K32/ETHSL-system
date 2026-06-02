import { useEffect, useState, useRef } from "react";
import API from "../api/axiosConfig";
import "../styles/profile.css";

function validatePassword(password) {
  return {
    minLength: password.length >= 8,
    hasUpper:  /[A-Z]/.test(password),
    hasLower:  /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

function isPasswordValid(checks) {
  return Object.values(checks).every(Boolean);
}

function extractError(data, fallback = "Something went wrong.") {
  if (!data) return fallback;
  for (const key of ["username", "full_name", "detail", "non_field_errors"]) {
    if (data[key]) {
      const val = data[key];
      return Array.isArray(val) ? val[0] : val;
    }
  }
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    return Array.isArray(val) ? val[0] : String(val);
  }
  return fallback;
}

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const originalForm = useRef({ username: "", full_name: "" });

  const [form, setForm] = useState({ username: "", full_name: "" });
  const [fieldErrors, setFieldErrors] = useState({ username: "", full_name: "" });

  // Email change state
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeMsg, setEmailChangeMsg] = useState({ type: "", text: "" });
  const [emailChangePending, setEmailChangePending] = useState(false);
  const emailPollRef = useRef(null);

  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm: "",
  });

  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

  const fetchProfile = async () => {
    const res = await API.get("/users/admin/profile/");
    setProfile(res.data);
    const loaded = {
      username: res.data.username || "",
      full_name: res.data.full_name || "",
    };
    setForm(loaded);
    originalForm.current = loaded;
  };

  useEffect(() => { fetchProfile(); }, []);

  // Start polling once email change request is sent.
  // When the other device confirms, all tokens are blacklisted.
  // The next poll returns 401 → axiosConfig interceptor clears token
  // and redirects to /login automatically.
  useEffect(() => {
    if (!emailChangePending) return;

    emailPollRef.current = setInterval(async () => {
      try {
        await API.get("/users/admin/profile/");
      } catch {
        // 401 is caught by the axiosConfig interceptor which redirects to /login
        // Any other error we just keep polling
      }
    }, 3000);

    return () => clearInterval(emailPollRef.current);
  }, [emailChangePending]);

  const validateField = (name, value) => {
    const v = value.trim();
    if (name === "username") {
      if (!v) return "Username is required.";
      if (!/^[\w.\-]+$/.test(v)) return "Username can only contain letters, numbers, underscores, hyphens, and dots.";
    }
    if (name === "full_name") {
      if (!v) return "Full name is required.";
      if (/\d/.test(v)) return "Full name cannot contain numbers.";
      if (!/^[A-Za-z\s\-'.]+$/.test(v)) return "Full name can only contain letters, spaces, hyphens, and apostrophes.";
    }
    return "";
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    setProfileMsg({ type: "", text: "" });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });

    const errors = {
      username:  validateField("username",  form.username),
      full_name: validateField("full_name", form.full_name),
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    const orig = originalForm.current;
    if (
      form.username.trim()  === orig.username &&
      form.full_name.trim() === orig.full_name
    ) {
      setProfileMsg({ type: "info", text: "No changes detected." });
      return;
    }

    try {
      await API.put("/users/admin/profile/", {
        username:  form.username.trim(),
        full_name: form.full_name.trim(),
      });
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
      fetchProfile();
    } catch (err) {
      const data = err.response?.data;
      const backendFieldErrors = { username: "", full_name: "" };
      let hasFieldError = false;
      for (const key of ["username", "full_name"]) {
        if (data?.[key]) {
          backendFieldErrors[key] = Array.isArray(data[key]) ? data[key][0] : data[key];
          hasFieldError = true;
        }
      }
      if (hasFieldError) {
        setFieldErrors(backendFieldErrors);
      } else {
        setProfileMsg({ type: "error", text: extractError(data, "Failed to update profile.") });
      }
    }
  };

  const handleEmailChangeRequest = async (e) => {
    e.preventDefault();
    setEmailChangeMsg({ type: "", text: "" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail.trim()) {
      setEmailChangeMsg({ type: "error", text: "Please enter a new email address." });
      return;
    }
    if (!emailRegex.test(newEmail.trim())) {
      setEmailChangeMsg({ type: "error", text: "Invalid email format." });
      return;
    }

    setEmailChangeLoading(true);
    try {
      const res = await API.post("/users/email-change-request/", { new_email: newEmail.trim() });
      setEmailChangeMsg({
        type: "success",
        text: res.data?.detail || "Verification email sent. This page will redirect automatically once verified.",
      });
      setNewEmail("");
      setEmailChangePending(true);
    } catch (err) {
      const d = err.response?.data;
      setEmailChangeMsg({ type: "error", text: d?.detail || "Failed to send verification email." });
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: "", text: "" });

    const { current_password, new_password, confirm } = passwords;

    if (!current_password) {
      setPasswordMsg({ type: "error", text: "Current password is required." });
      return;
    }
    if (!new_password) {
      setPasswordMsg({ type: "error", text: "New password is required." });
      return;
    }
    if (!confirm) {
      setPasswordMsg({ type: "error", text: "Please confirm your new password." });
      return;
    }

    const checks = validatePassword(new_password);
    if (!isPasswordValid(checks)) {
      setPasswordMsg({ type: "error", text: "Password does not meet the requirements." });
      return;
    }

    if (new_password !== confirm) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    try {
      await API.post("/users/change-password/", { current_password, new_password });
      setPasswordMsg({ type: "success", text: "Password changed. Signing you out from all devices…" });
      setPasswords({ current_password: "", new_password: "", confirm: "" });
      setTimeout(() => {
        localStorage.removeItem("access");
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      const d = err.response?.data;
      setPasswordMsg({ type: "error", text: d?.detail || "Failed to change password." });
    }
  };

  if (!profile) return <div>Loading...</div>;

  const pwChecks = validatePassword(passwords.new_password);
  const pwValid  = isPasswordValid(pwChecks);
  const pwMatch  = passwords.new_password === passwords.confirm && passwords.confirm !== "";
  const profileFormValid = !Object.values(fieldErrors).some(Boolean);

  return (
    <>
      <div className="page-header">
        <h1>Admin Profile</h1>
        <p>View and update your account details</p>
      </div>

      <div className="profile-grid">
        {/* LEFT CARD */}
        <div className="profile-card">
          <div className="profile-avatar">
            {profile.username?.charAt(0).toUpperCase()}
          </div>
          <h2>{profile.full_name || profile.username}</h2>
          <span className="role-badge">Administrator</span>
          <div className="profile-detail"><span>Username</span>{profile.username}</div>
          <div className="profile-detail"><span>Email</span>{profile.email}</div>
          <div className="profile-detail"><span>Role</span>Admin</div>
        </div>

        {/* RIGHT SIDE */}
        <div>
          {/* PROFILE FORM */}
          <form className="profile-form-card" onSubmit={handleProfileUpdate} noValidate>
            <h3>Edit Profile</h3>

            <div className="form-group">
              <label>Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleFormChange}
                className={fieldErrors.username ? "input-error" : ""}
              />
              {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleFormChange}
                className={fieldErrors.full_name ? "input-error" : ""}
              />
              {fieldErrors.full_name && <span className="field-error">{fieldErrors.full_name}</span>}
            </div>

            {profileMsg.text && (
              <div className={`profile-inline-msg ${profileMsg.type}`}>{profileMsg.text}</div>
            )}

            <button type="submit" className="btn-save" disabled={!profileFormValid}>
              Save Changes
            </button>
          </form>

          <hr className="section-divider" />

          {/* EMAIL CHANGE SECTION */}
          <div className="profile-form-card">
            <h3>Change Email Address</h3>
            <p style={{ fontSize: "0.875rem", color: "#555", marginBottom: "0.75rem" }}>
              Current: <strong>{profile.email}</strong>
            </p>
            <p style={{ fontSize: "0.875rem", color: "#555", marginBottom: "1rem" }}>
              Enter a new email below. A verification link will be sent to the new address.
              Your current email remains active until verified.
            </p>
            <form onSubmit={handleEmailChangeRequest} noValidate>
              <div className="form-group">
                <label>New Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => { setNewEmail(e.target.value); setEmailChangeMsg({ type: "", text: "" }); }}
                  placeholder="Enter new email"
                  disabled={emailChangePending}
                />
              </div>
              {emailChangeMsg.text && (
                <div className={`profile-inline-msg ${emailChangeMsg.type}`}>
                  {emailChangeMsg.text}
                  {emailChangePending && (
                    <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", opacity: 0.7 }}>
                      Waiting for verification…
                    </span>
                  )}
                </div>
              )}
              <button
                type="submit"
                className="btn-save"
                disabled={emailChangeLoading || !newEmail.trim() || emailChangePending}
              >
                {emailChangeLoading ? "Sending…" : emailChangePending ? "Waiting for verification…" : "Send Verification Email"}
              </button>
            </form>
          </div>

          <hr className="section-divider" />

          {/* PASSWORD FORM */}
          <form className="profile-form-card" onSubmit={handlePasswordChange} noValidate>
            <h3>Change Password</h3>

            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwords.current_password}
                onChange={(e) => {
                  setPasswords({ ...passwords, current_password: e.target.value });
                  setPasswordMsg({ type: "", text: "" });
                }}
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwords.new_password}
                onChange={(e) => {
                  setPasswords({ ...passwords, new_password: e.target.value });
                  setPasswordMsg({ type: "", text: "" });
                }}
              />
            </div>

            {passwords.new_password && (
              <ul className="pw-checks">
                <li className={pwChecks.minLength ? "check-pass" : "check-fail"}>
                  {pwChecks.minLength ? "✔" : "✖"} At least 8 characters
                </li>
                <li className={pwChecks.hasUpper ? "check-pass" : "check-fail"}>
                  {pwChecks.hasUpper ? "✔" : "✖"} At least 1 uppercase letter
                </li>
                <li className={pwChecks.hasLower ? "check-pass" : "check-fail"}>
                  {pwChecks.hasLower ? "✔" : "✖"} At least 1 lowercase letter
                </li>
                <li className={pwChecks.hasNumber ? "check-pass" : "check-fail"}>
                  {pwChecks.hasNumber ? "✔" : "✖"} At least 1 number
                </li>
                <li className={pwChecks.hasSpecial ? "check-pass" : "check-fail"}>
                  {pwChecks.hasSpecial ? "✔" : "✖"} At least 1 special character
                </li>
              </ul>
            )}

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => {
                  setPasswords({ ...passwords, confirm: e.target.value });
                  setPasswordMsg({ type: "", text: "" });
                }}
              />
            </div>

            {passwordMsg.text && (
              <div className={`profile-inline-msg ${passwordMsg.type}`}>{passwordMsg.text}</div>
            )}

            <button
              type="submit"
              className="btn-save"
              disabled={!pwValid || !pwMatch || !passwords.current_password}
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminProfile;
