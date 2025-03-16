import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { FaTrash, FaEdit, FaSave, FaUserPlus, FaPlus } from "react-icons/fa";

function ChatManagement() {
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [newChat, setNewChat] = useState({ name: "", type: "group", members: [] });
  const [editingChat, setEditingChat] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");

  // Ambil data chats
  useEffect(() => {
    const fetchChats = async () => {
      const chatCollection = collection(db, "chats");
      const chatSnapshot = await getDocs(chatCollection);
      const chatList = chatSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChats(chatList);
    };
    fetchChats();
  }, []);

  // Ambil daftar user dari Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      const userCollection = collection(db, "users");
      const userSnapshot = await getDocs(userCollection);
      const userList = userSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    };
    fetchUsers();
  }, []);

  const handleAddChat = async () => {
    if (!newChat.name.trim()) {
      alert("Nama chat tidak boleh kosong!");
      return;
    }
    try {
      const docRef = await addDoc(collection(db, "chats"), newChat);
      setChats([...chats, { id: docRef.id, ...newChat }]);
      setNewChat({ name: "", type: "group", members: [] });
    } catch (error) {
      console.error("Error adding chat:", error);
    }
  };

  const handleEditChat = (chat) => {
    setEditingChat(chat);
  };

  const handleSaveChat = async () => {
    if (!editingChat.name.trim()) {
      alert("Nama chat tidak boleh kosong!");
      return;
    }
    try {
      await updateDoc(doc(db, "chats", editingChat.id), editingChat);
      setChats(chats.map((chat) => (chat.id === editingChat.id ? editingChat : chat)));
      setEditingChat(null);
    } catch (error) {
      console.error("Error updating chat:", error);
    }
  };

  const handleDeleteChat = async (id) => {
    if (window.confirm("Apakah kamu yakin ingin menghapus chat ini?")) {
      await deleteDoc(doc(db, "chats", id));
      setChats(chats.filter((chat) => chat.id !== id));
    }
  };

  // Tambah member berdasarkan nama yang dipilih
  const handleAddMember = async () => {
    if (!selectedUserName) return;
    const chatDoc = doc(db, "chats", selectedChatId);
    const chatData = chats.find((chat) => chat.id === selectedChatId);

    // Cari user berdasarkan nama
    const userToAdd = users.find((user) => user.displayName === selectedUserName);
    if (!userToAdd) return;

    const updatedMembers = [...(chatData.members || []), userToAdd];
    await updateDoc(chatDoc, { members: updatedMembers });

    setChats(
      chats.map((chat) =>
        chat.id === selectedChatId ? { ...chat, members: updatedMembers } : chat
      )
    );
    setSelectedUserName("");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Chat Management</h1>

      <button onClick={handleAddChat} className="bg-blue-500 text-white px-4 py-2 rounded mb-4 flex items-center gap-2">
        <FaPlus /> Tambah Chat
      </button>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-3">Chat Name</th>
            <th className="border p-3">Type</th>
            <th className="border p-3">Members</th>
            <th className="border p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {chats.map((chat) => (
            <tr key={chat.id} className="border border-gray-300">
              <td className="border p-3">
                {editingChat?.id === chat.id ? (
                  <input
                    type="text"
                    value={editingChat.name}
                    onChange={(e) => setEditingChat({ ...editingChat, name: e.target.value })}
                    className="border px-2 py-1 rounded w-full"
                  />
                ) : (
                  chat.name
                )}
              </td>
              <td className="border p-3">{chat.type}</td>
              <td className="border p-3">
                {chat.members && chat.members.length > 0
                  ? chat.members.map((member) => member.displayName).join(", ")
                  : "Belum ada member"}
              </td>
              <td className="border p-3 flex justify-center items-center gap-2">
                {editingChat?.id === chat.id ? (
                  <button onClick={handleSaveChat} className="bg-blue-500 text-white px-4 py-2 rounded">
                    <FaSave /> Simpan
                  </button>
                ) : (
                  <button onClick={() => handleEditChat(chat)} className="bg-yellow-500 text-white px-4 py-2 rounded">
                    <FaEdit /> Edit
                  </button>
                )}
                <button onClick={() => setSelectedChatId(chat.id)} className="bg-green-500 text-white px-4 py-2 rounded">
                  <FaUserPlus /> Tambah Member
                </button>
                <button onClick={() => handleDeleteChat(chat.id)} className="bg-red-500 text-white px-4 py-2 rounded">
                  <FaTrash /> Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedChatId && (
        <div className="mt-4 p-4 border rounded bg-white">
          <h2 className="text-lg font-semibold mb-3">Tambah Member</h2>
          <select
            value={selectedUserName}
            onChange={(e) => setSelectedUserName(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          >
            <option value="">Pilih Member</option>
            {users.map((user) => (
              <option key={user.uid} value={user.displayName}>
                {user.displayName}
              </option>
            ))}
          </select>
          <button onClick={handleAddMember} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
            Tambahkan
          </button>
        </div>
      )}
    </div>
  );
}

export default ChatManagement;
