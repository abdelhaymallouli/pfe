import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { toast } from 'react-hot-toast';

export const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            toast.error('Email and password are required');
            return;
        }
        try {
            const response = await fetch('http://localhost/pfe/backend/src/api/admin.php?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Login failed');
            localStorage.setItem('adminToken', result.token);
            toast.success('Login successful');
            navigate('/admin/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
        }
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
                        <Input
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="mb-2"
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="mb-2"
                        />
                    </div>
                    <Button onClick={handleLogin} className="w-full">
                        Login
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};