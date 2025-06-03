import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'react-hot-toast';

interface Client { id_client: string; nom: string; email: string; }
interface Event { id_event: string; title: string; date: string; lieu: string; statut: string; budget: string | number | null; }
interface Vendor { id_vendor: string; nom: string; email: string; phone: string | null; note: number | null; }
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
    }>({
        clients: [], events: [], vendors: [], requests: [], transactions: [], types: []
    });
    const [newVendor, setNewVendor] = useState({ nom: '', email: '', phone: '', note: '' });
    const [editVendor, setEditVendor] = useState<Vendor | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost/pfe/backend/src/api/admin.php');
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Failed to load data');
                setData(result.data);
            } catch (error) {
                toast.error(error.message || 'Failed to load dashboard');
            }
        };
        fetchData();
    }, []);

    const handleAddVendor = async () => {
        try {
            const response = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=add_vendor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newVendor,
                    note: newVendor.note ? parseFloat(newVendor.note) : null
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            setData({
                ...data,
                vendors: [...data.vendors, { id_vendor: result.data.id_vendor, ...newVendor, note: newVendor.note ? parseFloat(newVendor.note) : null, phone: newVendor.phone || null }]
            });
            setNewVendor({ nom: '', email: '', phone: '', note: '' });
            toast.success('Vendor added');
        } catch (error) {
            toast.error(error.message || 'Failed to add vendor');
        }
    };

    const handleEditVendor = (vendor: Vendor) => {
        setEditVendor(vendor);
        setNewVendor({ nom: vendor.nom, email: vendor.email, phone: vendor.phone || '', note: vendor.note?.toString() || '' });
    };

    const handleUpdateVendor = async () => {
        if (!editVendor) return;
        try {
            const response = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=update_vendor', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_vendor: editVendor.id_vendor,
                    ...newVendor,
                    note: newVendor.note ? parseFloat(newVendor.note) : null
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            setData({
                ...data,
                vendors: data.vendors.map(v => v.id_vendor === editVendor.id_vendor ? { ...v, ...newVendor, note: newVendor.note ? parseFloat(newVendor.note) : null, phone: newVendor.phone || null } : v)
            });
            setEditVendor(null);
            setNewVendor({ nom: '', email: '', phone: '', note: '' });
            toast.success('Vendor updated');
        } catch (error) {
            toast.error(error.message || 'Failed to update vendor');
        }
    };

    const handleDeleteVendor = async (id_vendor: string) => {
        try {
            const response = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=delete_vendor', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_vendor }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            setData({
                ...data,
                vendors: data.vendors.filter(v => v.id_vendor !== id_vendor)
            });
            toast.success('Vendor deleted');
        } catch (error) {
            toast.error(error.message || 'Failed to delete vendor');
        }
    };

    // Helper function to format budget
    const formatBudget = (budget: string | number | null): string => {
        if (budget == null) return 'N/A';
        const num = typeof budget === 'string' ? parseFloat(budget) : budget;
        return isNaN(num) ? 'N/A' : `$${num.toFixed(2)}`;
    };

    // Helper function to format montant
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
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-left">Name</th>
                                <th className="text-left">Email</th>
                                <th className="text-left">Phone</th>
                                <th className="text-left">Rating</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.vendors.map(vendor => (
                                <tr key={vendor.id_vendor}>
                                    <td>{vendor.nom}</td>
                                    <td>{vendor.email}</td>
                                    <td>{vendor.phone || 'N/A'}</td>
                                    <td>{vendor.note || 'N/A'}</td>
                                    <td className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleEditVendor(vendor)}>Edit</Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteVendor(vendor.id_vendor)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Clients */}
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

            {/* Events */}
            <Card className="mb-8">
                <CardHeader>Events</CardHeader>
                <CardContent>
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
                            {data.events.map(event => (
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
                </CardContent>
            </Card>

            {/* Requests */}
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

            {/* Transactions */}
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

            {/* Types */}
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