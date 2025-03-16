import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Menu</h2>
      <ul>
        <li className="mb-2">
          <Link to="/dashboard" className="block p-2 hover:bg-gray-700">Dashboard</Link>
        </li>
        <li>
          <Link to="/users" className="block p-2 hover:bg-gray-700">Users Management</Link>
        </li>
        <li>
          <Link to="/chat" className="block p-2 hover:bg-gray-700">Chat Management</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
