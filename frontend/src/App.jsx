import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  RefreshCw,
  Edit2,
  Trash2,
  Database,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Copy,
  Check,
} from "lucide-react";

export default function App() {
  const [activeVersion, setActiveVersion] = useState("v3"); // v3 = Supabase, v2 = MongoDB, v1 = FakeDB
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string }

  // Form State for Create
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [updating, setUpdating] = useState(false);

  // Copied ID state
  const [copiedId, setCopiedId] = useState(null);

  const getApiUrl = (version = activeVersion) => {
    return `/api/${version}/users`;
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl());
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      showNotification(`Failed to load users: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeVersion]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      showNotification("Please fill in username, email, and password", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(getApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create user");
      }

      showNotification(`User "${formData.username}" created successfully in ${activeVersion.toUpperCase()}!`);
      setFormData({ username: "", email: "", password: "" });
      fetchUsers();
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (user) => {
    setEditingUser(user);
    setEditFormData({
      username: user.username || "",
      email: user.email || "",
      password: "",
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const id = editingUser.id || editingUser._id;
    if (!editFormData.username || !editFormData.email || !editFormData.password) {
      showNotification("Please fill in all fields (including new password)", "error");
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`${getApiUrl()}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to update user");
      }

      showNotification("User updated successfully!");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (user) => {
    const id = user.id || user._id;
    if (!window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${getApiUrl()}/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to delete user");
      }

      showNotification("User deleted successfully!");
      fetchUsers();
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const username = (u.username || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    return username.includes(q) || email.includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${
              notification.type === "error"
                ? "bg-rose-950/90 border-rose-800/60 text-rose-200"
                : "bg-emerald-950/90 border-emerald-800/60 text-emerald-200"
            } backdrop-blur-md`}
          >
            {notification.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 hover:opacity-75 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Database className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                JSD13 User Hub
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Supabase Live
                </span>
              </h1>
              <p className="text-xs text-slate-400">Full-Stack Monorepo User Management</p>
            </div>
          </div>

          {/* Database Target Selector */}
          <div className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            {[
              { id: "v3", label: "v3 (Supabase)", icon: "⚡" },
              { id: "v2", label: "v2 (MongoDB)", icon: "🍃" },
              { id: "v1", label: "v1 (FakeDB)", icon: "💾" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveVersion(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeVersion === tab.id
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Banner Info */}
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/40 border border-emerald-800/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
            <div className="text-sm">
              <span className="text-slate-400">Target Endpoint: </span>
              <code className="font-mono bg-slate-950 px-2.5 py-1 rounded-lg text-emerald-400 text-xs border border-slate-800">
                http://localhost:3001/api/{activeVersion}/users
              </code>
            </div>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Database:</span>
            <span className="font-semibold text-slate-200">
              {activeVersion === "v3"
                ? "Supabase PostgreSQL"
                : activeVersion === "v2"
                ? "MongoDB Mongoose"
                : "In-Memory FakeDB"}
            </span>
          </div>
        </div>

        {/* 2-Column Grid: Form & Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Create User Form */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm sticky top-24 shadow-xl">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                Add New User
              </h2>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JohnDoe"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span>{submitting ? "Saving..." : "Create User"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Users List Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              {/* Table Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800/60 text-slate-300">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Users Directory</h2>
                    <p className="text-xs text-slate-400">
                      Found {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-60">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search username or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition-colors"
                    title="Refresh users"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 pl-2">User</th>
                      <th className="pb-3 px-3">Email</th>
                      <th className="pb-3 px-3">ID</th>
                      <th className="pb-3 pr-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm">
                    {loading && users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-500">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
                          Loading users from {activeVersion.toUpperCase()}...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-500">
                          No users found. Create one using the form on the left!
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const id = user.id || user._id;
                        const initial = (user.username || "U").charAt(0).toUpperCase();

                        return (
                          <tr
                            key={id}
                            className="hover:bg-slate-800/30 transition-colors group"
                          >
                            <td className="py-3 pl-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400">
                                  {initial}
                                </div>
                                <span className="font-semibold text-slate-200">
                                  {user.username}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-400 text-xs font-mono">
                              {user.email}
                            </td>
                            <td className="py-3 px-3">
                              <button
                                onClick={() => copyToClipboard(String(id))}
                                className="flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-slate-300 bg-slate-950/80 px-2 py-1 rounded-md border border-slate-800/80 transition-colors"
                                title="Click to copy ID"
                              >
                                <span>{String(id).substring(0, 8)}...</span>
                                {copiedId === String(id) ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3 text-slate-500" />
                                )}
                              </button>
                            </td>
                            <td className="py-3 pr-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleStartEdit(user)}
                                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                                  title="Edit user"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                                  title="Delete user"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-emerald-400" />
              Edit User ({editingUser.username})
            </h3>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.username}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, username: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={editFormData.password}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, password: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
