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
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import axios, { AxiosError } from "axios";
import * as XLSX from "xlsx";
import { Download, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const formatDate = (value?: string | null) => {
  if (!value || typeof value !== "string") return "";
  const parts = value.split("T");
  return parts[0] || value;
};

interface Member {
  _id: string;
  employeeId: string;
  username: string;
  surname: string;
  address: string;
  province: string;
  district: string;
  municipality: string;
  wardNumber: string;
  tole: string;
  telephoneNumber: string;
  mobileNumber: string;
  dob: string;
  postAtRetirement: string;
  pensionLeaseNumber: string;
  office: string;
  serviceStartDate: string;
  serviceRetirementDate: string;
  dateOfFillUp: string;
  place: string;
  email: string;
  membershipNumber: string;
  registrationNumber: string;
  role: string;
  profilePic: string;
  files: { url: string; type: string }[];
  membershipStatus: "pending" | "approved";
}

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "all">("all");
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    employeeId: "",
    username: "",
    surname: "",
    address: "",
    province: "",
    district: "",
    municipality: "",
    wardNumber: "",
    tole: "",
    telephoneNumber: "",
    mobileNumber: "",
    dob: "",
    postAtRetirement: "",
    pensionLeaseNumber: "",
    office: "",
    serviceStartDate: "",
    serviceRetirementDate: "",
    dateOfFillUp: "",
    place: "",
    email: "",
    role: "user",
    password: "",
  });

  // File state
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [additionalFile, setAdditionalFile] = useState<File | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedImportRows, setParsedImportRows] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  const safeString = (value: any): string => {
    if (value === undefined || value === null) return "";
    if (typeof value === "number") return String(value);
    if (typeof value === "string") return value.trim();
    return String(value).trim();
  };

  const getExcelValue = (row: Record<string, any>, keys: string[]): string => {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(row, key)) {
        const value = safeString(row[key]);
        if (value) return value;
      }
    }
    return "";
  };

  const mapExcelRowToPayload = (row: Record<string, any>) => {
    const employeeId = getExcelValue(row, ["employeeId", "Employee ID", "EmployeeId"]);
    const email = getExcelValue(row, ["email", "Email"]);
    let username = getExcelValue(row, ["username", "First Name", "Given Name"]);
    let surname = getExcelValue(row, ["surname", "Last Name", "Family Name"]);
    const fullName = getExcelValue(row, ["name", "Name", "Full Name"]);

    if ((!username || !surname) && fullName) {
      const nameParts = fullName.split(/\s+/).filter(Boolean);
      if (!username && nameParts.length) {
        username = nameParts.shift() || "";
      }
      if (!surname && nameParts.length) {
        surname = nameParts.join(" ");
      }
    }

    return {
      employeeId,
      username,
      surname,
      address: getExcelValue(row, ["address", "Address"]),
      province: getExcelValue(row, ["province", "Province"]),
      district: getExcelValue(row, ["district", "District"]),
      municipality: getExcelValue(row, ["municipality", "Municipality"]),
      wardNumber: getExcelValue(row, ["wardNumber", "Ward", "Ward Number"]),
      tole: getExcelValue(row, ["tole", "Tole"]),
      telephoneNumber: getExcelValue(row, ["telephoneNumber", "Telephone", "Telephone Number"]),
      mobileNumber: getExcelValue(row, ["mobileNumber", "Mobile", "Mobile Number"]),
      dob: getExcelValue(row, ["dob", "DOB", "Date of Birth"]),
      postAtRetirement: getExcelValue(row, ["postAtRetirement", "Post At Retirement"]),
      pensionLeaseNumber: getExcelValue(row, ["pensionLeaseNumber", "Pension Lease Number"]),
      office: getExcelValue(row, ["office", "Office"]),
      serviceStartDate: getExcelValue(row, ["serviceStartDate", "Service Start Date"]),
      serviceRetirementDate: getExcelValue(row, ["serviceRetirementDate", "Service Retirement Date"]),
      dateOfFillUp: getExcelValue(row, ["dateOfFillUp", "Date Of Fill Up"]),
      place: getExcelValue(row, ["place", "Place"]),
      email,
      role: getExcelValue(row, ["role", "Role"]) || "user",
      password: getExcelValue(row, ["password", "Password"]),
      membershipStatus: getExcelValue(row, ["membershipStatus", "Membership Status"]),
    };
  };

  // Validation function for form data
  const validateForm = () => {
    const requiredFields = [
      "employeeId",
      "username",
      "surname",
      "address",
      "province",
      "district",
      "municipality",
      "wardNumber",
      "tole",
      "telephoneNumber",
      "mobileNumber",
      "dob",
      "postAtRetirement",
      "pensionLeaseNumber",
      "office",
      "serviceStartDate",
      "serviceRetirementDate",
      "dateOfFillUp",
      "place",
      "email",
      "role",
    ];

    if (!isEditMode) {
      requiredFields.push("password");
    }

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData].trim()) {
        return `Field '${field}' is required`;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Invalid email format";
    }

    // Phone number validation
    const phoneRegex = /^\d{7,15}$/;
    if (
      !phoneRegex.test(formData.mobileNumber) ||
      !phoneRegex.test(formData.telephoneNumber)
    ) {
      return "Phone numbers must be 7-15 digits";
    }

    // Role validation
    if (!["user", "admin"].includes(formData.role)) {
      return "Invalid role selected";
    }

    // File validation
    if (!isEditMode && !profilePic) {
      return "Profile picture is required";
    }
    if (profilePic && !profilePic.type.startsWith("image/")) {
      return "Profile picture must be an image";
    }
    if (
      additionalFile &&
      ![
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(additionalFile.type)
    ) {
      return "Additional file must be an image, PDF, or Word document";
    }

    return "";
  };

  // Fetch all members
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/user/get-all-users`,
        {
          params: { status: statusFilter === "all" ? undefined : statusFilter },
          headers: {
            Authorization: `Bearer ${token}`,
            "x-admin-frontend": "true",
          },
        }
      );

      // Normalize members
    const normalizedMembers: Member[] = (response.data.data || [])
        .filter((user: Member) => user.role === "user" || user.role === "admin")
        .map((user: Member) => ({
          _id: user._id,
          employeeId: user.employeeId,
          username: user.username,
          surname: user.surname,
          address: user.address,
          province: user.province,
          district: user.district,
          municipality: user.municipality,
          wardNumber: user.wardNumber,
          tole: user.tole,
          telephoneNumber: user.telephoneNumber,
          mobileNumber: user.mobileNumber,
          dob: formatDate(user.dob),
          postAtRetirement: user.postAtRetirement,
          pensionLeaseNumber: user.pensionLeaseNumber,
          office: user.office,
          serviceStartDate: formatDate(user.serviceStartDate),
          serviceRetirementDate: formatDate(user.serviceRetirementDate),
          dateOfFillUp: formatDate(user.dateOfFillUp),
          place: user.place,
          email: user.email,
          membershipNumber: user.membershipNumber,
          registrationNumber: user.registrationNumber,
          role: user.role,
          profilePic: user.profilePic || "",
          files: user.files || [],
          membershipStatus: user.membershipStatus,
        }));

      setMembers(normalizedMembers);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to fetch members"
          : error instanceof Error
          ? error.message
          : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      if (errorMessage.includes("No authentication token") || (error instanceof AxiosError && error.response?.status === 401)) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchMembers();
  }, [isAuthenticated, navigate, statusFilter]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (name === "profilePic") {
        setProfilePic(files[0]);
      } else if (name === "additionalFile") {
        setAdditionalFile(files[0]);
      }
    }
  };

  const resetImportState = () => {
    setImportFile(null);
    setParsedImportRows([]);
    setImportError("");
    setImporting(false);
  };

  const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    resetImportState();

    if (!file) {
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      if (!sheet) {
        throw new Error("No worksheet found in the uploaded file");
      }

      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
        defval: "",
        raw: false,
      });

      const mappedRows = rows
        .map((row) => mapExcelRowToPayload(row))
        .filter((payload) =>
          payload.employeeId &&
          payload.email &&
          payload.username &&
          payload.surname
        );

      setImportFile(file);
      setParsedImportRows(mappedRows);
      if (mappedRows.length === 0) {
        setImportError("No valid rows found. Ensure required columns are populated.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to parse the selected file";
      setImportError(message);
    }
  };

  const handleImportSubmit = async () => {
    if (!parsedImportRows.length) {
      setImportError("No valid rows available for import.");
      return;
    }

    try {
      setImporting(true);
      setImportError("");
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/user/bulk-import`,
        { members: parsedImportRows },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-admin-frontend": "true",
          },
        }
      );

      const summary = response.data?.data || {};
      toast({
        title: "Import complete",
        description: `Imported ${summary.imported || 0} members, ${summary.failed || 0} failed`,
      });

      resetImportState();
      setIsImportDialogOpen(false);
      fetchMembers();
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to import members"
          : error instanceof Error
          ? error.message
          : "Failed to import members";
      setImportError(message);
      toast({
        title: "Import failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleExportMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/user/export`, {
        params: { status: statusFilter === "all" ? undefined : statusFilter },
        headers: {
          Authorization: `Bearer ${token}`,
          "x-admin-frontend": "true",
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `members_export_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export started",
        description: "The members list has been downloaded as an Excel file.",
      });
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to export members"
          : error instanceof Error
          ? error.message
          : "Failed to export members";
      toast({
        title: "Export failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (member: Member) => {
    try {
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/user/get-user/${member._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-admin-frontend": "true",
          },
        }
      );

      const userData = response.data.data;
      setCurrentMember(userData);
      setFormData({
        employeeId: userData.employeeId,
        username: userData.username,
        surname: userData.surname,
        address: userData.address,
        province: userData.province,
        district: userData.district,
        municipality: userData.municipality,
        wardNumber: userData.wardNumber,
        tole: userData.tole,
        telephoneNumber: userData.telephoneNumber,
        mobileNumber: userData.mobileNumber,
        dob: formatDate(userData.dob),
        postAtRetirement: userData.postAtRetirement,
        pensionLeaseNumber: userData.pensionLeaseNumber,
        office: userData.office,
        serviceStartDate: formatDate(userData.serviceStartDate),
        serviceRetirementDate: formatDate(userData.serviceRetirementDate),
        dateOfFillUp: formatDate(userData.dateOfFillUp),
        place: userData.place,
        email: userData.email,
        role: userData.role,
        password: "",
      });
      setProfilePic(null);
      setAdditionalFile(null);
      setIsEditMode(true);
      setIsModalOpen(true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to fetch member details"
          : error instanceof Error
          ? error.message
          : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      if (errorMessage.includes("No authentication token") || (error instanceof AxiosError && error.response?.status === 401)) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    try {
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value);
        }
      });
      if (profilePic) {
        formDataToSend.append("profilePic", profilePic);
      }
      if (additionalFile) {
        formDataToSend.append("additionalFile", additionalFile);
      }

      if (isEditMode && currentMember) {
        await axios.patch(
          `${API_BASE_URL}/api/v1/user/update-user/${currentMember._id}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "x-admin-frontend": "true",
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast({
          title: "Success",
          description: "Member updated successfully",
        });
      } else {
        await axios.post(
          `${API_BASE_URL}/api/v1/user/register`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "x-admin-frontend": "true",
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast({
          title: "Success",
          description: "Member created successfully",
        });
      }
      fetchMembers();
      resetFormAndCloseModal();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to save member"
          : error instanceof Error
          ? error.message
          : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      if (errorMessage.includes("No authentication token") || (error instanceof AxiosError && error.response?.status === 401)) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this member?")) {
      return;
    }

    try {
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      await axios.delete(
        `${API_BASE_URL}/api/v1/user/delete-user/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-admin-frontend": "true",
          },
        }
      );
      toast({
        title: "Success",
        description: "Member deleted successfully",
      });
      fetchMembers();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to delete member"
          : error instanceof Error
          ? error.message
          : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      if (errorMessage.includes("No authentication token") || (error instanceof AxiosError && error.response?.status === 401)) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      await axios.post(
        `${API_BASE_URL}/api/v1/user/approve-membership/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-admin-frontend": "true",
          },
        }
      );
      toast({
        title: "Success",
        description: "Membership approved successfully",
      });
      fetchMembers();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to approve membership"
          : error instanceof Error
          ? error.message
          : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      if (errorMessage.includes("No authentication token") || (error instanceof AxiosError && error.response?.status === 401)) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleDecline = async (id: string) => {
    if (!window.confirm("Are you sure you want to decline this membership? This will permanently delete the user's record.")) {
      return;
    }
    try {
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      await axios.post(
        `${API_BASE_URL}/api/v1/user/decline-membership/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-admin-frontend": "true",
          },
        }
      );
      toast({
        title: "Success",
        description: "Membership declined and user deleted successfully",
      });
      fetchMembers();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to decline membership and delete user"
          : error instanceof Error
          ? error.message
          : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      if (errorMessage.includes("No authentication token") || (error instanceof AxiosError && error.response?.status === 401)) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const resetFormAndCloseModal = () => {
    setFormData({
      employeeId: "",
      username: "",
      surname: "",
      address: "",
      province: "",
      district: "",
      municipality: "",
      wardNumber: "",
      tole: "",
      telephoneNumber: "",
      mobileNumber: "",
      dob: "",
      postAtRetirement: "",
      pensionLeaseNumber: "",
      office: "",
      serviceStartDate: "",
      serviceRetirementDate: "",
      dateOfFillUp: "",
      place: "",
      email: "",
      role: "user",
      password: "",
    });
    setProfilePic(null);
    setAdditionalFile(null);
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
        <h1 className="text-3xl font-bold text-gray-800">Members</h1>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleExportMembers}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetImportState();
              setIsImportDialogOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Import
          </Button>
          <Button
            onClick={() => {
              setIsEditMode(false);
              setIsModalOpen(true);
            }}
            className="bg-gray-800 hover:bg-gray-700"
          >
            + Add Member
          </Button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <Label htmlFor="statusFilter" className="text-sm font-medium mr-2">
          Filter by Membership Status:
        </Label>
        <Select
          value={statusFilter}
          onValueChange={(value: "pending" | "approved" | "all") => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Membership No.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    No members found.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell>{member.employeeId}</TableCell>
                    <TableCell className="font-medium">
                      {member.username} {member.surname}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.mobileNumber}</TableCell>
                    <TableCell>{member.membershipNumber}</TableCell>
                    <TableCell className="capitalize">{member.membershipStatus}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell className="text-right">
                      {member.membershipStatus === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => handleApprove(member._id)}
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleDecline(member._id)}
                            className="text-red-600 hover:text-red-900 mr-2"
                          >
                            Decline
                          </Button>
                        </>
                      )}
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

      <Dialog
        open={isImportDialogOpen}
        onOpenChange={(open) => {
          setIsImportDialogOpen(open);
          if (!open) {
            resetImportState();
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import Members from Excel</DialogTitle>
            <DialogDescription>
              Upload an .xlsx file that includes the required columns. Rows missing essential data
              will be skipped during import.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="memberImportFile">Upload .xlsx File</Label>
              <Input
                id="memberImportFile"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportFileChange}
              />
              {importFile && (
                <p className="text-xs text-gray-600">
                  Selected file: <strong>{importFile.name}</strong>
                </p>
              )}
              {importError && (
                <p className="text-xs text-red-500">{importError}</p>
              )}
              {parsedImportRows.length > 0 && !importError && (
                <p className="text-xs text-green-600">
                  Detected {parsedImportRows.length} member record(s) ready for import.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetImportState();
                  setIsImportDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleImportSubmit}
                disabled={importing || parsedImportRows.length === 0}
              >
                {importing ? "Importing..." : "Import"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Member Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {isEditMode ? "Edit Member" : "Add Member"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update member details" : "Fill in the member details"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Personal Information */}
              <div className="col-span-2">
                <h3 className="font-medium mb-2">Personal Information</h3>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="employeeId" className="text-sm font-medium">
                      Employee ID
                    </Label>
                    <Input
                      id="employeeId"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      First Name
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="surname" className="text-sm font-medium">
                      Surname
                    </Label>
                    <Input
                      id="surname"
                      name="surname"
                      value={formData.surname}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="dob" className="text-sm font-medium">
                      Date of Birth
                    </Label>
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="role" className="text-sm font-medium">
                      Role
                    </Label>
                    <Select
                      name="role"
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {!isEditMode && (
                    <div className="grid gap-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}

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
                      required={!isEditMode}
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
                    <Label
                      htmlFor="additionalFile"
                      className="text-sm font-medium"
                    >
                      Additional File (Image/PDF/Word)
                    </Label>
                    <Input
                      id="additionalFile"
                      name="additionalFile"
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                    {isEditMode &&
                      currentMember?.files &&
                      currentMember.files.length > 0 && (
                        <a
                          href={currentMember.files[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm"
                        >
                          View Current Additional File
                        </a>
                      )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="col-span-2">
                <h3 className="font-medium mb-2">Contact Information</h3>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="province" className="text-sm font-medium">
                      Province
                    </Label>
                    <Input
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="district" className="text-sm font-medium">
                      District
                    </Label>
                    <Input
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="municipality"
                      className="text-sm font-medium"
                    >
                      Municipality
                    </Label>
                    <Input
                      id="municipality"
                      name="municipality"
                      value={formData.municipality}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="wardNumber" className="text-sm font-medium">
                      Ward Number
                    </Label>
                    <Input
                      id="wardNumber"
                      name="wardNumber"
                      value={formData.wardNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="tole" className="text-sm font-medium">
                      Tole
                    </Label>
                    <Input
                      id="tole"
                      name="tole"
                      value={formData.tole}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="telephoneNumber"
                      className="text-sm font-medium"
                    >
                      Telephone
                    </Label>
                    <Input
                      id="telephoneNumber"
                      name="telephoneNumber"
                      value={formData.telephoneNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="mobileNumber" className="text-sm font-medium">
                      Mobile
                    </Label>
                    <Input
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="col-span-2">
                <h3 className="font-medium mb-2">Employment Information</h3>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="postAtRetirement"
                      className="text-sm font-medium"
                    >
                      Post at Retirement
                    </Label>
                    <Input
                      id="postAtRetirement"
                      name="postAtRetirement"
                      value={formData.postAtRetirement}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="pensionLeaseNumber"
                      className="text-sm font-medium"
                    >
                      Pension Lease Number
                    </Label>
                    <Input
                      id="pensionLeaseNumber"
                      name="pensionLeaseNumber"
                      value={formData.pensionLeaseNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="office" className="text-sm font-medium">
                      Office
                    </Label>
                    <Input
                      id="office"
                      name="office"
                      value={formData.office}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="serviceStartDate"
                      className="text-sm font-medium"
                    >
                      Service Start Date
                    </Label>
                    <Input
                      id="serviceStartDate"
                      name="serviceStartDate"
                      type="date"
                      value={formData.serviceStartDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="serviceRetirementDate"
                      className="text-sm font-medium"
                    >
                      Service Retirement Date
                    </Label>
                    <Input
                      id="serviceRetirementDate"
                      name="serviceRetirementDate"
                      type="date"
                      value={formData.serviceRetirementDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="dateOfFillUp"
                      className="text-sm font-medium"
                    >
                      Date of Fill Up
                    </Label>
                    <Input
                      id="dateOfFillUp"
                      name="dateOfFillUp"
                      type="date"
                      value={formData.dateOfFillUp}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="place" className="text-sm font-medium">
                      Place
                    </Label>
                    <Input
                      id="place"
                      name="place"
                      value={formData.place}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
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

export default Members;
