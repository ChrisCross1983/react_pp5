import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password1: "",
    password2: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    if (formData.password1 !== formData.password2) {
      setErrors({ password2: "Passwörter stimmen nicht überein!" });
      return;
    }

    try {
      const response = await axios.post(
        "https://8000-chriscross1983-drfpp5-1kzqisvpqcg.ws.codeinstitute-ide.net/api/profiles/register/",
        {
          username: formData.username,
          email: formData.email,
          password: formData.password1,
        }
      );

      if (response.status === 201) {
        setSuccessMessage("Registrierung erfolgreich! Du wirst weitergeleitet...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: "Etwas ist schiefgelaufen. Bitte versuche es erneut." });
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Registrieren</h2>
        {successMessage && <p className="text-green-600 text-center">{successMessage}</p>}
        {errors.general && <p className="text-red-600 text-center">{errors.general}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="mb-1">Benutzername:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="p-2 border border-gray-300 rounded mb-3"
          />
          {errors.username && <p className="text-red-600">{errors.username}</p>}

          <label className="mb-1">E-Mail:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="p-2 border border-gray-300 rounded mb-3"
          />
          {errors.email && <p className="text-red-600">{errors.email}</p>}

          <label className="mb-1">Passwort:</label>
          <input
            type="password"
            name="password1"
            value={formData.password1}
            onChange={handleChange}
            required
            className="p-2 border border-gray-300 rounded mb-3"
          />
          {errors.password1 && <p className="text-red-600">{errors.password1}</p>}

          <label className="mb-1">Passwort bestätigen:</label>
          <input
            type="password"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
            required
            className="p-2 border border-gray-300 rounded mb-3"
          />
          {errors.password2 && <p className="text-red-600">{errors.password2}</p>}

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Registrieren
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
