import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between">
        <Link to="/" className="text-xl font-bold">My App</Link>
        <div>
          <Link to="/login" className="mr-4">Login</Link>
          <Link to="/register" className="bg-blue-500 px-3 py-1 rounded">Registrieren</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
