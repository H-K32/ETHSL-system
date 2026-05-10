import { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import "../styles/profile.css";

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

  // ---------------- FETCH PROFILE ----------------
  const fetchProfile = async () => {
    const res = await API.get("/users/me/");
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

    await API.put("/users/me/", form);
    alert("Profile updated successfully!");
    fetchProfile();
  };

  // ---------------- CHANGE PASSWORD ----------------
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwords.new_password !== passwords.confirm) {
      alert("Passwords do not match!");
      return;
    }

    await API.post("/users/change-password/", {
      current_password: passwords.current_password,
      new_password: passwords.new_password,
    });

    alert("Password changed successfully!");

    setPasswords({
      current_password: "",
      new_password: "",
      confirm: "",
    });
  };

  if (!profile) return <div>Loading...</div>;

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
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>

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
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    current_password: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwords.new_password}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    new_password: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
              />
            </div>

            <button type="submit" className="btn-save">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminProfile;