import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { FaSearch, FaTimes, FaFilter, FaEdit, FaSave } from "react-icons/fa";

function Users() {
  const [users, setUsers] = useState([]);
  const [currentPage] = useState(1);
  const vouchersPerPage = 10; 
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedStatus, setEditedStatus] = useState({});
  const [searchParams, setSearchParams] = useState({
    displayName: "",
    phoneNumber: "",
    email: "",
    status: "",
  });  
  const [showFilter, setShowFilter] = useState(false);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "users"), orderBy("displayName", "asc"));
      const querySnapshot = await getDocs(q);
      
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * vouchersPerPage,
    currentPage * vouchersPerPage
  );

  const handleFilterChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };  

  const applyFilters = () => {
    let filtered = users.filter((user) => {
      return (
        (searchParams.displayName ? user.displayName?.toLowerCase().includes(searchParams.displayName.toLowerCase()) : true) &&
        (searchParams.email ? user.email?.toLowerCase().includes(searchParams.email.toLowerCase()) : true) &&
        (searchParams.phoneNumber ? String(user.phoneNumber || "").includes(searchParams.phoneNumber) : true) &&
        (searchParams.status ? user.status?.toLowerCase() === searchParams.status.toLowerCase() : true)
      );
    });

    setFilteredUsers(filtered);
  };

  const startEditing = (userId, currentStatus) => {
    setEditingUserId(userId);
    setEditedStatus({ ...editedStatus, [userId]: currentStatus });
  };

  const saveStatus = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { status: editedStatus[userId] });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: editedStatus[userId] } : user
        )
      );
      setFilteredUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: editedStatus[userId] } : user
        )
      );
      
      setEditingUserId(null);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <div className="w-full max-w-5xl">
        <div className="bg-white shadow-lg p-6 rounded-lg mb-6">
          {/* Bagian Header: Filter & Import/Export */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
            >
              <FaFilter /> {showFilter ? "Tutup Filter" : "Tampilkan Filter"}
            </button>
          </div>

          {/* Form Filter */}
          {showFilter && (
            <div className="mt-4 animate-slide-down">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">🎟️ Filter Users</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <input
                  type="text"
                  name="displayName"
                  placeholder="Name"
                  value={searchParams.displayName}
                  onChange={handleFilterChange}
                  className="border border-gray-300 px-4 py-2 rounded-lg focus:ring focus:ring-blue-300"
                />

                <input
                  type="text"
                  name="email"
                  placeholder="Email"
                  value={searchParams.email}
                  onChange={handleFilterChange}
                  className="border border-gray-300 px-4 py-2 rounded-lg focus:ring focus:ring-blue-300"
                />

                <select
                  name="status"
                  value={searchParams.status}
                  onChange={handleFilterChange}
                  className="border border-gray-300 px-4 py-2 rounded-lg bg-white focus:ring focus:ring-blue-300"
                >
                  <option value="">Status</option>
                  <option value="TL">Tour Leader</option>
                  <option value="User">Users</option>
                </select>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={applyFilters}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition"
                >
                  <FaSearch /> Terapkan Filter
                </button>
                <button
                  onClick={() => {
                    setSearchParams({
                      displayName: "",
                      email: "",
                      status: "",
                    });
                    setFilteredUsers(users);
                  }}
                  className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg transition"
                >
                  <FaTimes /> Reset Filter
                </button>
              </div>
            </div>
          )}
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="border border-gray-300 p-3">No</th>
              <th className="border border-gray-300 p-3">Name</th>
              <th className="border border-gray-300 p-3">Email</th>
              <th className="border border-gray-300 p-3">Phone Number</th>
              <th className="border border-gray-300 p-3">Status</th>
              <th className="border border-gray-300 p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user, index) => (
                <tr key={user.id} className={`border-b ${index % 2 === 0 ? "bg-gray-100" : ""} hover:bg-gray-200`}>
                  <td className="border border-gray-300 p-3">{(currentPage - 1) * vouchersPerPage + index + 1}</td>
                  <td className="border border-gray-300 p-3">{user.displayName}</td>
                  <td className="border border-gray-300 p-3">{user.email}</td>
                  <td className="border border-gray-300 p-3">{user.phoneNumber}</td>
                  <td className="border border-gray-300 p-3">
                    {editingUserId === user.id ? (
                      <select value={editedStatus[user.id]} onChange={(e) => setEditedStatus({ ...editedStatus, [user.id]: e.target.value })}>
                        <option value="User">User</option>
                        <option value="TL">Tour Leader</option>
                      </select>
                    ) : (
                      user.status || "User"
                    )}
                  </td>
                  <td className="border border-gray-300 p-3">
                    {editingUserId === user.id ? (
                      <button onClick={() => saveStatus(user.id)}><FaSave /></button>
                    ) : (
                      <button onClick={() => startEditing(user.id, user.status)}><FaEdit /></button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-4">Tidak ada Users tersedia.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
