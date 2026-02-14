import React, { useState, useEffect } from 'react';
import { adminService } from '../../api';
import { Search, UserPlus, Trash2, Mail, Phone, MapPin, X, User } from 'lucide-react';

export default function CustomerManager() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [newCustomer, setNewCustomer] = useState({
        firstName: '', lastName: '', email: '', phoneNumber: '', address: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await adminService.getCustomers();
            setCustomers(data);
        } catch (error) {
            console.error("Failed to fetch customers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await adminService.createCustomer(newCustomer);
            setShowModal(false);
            setNewCustomer({ firstName: '', lastName: '', email: '', phoneNumber: '', address: '' });
            fetchCustomers();
        } catch (error) {
            console.error("Create failed", error);
        }
    };

    const handleDelete = async () => {
        if (!selectedCustomer) return;
        try {
            await adminService.deleteCustomer(selectedCustomer.id);
            setShowDeleteModal(false);
            fetchCustomers();
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Customers</h1>
                    <p className="text-primary-200">Manage user profiles and identity verification.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                    >
                        <UserPlus size={20} />
                        Add Customer
                    </button>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center gap-3 bg-black/20 px-4 py-2.5 rounded-xl border border-white/10 focus-within:border-cyan-500 transition-all max-w-md group">
                        <Search size={18} className="text-primary-400 group-focus-within:text-cyan-400 scale-100 group-focus-within:scale-110 transition-all" />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            className="bg-transparent outline-none text-white w-full placeholder:text-primary-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-widest text-primary-200 font-bold">
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Address</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-primary-300 italic">Loading customer data...</td></tr>
                            ) : customers.length > 0 ? (
                                customers.map((c) => (
                                    <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white border border-white/10 shadow-inner">
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">{c.firstName} {c.lastName}</div>
                                                    <div className="text-xs text-primary-300">ID: {c.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-primary-100">
                                                <Mail size={14} className="text-primary-400" />
                                                {c.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-primary-100">
                                                <Phone size={14} className="text-primary-400" />
                                                {c.phoneNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-2 text-sm text-primary-200 max-w-xs">
                                                <MapPin size={14} className="text-primary-400 mt-0.5 shrink-0" />
                                                <span className="truncate">{c.address}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => { setSelectedCustomer(c); setShowDeleteModal(true); }}
                                                className="p-2 text-primary-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                                title="Delete Customer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-primary-300 italic">No customers found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-950/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-primary-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                        <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10">
                            <h3 className="text-xl font-bold text-white">Add New Customer</h3>
                            <button onClick={() => setShowModal(false)} className="text-primary-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-5 relative z-10">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">First Name</label>
                                    <input
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-all placeholder:text-primary-600"
                                        placeholder="John"
                                        value={newCustomer.firstName}
                                        onChange={e => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">Last Name</label>
                                    <input
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-all placeholder:text-primary-600"
                                        placeholder="Doe"
                                        value={newCustomer.lastName}
                                        onChange={e => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-all placeholder:text-primary-600"
                                    placeholder="john@example.com"
                                    value={newCustomer.email}
                                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">Phone Number</label>
                                <input
                                    type="tel"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-all placeholder:text-primary-600"
                                    placeholder="+1 (555) 000-0000"
                                    value={newCustomer.phoneNumber}
                                    onChange={e => setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-primary-300 tracking-wider">Address</label>
                                <input
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-all placeholder:text-primary-600"
                                    placeholder="123 Main St, City, Country"
                                    value={newCustomer.address}
                                    onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]">
                                    Create Customer Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-950/90 backdrop-blur-md animate-fade-in">
                    <div className="bg-primary-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-6 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>

                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                            <Trash2 size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Delete Customer?</h3>
                        <p className="text-primary-300 mb-6">
                            Are you sure you want to delete <span className="text-white font-bold">{selectedCustomer?.firstName} {selectedCustomer?.lastName}</span>?
                            This action cannot be undone and will remove all associated accounts.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors border border-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-600/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
