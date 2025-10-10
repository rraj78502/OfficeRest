import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Trash2, X, Plus, Eye, Upload } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import axios, { AxiosError } from 'axios';

interface CarouselImage {
  _id: string;
  url: string;
  type: string;
  publicId: string;
  alt: string;
}

interface CarouselData {
  _id: string;
  title: string;
  type: 'home' | 'branch';
  branch?: string;
  images: CarouselImage[];
  isActive: boolean;
  order: number;
  createdAt: string;
}

interface BranchOption {
  value: string;
  label: string;
}

interface BranchSummary {
  slug: string;
  name?: string;
}

interface BranchListResponse {
  success: boolean;
  data: BranchSummary[];
  message: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const carouselTypes = [
  { value: "home", label: "Home Page" },
  { value: "branch", label: "Branch Page" },
];

const Carousel = () => {
  const [carousels, setCarousels] = useState<CarouselData[]>([]);
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [branchOptions, setBranchOptions] = useState<BranchOption[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleApiError = useCallback((error: unknown, defaultMessage: string) => {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || defaultMessage
      : defaultMessage;
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  }, [toast]);

  const fetchCarousels = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/v1/carousel/get-all-carousels`);
      setCarousels(response.data.data);
    } catch (error) {
      handleApiError(error, "Failed to fetch carousels");
    } finally {
      setIsLoading(false);
    }
  }, [handleApiError]);

  const fetchBranchOptions = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to manage branch carousels.",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.get<BranchListResponse>(`${API_BASE_URL}/api/v1/branches`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-admin-frontend': 'true',
        },
      });

      const branchList = response.data?.data ?? [];

      const options: BranchOption[] = branchList.map((branch) => ({
        value: branch.slug,
        label: branch.name ? `${branch.name} Branch` : branch.slug,
      }));

      options.sort((a, b) => a.label.localeCompare(b.label));
      setBranchOptions(options);
    } catch (error) {
      handleApiError(error, "Failed to fetch branches");
    }
  }, [handleApiError, toast]);

  useEffect(() => {
    fetchCarousels();
    fetchBranchOptions();
  }, [fetchCarousels, fetchBranchOptions]);

  const handleDeleteImage = async (id: string, imageId: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/api/v1/carousel/delete-carousel-image/${id}/${imageId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      // Refresh carousels to reflect changes
      await fetchCarousels();
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      handleApiError(error, "Failed to delete image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCarousel = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this entire carousel?')) return;

    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/api/v1/carousel/delete-carousel/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setCarousels((prevCarousels) => prevCarousels.filter((carousel) => carousel._id !== id));
      toast({
        title: "Success",
        description: "Carousel deleted successfully",
      });
    } catch (error) {
      handleApiError(error, "Failed to delete carousel");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      setIsLoading(true);
      await axios.put(`${API_BASE_URL}/api/v1/carousel/update-carousel/${id}`, 
        { isActive: !currentState },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      setCarousels((prevCarousels) =>
        prevCarousels.map((carousel) =>
          carousel._id === id ? { ...carousel, isActive: !currentState } : carousel
        )
      );
      
      toast({
        title: "Success",
        description: `Carousel ${!currentState ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      handleApiError(error, "Failed to update carousel status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadCarousel = async (e: React.FormEvent, files: File[], title: string, type: string, branch?: string) => {
    e.preventDefault();

    if (!files || files.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one image",
        variant: "destructive",
      });
      return;
    }

    if (files.length > 10) {
      toast({
        title: "Validation Error",
        description: "You can upload a maximum of 10 images at a time",
        variant: "destructive",
      });
      return;
    }

    if (!title) {
      toast({
        title: "Validation Error",
        description: "Please provide a title for the carousel",
        variant: "destructive",
      });
      return;
    }

    if (!type) {
      toast({
        title: "Validation Error",
        description: "Please select a carousel type",
        variant: "destructive",
      });
      return;
    }

    if (type === 'branch' && !branch?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a branch for branch carousel",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      formData.append('title', title);
      formData.append('type', type);
      const normalizedBranch = branch ? branch.trim().toLowerCase() : undefined;
      if (normalizedBranch) formData.append('branch', normalizedBranch);

      const response = await axios.post(`${API_BASE_URL}/api/v1/carousel/upload-carousel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setCarousels((prevCarousels) => [response.data.data, ...prevCarousels]);
      toast({
        title: "Success",
        description: `Successfully uploaded carousel with ${response.data.data.images.length} image(s)`,
      });
    } catch (error) {
      handleApiError(error, "Failed to upload carousel");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCarousels = carousels.filter((carousel) => {
    const matchesTitle = filter ? carousel.title.toLowerCase().includes(filter.toLowerCase()) : true;
    const matchesType = typeFilter === 'all' ? true : carousel.type === typeFilter;
    return matchesTitle && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Carousel Management</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Upload Form */}
          <Card className="p-6 lg:w-1/3 space-y-4">
            <h2 className="text-xl font-semibold">Upload New Carousel</h2>
            <UploadForm onSubmit={handleUploadCarousel} isLoading={isLoading} branchOptions={branchOptions} />
          </Card>

          {/* Carousel Section */}
          <div className="lg:w-2/3 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center gap-4">
                <h2 className="text-xl font-semibold">Carousels</h2>
                <div className="flex gap-2">
                  <Input
                    type="search"
                    placeholder="Filter carousels by title..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="max-w-xs"
                  />
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {carouselTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoading && !carousels.length ? (
                <div className="text-center py-12">Loading carousels...</div>
              ) : filteredCarousels.length === 0 ? (
                <div className="text-center py-12 border rounded-md bg-gray-50">
                  <p>No carousels found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredCarousels.map((carousel) => (
                    <Card key={carousel._id} className="p-4 relative">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{carousel.title}</h3>
                          <p className="text-sm text-gray-500">
                            Type: {carousel.type === 'home' ? 'Home Page' : 'Branch Page'}
                            {carousel.branch && ` - ${(branchOptions.find((b) => b.value === carousel.branch)?.label) || carousel.branch}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            Status: <span className={carousel.isActive ? 'text-green-600' : 'text-red-600'}>
                              {carousel.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </p>
                          <p className="text-sm text-gray-500">
                            Images: {carousel.images.length}
                          </p>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(carousel.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(carousel._id, carousel.isActive)}
                            className="p-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="ml-2">{carousel.isActive ? 'Deactivate' : 'Activate'}</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCarousel(carousel._id)}
                            className="p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="ml-2">Delete Carousel</span>
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {carousel.images.map((image) => (
                          <div key={image._id} className="relative group">
                            <img
                              src={image.url}
                              alt={image.alt || carousel.title}
                              className="w-full h-48 object-cover rounded-md"
                            />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteImage(carousel._id, image._id)}
                                className="p-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Separate upload form component
const UploadForm = ({
  onSubmit,
  isLoading,
  branchOptions,
}: {
  onSubmit: (e: React.FormEvent, files: File[], title: string, type: string, branch?: string) => void;
  isLoading: boolean;
  branchOptions: BranchOption[];
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('home');
  const [branch, setBranch] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (type === 'branch' && !branch && branchOptions.length > 0) {
      setBranch(branchOptions[0].value);
    }
  }, [type, branch, branchOptions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const totalFiles = files.length + newFiles.length;

      if (totalFiles > 10) {
        toast({
          title: "Validation Error",
          description: `You can select a maximum of 10 images. Currently selected: ${files.length}`,
          variant: "destructive",
        });
        return;
      }

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      const newUrls = newFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prevUrls) => [...prevUrls, ...newUrls]);
    }
  };

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPreviewUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length > 0) {
      onSubmit(e, files, title, type, type === 'branch' ? branch : undefined);
      setTitle('');
      setType('home');
      setBranch('');
      setFiles([]);
      setPreviewUrls((prevUrls) => {
        prevUrls.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
      const fileInput = document.getElementById('carouselFiles') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="carouselTitle">Carousel Title</Label>
        <Input
          id="carouselTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title for carousel"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Carousel Type</Label>
        <Select
          value={type}
          onValueChange={(value) => {
            setType(value);
            if (value !== 'branch') {
              setBranch('');
            }
          }}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {carouselTypes.map((carouselType) => (
              <SelectItem key={carouselType.value} value={carouselType.value}>
                {carouselType.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {type === 'branch' && (
        <div className="space-y-2">
          <Label htmlFor="branch">Branch</Label>
          <Select value={branch} onValueChange={setBranch}>
            <SelectTrigger id="branch" disabled={branchOptions.length === 0}>
              <SelectValue placeholder={branchOptions.length ? "Select branch" : "No branches available"} />
            </SelectTrigger>
            <SelectContent>
              {branchOptions.length === 0 ? (
                <SelectItem value="" disabled>
                  No branches found
                </SelectItem>
              ) : (
                branchOptions.map((branchOption) => (
                  <SelectItem key={branchOption.value} value={branchOption.value}>
                    {branchOption.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="carouselFiles">Image Files (Max 10, {files.length} selected)</Label>
        <Input
          id="carouselFiles"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="cursor-pointer"
        />
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-2">Previews ({previewUrls.length}):</p>
        <div className="grid grid-cols-2 gap-2">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-md"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 p-1"
                onClick={() => handleRemoveFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || files.length === 0 || (type === 'branch' && !branch)}
      >
        <Upload className="h-4 w-4 mr-2" />
        {isLoading ? 'Uploading...' : `Upload Carousel with ${files.length} Image${files.length > 1 ? 's' : ''}`}
      </Button>
    </form>
  );
};

export default Carousel;
