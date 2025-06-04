import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'react-hot-toast';

interface Client { id_client: string; nom: string; email: string; }
interface Event { id_event: string; title: string; date: string; lieu: string; statut: string; budget: string | number | null; }
interface Vendor { id_vendor: string; nom: string; email: string; phone: string | null; note: number | string | null; }
interface Requete { id_requete: string; titre: string; statut: string; id_event: string; }
interface Transaction { id_transaction: string; montant: string | number; date: string; id_event: string; }
interface Type { id_type: string; name: string; }

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<{
        clients: Client[];
        events: Event[];
        vendors: Vendor[];
        requests: Requete[];
        transactions: Transaction[];
        types: Type[];
        page: number;
        limit: number;
    }>({
        clients: [], events: [], vendors: [], requests: [], transactions: [], types: [], page: 1, limit: 10
    });
    const [newVendor, setNewVendor] = useState({ nom: '', email: '', phone: '', note: '' });
    const [editVendor, setEditVendor] = useState<Vendor | null>(null);
    const [filter, setFilter] = useState({ vendorName: '', eventTitle: '' });
    const [sort, setSort] = useState({ field: 'nom', direction: 'asc' });

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost/pfe/backend/src/api/admin.php?action=dashboard&page=${data.page}&limit=${data.limit}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Failed to load data');
                const processedVendors = result.data.vendors.map((vendor: Vendor) => ({
                    ...vendor,
                    note: vendor.note != null ? parseFloat(vendor.note as string) : null
                }));
                setData({ ...result.data, vendors: processedVendors, page: result.page, limit: result.limit });
            } catch (error: any) {
                toast.error(error.message || 'Failed to load dashboard');
                if (error.message.includes('Unauthorized')) {
                    navigate('/admin/login');
                }
            }
        };
        fetchData();
    }, [data.page, data.limit, navigate]);

    const validateVendorInput = () => {
        if (!newVendor.nom || !newVendor.email) {
            toast.error('Name and email are required');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newVendor.email)) {
            toast.error('Invalid email format');
            return false;
        }
        if (newVendor.note && (parseFloat(newVendor.note) < 0 || parseFloat(newVendor.note) > 5)) {
            toast.error('Rating must be between 0 and 5');
            return false;
        }
        return true;
    };

    const handleAddVendor = async () => {
        if (!validateVendorInput()) return;
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=add_vendor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newVendor,
                    note: newVendor.note ? parseFloat(newVendor.note) : null
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to add vendor');
            setData({
                ...data,
                vendors: [...data.vendors, { id_vendor: result.data.id_vendor, ...newVendor, note: newVendor.note ? parseFloat(newVendor.note) : null, phone: newVendor.phone || null }]
            });
            setNewVendor({ nom: '', email: '', phone: '', note: '' });
            toast.success('Vendor added');
        } catch (error: any) {
            toast.error(error.message || 'Failed to add vendor');
        }
    };

    const handleEditVendor = (vendor: Vendor) => {
        setEditVendor(vendor);
        setNewVendor({ nom: vendor.nom, email: vendor.email, phone: vendor.phone || '', note: vendor.note?.toString() || '' });
    };

    const handleUpdateVendor = async () => {
        if (!editVendor || !validateVendorInput()) return;
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost/pfe/backend/src/api/admin.php?action=update_vendor&id_vendor=${editVendor.id_vendor}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newVendor,
                    note: newVendor.note ? parseFloat(newVendor.note) : null
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to update vendor');
            setData({
                ...data,
                vendors: data.vendors.map(v => v.id_vendor === editVendor.id_vendor ? { ...v, ...newVendor, note: newVendor.note ? parseFloat(newVendor.note) : null, phone: newVendor.phone || null } : v)
            });
            setEditVendor(null);
            setNewVendor({ nom: '', email: '', phone: '', note: '' });
            toast.success('Vendor updated');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update vendor');
        }
    };

    const handleDeleteVendor = async (id_vendor: string) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=delete_vendor', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id_vendor }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to delete vendor');
            setData({
                ...data,
                vendors: data.vendors.filter(v => v.id_vendor !== id_vendor)
            });
            toast.success('Vendor deleted');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete vendor');
        }
    };

    const handleSort = (field: string) => {
        setSort({
            field,
            direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc'
        });
    };

    const sortedVendors = [...data.vendors].sort((a, b) => {
        const aValue = a[sort.field as keyof Vendor] || '';
        const bValue = b[sort.field as keyof Vendor] || '';
        return sort.direction === 'asc'
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
    });

    const filteredVendors = sortedVendors.filter(v => v.nom.toLowerCase().includes(filter.vendorName.toLowerCase()));
    const filteredEvents = data.events.filter(e => e.title.toLowerCase().includes(filter.eventTitle.toLowerCase()));

    const formatBudget = (budget: string | number | null): string => {
        if (budget == null) return 'N/A';
        const num = typeof budget === 'string' ? parseFloat(budget) : budget;
        return isNaN(num) ? 'N/A' : `$${num.toFixed(2)}`;
    };

    const formatMontant = (montant: string | number): string => {
        const num = typeof montant === 'string' ? parseFloat(montant) : montant;
        return isNaN(num) ? 'N/A' : `$${num.toFixed(2)}`;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {/* Vendor Management */}
            <Card className="mb-8">
                <CardHeader>{editVendor ? 'Edit Vendor' : 'Manage Vendors'}</CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-4">
                        <Input
                            placeholder="Vendor Name"
                            value={newVendor.nom}
                            onChange={e => setNewVendor({ ...newVendor, nom: e.target.value })}
                        />
                        <Input
                            placeholder="Email"
                            value={newVendor.email}
                            onChange={e => setNewVendor({ ...newVendor, email: e.target.value })}
                        />
                        <Input
                            placeholder="Phone"
                            value={newVendor.phone}
                            onChange={e => setNewVendor({ ...newVendor, phone: e.target.value })}
                        />
                        <Input
                            placeholder="Rating (0-5)"
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={newVendor.note}
                            onChange={e => setNewVendor({ ...newVendor, note: e.target.value })}
                        />
                        {editVendor ? (
                            <>
                                <Button onClick={handleUpdateVendor}>Update Vendor</Button>
                                <Button variant="outline" onClick={() => { setEditVendor(null); setNewVendor({ nom: '', email: '', phone: '', note: '' }); }}>
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <Button onClick={handleAddVendor}>Add Vendor</Button>
                        )}
                    </div>
                    <Input
                        placeholder="Filter by vendor name"
                        value={filter.vendorName}
                        onChange={e => setFilter({ ...filter, vendorName: e.target.value })}
                        className="mb-4"
                    />
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-left cursor-pointer" onClick={() => handleSort('nom')}>Name {sort.field === 'nom' && (sort.direction === 'asc' ? '↑' : '↓')}</th>
                                <th className="text-left cursor-pointer" onClick={() => handleSort('email')}>Email {sort.field === 'email' && (sort.direction === 'asc' ? '↑' : '↓')}</th>
                                <th className="text-left">Phone</th>
                                <th className="text-left cursor-pointer" onClick={() => handleSort('note')}>Rating {sort.field === 'note' && (sort.direction === 'asc' ? '↑' : '↓')}</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVendors.map(vendor => (
                                <tr key={vendor.id_vendor}>
                                    <td>{vendor.nom}</td>
                                    <td>{vendor.email}</td>
                                    <td>{vendor.phone || 'N/A'}</td>
                                    <td>
                                        {vendor.note != null && !isNaN(Number(vendor.note))
                                            ? Number(vendor.note).toFixed(1)
                                            : 'N/A'}
                                    </td>
                                    <td className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleEditVendor(vendor)}>Edit</Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteVendor(vendor.id_vendor)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex gap-4 mt-4">
                        <Button disabled={data.page === 1} onClick={() => setData({ ...data, page: data.page - 1 })}>Previous</Button>
                        <span>Page {data.page}</span>
                        <Button onClick={() => setData({ ...data, page: data.page + 1 })}>Next</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Events */}
            <Card className="mb-8">
                <CardHeader>Events</CardHeader>
                <CardContent>
                    <Input
                        placeholder="Filter by event title"
                        value={filter.eventTitle}
                        onChange={e => setFilter({ ...filter, eventTitle: e.target.value })}
                        className="mb-4"
                    />
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-left">Title</th>
                                <th className="text-left">Date</th>
                                <th className="text-left">Location</th>
                                <th className="text-left">Status</th>
                                <th className="text-left">Budget</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvents.map(event => (
                                <tr key={event.id_event}>
                                    <td>{event.title}</td>
                                    <td>{new Date(event.date).toLocaleDateString()}</td>
                                    <td>{event.lieu || 'N/A'}</td>
                                    <td>{event.statut}</td>
                                    <td>{formatBudget(event.budget)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex gap-4 mt-4">
                        <Button disabled={data.page === 1} onClick={() => setData({ ...data, page: data.page - 1 })}>Previous</Button>
                        <span>Page {data.page}</span>
                        <Button onClick={() => setData({ ...data, page: data.page + 1 })}>Next</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Clients, Requests, Transactions, Types */}
            {/* Similar pagination and filtering can be added here if needed */}
            <Card className="mb-8">
                <CardHeader>Clients</CardHeader>
                <CardContent>
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-left">Name</th>
                                <th className="text-left">Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.clients.map(client => (
                                <tr key={client.id_client}>
                                    <td>{client.nom}</td>
                                    <td>{client.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <Card className="mb-8">
                <CardHeader>Requests</CardHeader>
                <CardContent>
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-left">Title</th>
                                <th className="text-left">Status</th>
                                <th className="text-left">Event ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.requests.map(req => (
                                <tr key={req.id_requete}>
                                    <td>{req.titre}</td>
                                    <td>{req.statut}</td>
                                    <td>{req.id_event}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <Card className="mb-8">
                <CardHeader>Transactions</CardHeader>
                <CardContent>
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-left">Amount</th>
                                <th className="text-left">Date</th>
                                <th className="text-left">Event ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.transactions.map(tx => (
                                <tr key={tx.id_transaction}>
                                    <td>{formatMontant(tx.montant)}</td>
                                    <td>{new Date(tx.date).toLocaleDateString()}</td>
                                    <td>{tx.id_event}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>Event Types</CardHeader>
                <CardContent>
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-left">Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.types.map(type => (
                                <tr key={type.id_type}>
                                    <td>{type.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
};