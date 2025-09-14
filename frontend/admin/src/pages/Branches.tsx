import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, MapPin, Phone, Mail, Clock } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  name: string;
  position: string;
  experience: string;
  profilePic: string;
}

interface Service {
  name: string;
  description: string;
}

interface Program {
  title: string;
  description: string;
  schedule: string;
}

interface Branch {
  _id: string;
  name: string;
  slug: string;
  address: string;
  mapLink: string;
  description: string;
  contact: {
    phone: string;
    email: string;
  };
  workingHours: string;
  services: Service[];
  uniquePrograms: Program[];
  teamMembers: TeamMember[];
  heroImage: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const Branches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    mapLink: '',
    description: '',
    contact: { phone: '', email: '' },
    workingHours: 'Sunday - Friday: 10:00 AM - 5:00 PM',
    services: [],
    uniquePrograms: [],
    teamMembers: [{ name: '', position: '', experience: '', profilePic: '' }],
    order: 0
  });
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [teamMemberFiles, setTeamMemberFiles] = useState<(File | null)[]>([]);

  const { toast } = useToast();

  // Fetch branches
  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/branches', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-admin-frontend': 'true',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBranches(data.data || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch branches",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while fetching branches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      mapLink: '',
      description: '',
      contact: { phone: '', email: '' },
      workingHours: 'Sunday - Friday: 10:00 AM - 5:00 PM',
      services: [],
      uniquePrograms: [],
      teamMembers: [{ name: '', position: '', experience: '', profilePic: '' }],
      order: 0
    });
    setHeroImageFile(null);
    setTeamMemberFiles([]);
    setEditingBranch(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (field: string, index: number, subField: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].map((item: any, i: number) => 
        i === index ? { ...item, [subField]: value } : item
      )
    }));
  };

  const addArrayItem = (field: string, template: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field as keyof typeof prev], template]
    }));
    if (field === 'teamMembers') {
      setTeamMemberFiles(prev => [...prev, null]);
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].filter((_: any, i: number) => i !== index)
    }));
    if (field === 'teamMembers') {
      setTeamMemberFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  // API operations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let token = localStorage.getItem('token');
      if (!token) {
        const match = document.cookie.match(/(?:^|; )accessToken=([^;]*)/);
        token = match ? decodeURIComponent(match[1]) : null;
      }
      console.log('Submitting form with token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('mapLink', formData.mapLink);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('contact', JSON.stringify(formData.contact));
      formDataToSend.append('workingHours', formData.workingHours);
      formDataToSend.append('services', JSON.stringify(formData.services));
      formDataToSend.append('uniquePrograms', JSON.stringify(formData.uniquePrograms));
      formDataToSend.append('teamMembers', JSON.stringify(formData.teamMembers));
      formDataToSend.append('order', formData.order.toString());

      // Add hero image
      if (heroImageFile) {
        formDataToSend.append('heroImage', heroImageFile);
      }

      // Add team member profile pictures
      teamMemberFiles.forEach((file, index) => {
        if (file) {
          formDataToSend.append(`teamMember_${index}_profilePic`, file);
        }
      });

      const url = editingBranch 
        ? `http://localhost:8000/api/v1/branches/${editingBranch._id}`
        : 'http://localhost:8000/api/v1/branches';
      
      const method = editingBranch ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-frontend': 'true',
        },
        body: formDataToSend,
      });

      if (response.ok) {
        console.log('Branch created successfully');
        toast({
          title: "Success",
          description: `Branch ${editingBranch ? 'updated' : 'created'} successfully`,
        });
        setShowCreateDialog(false);
        resetForm();
        fetchBranches();
      } else {
        const errorData = await response.json();
        console.error('API Error:', response.status, errorData);
        toast({
          title: "Error",
          description: errorData.message || 'Failed to save branch',
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while saving branch",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      mapLink: branch.mapLink,
      description: branch.description,
      contact: branch.contact,
      workingHours: branch.workingHours,
      services: branch.services,
      uniquePrograms: branch.uniquePrograms,
      teamMembers: branch.teamMembers.length ? branch.teamMembers : [{ name: '', position: '', experience: '', profilePic: '' }],
      order: branch.order
    });
    setTeamMemberFiles(new Array(branch.teamMembers.length).fill(null));
    setShowCreateDialog(true);
  };

  const handleDelete = async (branchId: string) => {
    if (!confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/v1/branches/${branchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-frontend': 'true',
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Branch deleted successfully",
        });
        fetchBranches();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete branch",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while deleting branch",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (branchId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/v1/branches/${branchId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-frontend': 'true',
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Branch status updated successfully",
        });
        fetchBranches();
      } else {
        toast({
          title: "Error",
          description: "Failed to update branch status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while updating branch status",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Branch Management</h1>
          <Dialog open={showCreateDialog} onOpenChange={(open) => {
            setShowCreateDialog(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingBranch ? 'Edit Branch' : 'Create New Branch'}
                </DialogTitle>
                <DialogDescription>
                  {editingBranch
                    ? 'Update branch details and save your changes.'
                    : 'Fill out the form to create a new branch. Fields marked * are required.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="programs">Programs</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Branch Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="order">Display Order</Label>
                        <Input
                          id="order"
                          type="number"
                          value={formData.order}
                          onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="mapLink">Google Maps Link *</Label>
                      <Input
                        id="mapLink"
                        value={formData.mapLink}
                        onChange={(e) => handleInputChange('mapLink', e.target.value)}
                        placeholder="https://www.google.com/maps?q=..."
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          value={formData.contact.phone}
                          onChange={(e) => handleInputChange('contact', { ...formData.contact, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.contact.email}
                          onChange={(e) => handleInputChange('contact', { ...formData.contact, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="workingHours">Working Hours</Label>
                      <Input
                        id="workingHours"
                        value={formData.workingHours}
                        onChange={(e) => handleInputChange('workingHours', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="heroImage">Hero Image</Label>
                      <Input
                        id="heroImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setHeroImageFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="services" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Services</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem('services', { name: '', description: '' })}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Service
                      </Button>
                    </div>
                    {formData.services.map((service, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium">Service {index + 1}</h4>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeArrayItem('services', index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <Label>Service Name</Label>
                              <Input
                                value={service.name}
                                onChange={(e) => handleNestedInputChange('services', index, 'name', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={service.description}
                                onChange={(e) => handleNestedInputChange('services', index, 'description', e.target.value)}
                                rows={3}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="programs" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Unique Programs</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem('uniquePrograms', { title: '', description: '', schedule: '' })}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Program
                      </Button>
                    </div>
                    {formData.uniquePrograms.map((program, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium">Program {index + 1}</h4>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeArrayItem('uniquePrograms', index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <Label>Program Title</Label>
                              <Input
                                value={program.title}
                                onChange={(e) => handleNestedInputChange('uniquePrograms', index, 'title', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={program.description}
                                onChange={(e) => handleNestedInputChange('uniquePrograms', index, 'description', e.target.value)}
                                rows={3}
                              />
                            </div>
                            <div>
                              <Label>Schedule</Label>
                              <Input
                                value={program.schedule}
                                onChange={(e) => handleNestedInputChange('uniquePrograms', index, 'schedule', e.target.value)}
                                placeholder="e.g., Monthly workshops - First Saturday"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="team" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Team Members</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem('teamMembers', { name: '', position: '', experience: '', profilePic: '' })}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Team Member
                      </Button>
                    </div>
                    {formData.teamMembers.map((member, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium">Team Member {index + 1}</h4>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeArrayItem('teamMembers', index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <Label>Name</Label>
                              <Input
                                value={member.name}
                                onChange={(e) => handleNestedInputChange('teamMembers', index, 'name', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Position</Label>
                              <Input
                                value={member.position}
                                onChange={(e) => handleNestedInputChange('teamMembers', index, 'position', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Experience</Label>
                              <Input
                                value={member.experience}
                                onChange={(e) => handleNestedInputChange('teamMembers', index, 'experience', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Profile Picture</Label>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const newFiles = [...teamMemberFiles];
                                  newFiles[index] = e.target.files?.[0] || null;
                                  setTeamMemberFiles(newFiles);
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateDialog(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingBranch ? 'Update Branch' : 'Create Branch'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Branches List */}
        <Card>
          <CardHeader>
            <CardTitle>All Branches</CardTitle>
            <CardDescription>
              Manage your organization's branch locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-6">Loading branches...</div>
            ) : branches.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No branches found. Create your first branch to get started.
                </AlertDescription>
              </Alert>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch._id}>
                      <TableCell className="font-medium">{branch.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {branch.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            <span className="text-sm">{branch.contact.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            <span className="text-sm">{branch.contact.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={branch.isActive ? "default" : "secondary"}>
                          {branch.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{branch.order}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(branch)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(branch._id)}
                          >
                            {branch.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(branch._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Branches;
