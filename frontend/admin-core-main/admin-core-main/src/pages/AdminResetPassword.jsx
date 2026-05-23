import { useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axiosConfig";

function AdminResetPassword() {

  const { uidb64, token } =
    useParams();

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const submit = async (e) => {

    e.preventDefault();

    try {

      await API.post(

        `/users/admin/password-reset-confirm/${uidb64}/${token}/`,

        {
          password
        }

      );

      setMessage(
        "Password changed."
      );

    } catch {

      setMessage(
        "Invalid or expired link."
      );

    }

  };

  return (

    <div>

      <h2>
        New Password
      </h2>

      <form onSubmit={submit}>

        <input
          type="password"
          value={password}
          placeholder="New password"
          onChange={(e)=>
            setPassword(e.target.value)
          }
        />

        <button>
          Update Password
        </button>

      </form>

      {message}

    </div>

  );

}

export default AdminResetPassword;