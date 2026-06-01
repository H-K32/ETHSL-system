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

// Extract the first meaningful error string from a DRF error response
function extractError(data, fallback = "Something went wrong.") {
  if (!data) return fallback;
  // field-level errors
  for (const key of ["username", "email", "full_name", "detail", "non_field_errors"]) {
    if (data[key]) {
      const val = data[key];
      return Array.isArray(val) ? val[0] : val;
    }
  }
  // any other field
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    return Array.isArray(val) ? val[0] : String(val);
  }
  return fallback;
}

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const originalForm = useRef({ username: "", email: "", full_name: "" });

  const [form, setForm] = useState({ username: "", email: "", full_name: "" });
  const [fieldErrors, setFieldErrors] = useState({ username: "", email: "", full_name: "" });

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
      email: res.data.email || "",
      full_name: res.data.full_name || "",
    };
    setForm(loaded);
    originalForm.current = loaded;
  };

  useEffect(() => { fetchProfile(); }, []);

  // ---- Field-level frontend validation ----
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
    if (name === "email") {
      if (!v) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Invalid email format.";
    }
    return "";
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    setProfileMsg({ type: "", text: "" });
  };

  // ---- Profile submit ----
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });

    // Validate all fields
    const errors = {
      username: validateField("username", form.username),
      email:    validateField("email",    form.email),
      full_name: validateField("full_name", form.full_name),
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    // No changes detection
    const orig = originalForm.current;
    if (
      form.username.trim() === orig.username &&
      form.email.trim()    === orig.email &&
      form.full_name.trim() === orig.full_name
    ) {
      setProfileMsg({ type: "info", text: "No changes detected." });
      return;
    }

    try {
      await API.put("/users/admin/profile/", {
        username:  form.username.trim(),
        email:     form.email.trim(),
        full_name: form.full_name.trim(),
      });
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
      fetchProfile();
    } catch (err) {
      const data = err.response?.data;
      // Map field-level backend errors back to field errors
      const backendFieldErrors = { username: "", email: "", full_name: "" };
      let hasFieldError = false;
      for (const key of ["username", "email", "full_name"]) {
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

  // ---- Password submit ----
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
      setPasswordMsg({ type: "success", text: "Password changed successfully!" });
      setPasswords({ current_password: "", new_password: "", confirm: "" });
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

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleFormChange}
                className={fieldErrors.email ? "input-error" : ""}
              />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>

            {profileMsg.text && (
              <div className={`profile-inline-msg ${profileMsg.type}`}>{profileMsg.text}</div>
            )}

            <button type="submit" className="btn-save" disabled={!profileFormValid}>
              Save Changes
            </button>
          </form>

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
