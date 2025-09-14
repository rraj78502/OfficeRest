import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import axios, { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface CommitteeMember {
  _id: string;
  name: string;
  role: string;
  bio: string;
  committeeTitle: string;
  startDate: string;
  endDate: string;
  profilePic?: string;
  userId?: string | null;
}

interface FormData {
  name: string;
  role: string;
  bio: string;
  committeeTitle: string;
  startDate: string;
  endDate: string;
  profilePic: File | null;
  userId: string;
}

const CommitteeManagement: React.FC = () => {
  const [committees, setCommittees] = useState<CommitteeMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMember, setCurrentMember] = useState<CommitteeMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [titleFilter, setTitleFilter] = useState<string>("all");
  const [availableTitles, setAvailableTitles] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    role: "",
    bio: "",
    committeeTitle: "",
    startDate: "",
    endDate: "",
    profilePic: null,
    userId: "",
  });

  // Fetch all committee members
  const fetchCommitteeMembers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/committee-members`,
        {
          withCredentials: true,
          headers: { "x-admin-frontend": "true" },
        }
      );
      
      const committeeMembers = response.data.data;
      setCommittees(committeeMembers);
      
      // Extract unique committee titles for filtering
      const titles = Array.from(new Set(committeeMembers.map((m: CommitteeMember) => m.committeeTitle)));
      setAvailableTitles(titles as string[]);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to fetch committee members"
          : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchCommitteeMembers();
  }, [isAuthenticated, navigate]);

  // Filter committees by title
  const filteredCommittees = titleFilter === "all" 
    ? committees 
    : committees.filter(member => member.committeeTitle === titleFilter);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files[0]) {
      setFormData({
        ...formData,
        profilePic: files[0],
      });
    }
  };

  const handleEdit = (member: CommitteeMember) => {
    setCurrentMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio,
      committeeTitle: member.committeeTitle,
      startDate: member.startDate,
      endDate: member.endDate,
      profilePic: null,
      userId: member.userId || "",
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError("");
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          data.append(key, value as string | Blob);
        }
      });

      if (isEditMode && currentMember) {
        await axios.put(
          `${API_BASE_URL}/api/v1/committee-members/${currentMember._id}`,
          data,
          {
            withCredentials: true,
            headers: {
              "x-admin-frontend": "true",
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast({
          title: "Success",
          description: "Committee member updated successfully",
        });
      } else {
        await axios.post(
          `${API_BASE_URL}/api/v1/committee-members`,
          data,
          {
            withCredentials: true,
            headers: {
              "x-admin-frontend": "true",
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast({
          title: "Success",
          description: "Committee member created successfully",
        });
      }
      fetchCommitteeMembers();
      resetFormAndCloseModal();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to save committee member"
          : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this committee member?")) {
      return;
    }

    try {
      setError("");
      await axios.delete(
        `${API_BASE_URL}/api/v1/committee-members/${id}`,
        {
          withCredentials: true,
          headers: { "x-admin-frontend": "true" },
        }
      );
      toast({
        title: "Success",
        description: "Committee member deleted successfully",
      });
      fetchCommitteeMembers();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to delete committee member"
          : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const resetFormAndCloseModal = () => {
    setFormData({
      name: "",
      role: "",
      bio: "",
      committeeTitle: "",
      startDate: "",
      endDate: "",
      profilePic: null,
      userId: "",
    });
    setCurrentMember(null);
    setIsEditMode(false);
    setIsModalOpen(false);
    setError("");
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Committee Management</h1>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setIsModalOpen(true);
          }}
          className="bg-gray-800 hover:bg-gray-700"
        >
          + Add Committee Member
        </Button>
      </div>

      {/* Committee Title Filter */}
      <div className="mb-6">
        <Label htmlFor="titleFilter" className="text-sm font-medium mr-2">
          Filter by Committee Title:
        </Label>
        <Select
          value={titleFilter}
          onValueChange={(value: string) => setTitleFilter(value)}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select committee title" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Committees</SelectItem>
            {availableTitles.map((title) => (
              <SelectItem key={title} value={title}>
                {title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Committee Title</TableHead>
                <TableHead>Term</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommittees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No committee members found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCommittees.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell>
                      {member.profilePic ? (
                        <img
                          src={member.profilePic}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-semibold">
                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>{member.committeeTitle}</TableCell>
                    <TableCell>{member.startDate} - {member.endDate}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleEdit(member)}
                        className="text-gray-600 hover:text-gray-900 mr-2"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(member._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add/Edit Committee Member Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {isEditMode ? "Edit Committee Member" : "Add Committee Member"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update committee member details" : "Fill in the committee member details"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Role
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange(value, "role")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chairman">Chairman</SelectItem>
                    <SelectItem value="Vice Chairman">Vice Chairman</SelectItem>
                    <SelectItem value="Secretary">Secretary</SelectItem>
                    <SelectItem value="Treasurer">Treasurer</SelectItem>
                    <SelectItem value="Assistant Secretary">Assistant Secretary</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
                    <SelectItem value="Advisor">Advisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  required
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="committeeTitle" className="text-sm font-medium">
                  Committee Title
                </Label>
                <Input
                  id="committeeTitle"
                  name="committeeTitle"
                  value={formData.committeeTitle}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Central Working Committee"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate" className="text-sm font-medium">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 2081/09/20"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="endDate" className="text-sm font-medium">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Current or 2082/09/20"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="profilePic" className="text-sm font-medium">
                  Profile Picture
                </Label>
                <Input
                  id="profilePic"
                  name="profilePic"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {isEditMode && currentMember?.profilePic && (
                  <a
                    href={currentMember.profilePic}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm"
                  >
                    View Current Profile Picture
                  </a>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="userId" className="text-sm font-medium">
                  User ID (Optional)
                </Label>
                <Input
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  placeholder="Link to existing user account"
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetFormAndCloseModal}
              >
                Cancel
              </Button>

              <div className="flex gap-2">
                {isEditMode && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (currentMember) {
                        handleDelete(currentMember._id);
                        resetFormAndCloseModal();
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}

                <Button type="submit" className="bg-gray-700 text-white px-6">
                  {isEditMode ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CommitteeManagement;
