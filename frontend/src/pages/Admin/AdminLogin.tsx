import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { toast } from 'react-hot-toast';

interface Admin {
    id_admin: string;
    nom: string;
    email: string;
}

export const AdminLogin = () => {
    const navigate = useNavigate();
    const [admins, setAdmins] = useState<Admin[]>([]);

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=get_admins');
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Failed to load admins');
                setAdmins(result.data);
            } catch (error) {
                toast.error(error.message || 'Failed to load admins');
            }
        };
        fetchAdmins();
    }, []);

    const handleEnter = () => {
        navigate('/admin/dashboard');
    };

    return (
        <div className="max-w-md mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <h1 className="text-2xl font-bold">Admin Login</h1>
                    <p className="text-sm text-gray-500">Access the admin dashboard</p>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700">Available Admins:</p>
                        {admins.length > 0 ? (
                            <ul className="mt-2">
                                {admins.map(admin => (
                                    <li key={admin.id_admin} className="text-sm text-gray-600">
                                        {admin.nom} ({admin.email})
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">No admins found.</p>
                        )}
                    </div>
                    <Button onClick={handleEnter} className="w-full">
                        Enter Dashboard
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};