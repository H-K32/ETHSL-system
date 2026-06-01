import { useEffect, useState } from "react";
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

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
  });

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
    setForm({
      username: res.data.username,
      email: res.data.email,
      full_name: res.data.full_name || "",
    });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ---------------- UPDATE PROFILE ----------------
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });
    try {
      await API.put("/users/admin/profile/", form);
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
      fetchProfile();
    } catch (err) {
      const d = err.response?.data;
      setProfileMsg({ type: "error", text: d?.detail || "Failed to update profile." });
    }
  };

  // ---------------- CHANGE PASSWORD ----------------
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: "", text: "" });

    const { current_password, new_password, confirm } = passwords;

    if (!current_password || !new_password || !confirm) {
      setPasswordMsg({ type: "error", text: "All password fields are required." });
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
      await API.post("/users/change-password/", {
        current_password,
        new_password,
      });
      setPasswordMsg({ type: "success", text: "Password changed successfully!" });
      setPasswords({ current_password: "", new_password: "", confirm: "" });
    } catch (err) {
      const d = err.response?.data;
      setPasswordMsg({ type: "error", text: d?.detail || "Failed to change password." });
    }
  };

  if (!profile) return <div>Loading...</div>;

  const pwChecks = validatePassword(passwords.new_password);
  const pwValid = isPasswordValid(pwChecks);
  const pwMatch = passwords.new_password === passwords.confirm;

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

          <div className="profile-detail">
            <span>Username</span>
            {profile.username}
          </div>

          <div className="profile-detail">
            <span>Email</span>
            {profile.email}
          </div>

          <div className="profile-detail">
            <span>Role</span>
            Admin
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div>
          {/* PROFILE FORM */}
          <form className="profile-form-card" onSubmit={handleProfileUpdate}>
            <h3>Edit Profile</h3>

            <div className="form-group">
              <label>Username</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {profileMsg.text && (
              <div className={`profile-inline-msg ${profileMsg.type}`}>
                {profileMsg.text}
              </div>
            )}

            <button type="submit" className="btn-save">
              Save Changes
            </button>
          </form>

          <hr className="section-divider" />

          {/* PASSWORD FORM */}
          <form className="profile-form-card" onSubmit={handlePasswordChange}>
            <h3>Change Password</h3>

            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwords.current_password}
                onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
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

            {/* Live password requirements */}
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
              <div className={`profile-inline-msg ${passwordMsg.type}`}>
                {passwordMsg.text}
              </div>
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
