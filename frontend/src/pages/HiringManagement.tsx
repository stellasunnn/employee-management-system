// src/pages/HiringManagement.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'react-hot-toast';
import hiringApi from '@/api/hiring';
import OnboardingReview from '../components/hr-components/OnboardingReview';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Token {
  _id: string;
  token: string;
  createdAt: string;
  status: string;
  expiresAt: string;
  email?: string;
  name?: string;
}

const HiringManagement = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState('onboarding');

  useEffect(() => {
    if (activeTab === 'tokens') {
      fetchTokenHistory();
    }
  }, [activeTab]);

  const fetchTokenHistory = async () => {
    try {
      const response = await hiringApi.getTokenHistory();
      setTokens(response.data);
    } catch (error) {
      toast.error('Failed to fetch token history');
    }
  };

  const handleGenerateToken = async () => {
    if (!email || !name) {
      toast.error('Please provide both email and name');
      return;
    }
    try {
      setLoading(true);
      const response = await hiringApi.generateToken(email, name);
      setNewToken(response.data.token);
      await fetchTokenHistory();
      toast.success('Token generated and email sent successfully');
      setEmail('');
      setName('');
    } catch (error) {
      toast.error('Failed to generate token and send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Hiring Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="onboarding">Onboarding Applications</TabsTrigger>
          <TabsTrigger value="tokens">Registration Tokens</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'onboarding' ? (
        <OnboardingReview />
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Registration Token</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter employee email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter employee name" />
                  </div>
                </div>
                <Button onClick={handleGenerateToken} disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Token and Send Email'}
                </Button>
                {newToken && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Generated Token</label>
                    <Input value={newToken} readOnly className="font-mono" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Token History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Expires At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens.map((token) => (
                    <TableRow key={token._id}>
                      <TableCell className="font-mono">{token.token}</TableCell>
                      <TableCell>{token.email || '-'}</TableCell>
                      <TableCell>{token.name || '-'}</TableCell>
                      <TableCell>{token.status}</TableCell>
                      <TableCell>{new Date(token.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{new Date(token.expiresAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HiringManagement;
