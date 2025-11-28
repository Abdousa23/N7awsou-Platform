"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  Users,
  Edit,
  Plus,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  MapPin,
  TrendingUp,
  Clock,
  Eye
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import ContentCard from "@/components/layout/ContentCard";
import DashboardCard from "@/components/dashboard/DashboardCard";
import useAuthStore from "@/store/store";

interface PackageAvailability {
  id: string;
  packageName: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  maxSeats: number;
  bookedSeats: number;
  availableSeats: number;
  status: "available" | "full" | "cancelled";
  price: number;
}

// Mock data
const mockAvailability: PackageAvailability[] = [
  {
    id: "1",
    packageName: "Paris Weekend",
    destination: "Paris, France",
    departureDate: "2024-01-15",
    returnDate: "2024-01-17",
    maxSeats: 20,
    bookedSeats: 12,
    availableSeats: 8,
    status: "available",
    price: 450,
  },
  {
    id: "2",
    packageName: "Rome Discovery",
    destination: "Rome, Italy",
    departureDate: "2024-01-18",
    returnDate: "2024-01-22",
    maxSeats: 15,
    bookedSeats: 7,
    availableSeats: 8,
    status: "available",
    price: 680,
  },
  {
    id: "3",
    packageName: "Barcelona Tour",
    destination: "Barcelona, Spain",
    departureDate: "2024-01-20",
    returnDate: "2024-01-24",
    maxSeats: 12,
    bookedSeats: 11,
    availableSeats: 1,
    status: "available",
    price: 590,
  },
  {
    id: "4",
    packageName: "London Explorer",
    destination: "London, UK",
    departureDate: "2024-01-25",
    returnDate: "2024-01-28",
    maxSeats: 18,
    bookedSeats: 18,
    availableSeats: 0,
    status: "full",
    price: 520,
  },
];

export default function AvailabilityPage() {
  const { user, isLoading } = useAuthStore();
  const [availability, setAvailability] = useState<PackageAvailability[]>(mockAvailability);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PackageAvailability | null>(null);
  const [formData, setFormData] = useState<Partial<PackageAvailability>>({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  

  if (!["ADMIN", "VENDEUR"].includes(user?.role!)) {
    return (
      <PageLayout>
        <ContentCard>
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">Access denied. You don't have permission to view this page.</p>
          </div>
        </ContentCard>
      </PageLayout>
    );
  }

  const handleEditAvailability = (item: PackageAvailability) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleAddAvailability = () => {
    setEditingItem(null);
    setFormData({});
    setIsDialogOpen(true);
  };

  const handleSaveAvailability = () => {
    if (editingItem) {
      // Update existing
      setAvailability(
        availability.map((item) =>
          item.id === editingItem.id
            ? {
              ...item,
              ...formData,
              availableSeats: (formData.maxSeats || item.maxSeats) - (formData.bookedSeats || item.bookedSeats),
            }
            : item
        )
      );
    } else {
      // Add new
      const newItem: PackageAvailability = {
        id: Date.now().toString(),
        packageName: formData.packageName || "",
        destination: formData.destination || "",
        departureDate: formData.departureDate || "",
        returnDate: formData.returnDate || "",
        maxSeats: formData.maxSeats || 0,
        bookedSeats: 0,
        availableSeats: formData.maxSeats || 0,
        status: "available",
        price: formData.price || 0,
      };
      setAvailability([...availability, newItem]);
    }
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: string, availableSeats: number) => {
    if (status === "full") {
      return <Badge variant="destructive">Full</Badge>;
    } else if (availableSeats <= 3) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          Low Availability
        </Badge>
      );
    } else {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Available</Badge>;
    }
  };

  const getAvailabilityColor = (availableSeats: number, maxSeats: number) => {
    const percentage = (availableSeats / maxSeats) * 100;
    if (percentage === 0) return "bg-red-500";
    if (percentage <= 25) return "bg-yellow-500";
    return "bg-green-500";
  };

  const lowAvailabilityItems = availability.filter(
    (item) => item.availableSeats <= 3 && item.availableSeats > 0
  );

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Header */}
        <PageHeader
          title="Dates & Availability"
          subtitle="Manage travel dates, seat limits, and package availability"
        />

        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleAddAvailability}
            className="bg-gradient-to-r from-[#FEAC19] to-orange-400 hover:from-[#FEAC19]/90 hover:to-orange-400/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Date
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Total Departures"
            value={availability.length}
            icon={Calendar}
            trend={{ value: "+12%", isPositive: true }}
          />
          <DashboardCard
            title="Available Trips"
            value={availability.filter((a) => a.status === "available").length}
            icon={CalendarDays}
            trend={{ value: "+8%", isPositive: true }}
          />
          <DashboardCard
            title="Total Bookings"
            value={availability.reduce((sum, a) => sum + a.bookedSeats, 0)}
            icon={Users}
            trend={{ value: "+15%", isPositive: true }}
          />
          <DashboardCard
            title="Available Seats"
            value={availability.reduce((sum, a) => sum + a.availableSeats, 0)}
            icon={TrendingUp}
            trend={{ value: "-5%", isPositive: false }}
          />
        </div>

        {/* Low Availability Alert */}
        {lowAvailabilityItems.length > 0 && (
          <ContentCard className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-800 mb-2">Low Availability Alert</h3>
                <p className="text-amber-700 mb-4">
                  {lowAvailabilityItems.length} departure{lowAvailabilityItems.length > 1 ? 's have' : ' has'} limited seats available.
                </p>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {lowAvailabilityItems.map((item) => (
                    <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-amber-200">
                      <div className="font-medium text-gray-800">{item.packageName}</div>
                      <div className="text-sm text-gray-600">{item.destination}</div>
                      <div className="text-sm font-semibold text-amber-700 mt-1">
                        Only {item.availableSeats} seat{item.availableSeats > 1 ? 's' : ''} left
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ContentCard>
        )}

        {/* Search and Filters */}
        <ContentCard>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                placeholder="Search packages or destinations..."
                className="pl-10 bg-white border-gray-300 focus:border-[#FEAC19] focus:ring-[#FEAC19] h-12"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="bg-white border-gray-300 hover:bg-gray-50 h-12">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </Button>
              <Button variant="outline" className="bg-white border-gray-300 hover:bg-gray-50 h-12">
                <Calendar className="w-5 h-5 mr-2" />
                Date Range
              </Button>
            </div>
          </div>
        </ContentCard>

        {/* Availability Table */}
        <ContentCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Package Availability</h3>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {availability.length} Total Packages
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead className="font-semibold text-gray-700">Package</TableHead>
                    <TableHead className="font-semibold text-gray-700">Destination</TableHead>
                    <TableHead className="font-semibold text-gray-700">Departure</TableHead>
                    <TableHead className="font-semibold text-gray-700">Duration</TableHead>
                    <TableHead className="font-semibold text-gray-700">Capacity</TableHead>
                    <TableHead className="font-semibold text-gray-700">Availability</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Price</TableHead>
                    <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availability.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell>
                        <div className="font-medium text-gray-800">{item.packageName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">{item.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">
                            {new Date(item.departureDate).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">
                            {Math.ceil(
                              (new Date(item.returnDate).getTime() -
                                new Date(item.departureDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                            )} days
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-gray-500" />
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">{item.maxSeats} total</span>
                            <span className="text-sm text-gray-500">{item.bookedSeats} booked</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${getAvailabilityColor(
                                item.availableSeats,
                                item.maxSeats
                              )}`}
                              style={{
                                width: `${((item.maxSeats - item.availableSeats) / item.maxSeats) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="font-semibold text-gray-800 min-w-[3rem]">
                            {item.availableSeats}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item.status, item.availableSeats)}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-800">
                          €{item.price.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAvailability(item)}
                            className="bg-white border-gray-300 hover:bg-gray-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white border-gray-300 hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ContentCard>

        {/* Edit/Add Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800">
                {editingItem ? "Edit Availability" : "Add New Date"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingItem
                  ? "Update the availability information for this package."
                  : "Add a new departure date and set availability limits."
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="packageName" className="text-sm font-semibold text-gray-700">
                    Package Name
                  </Label>
                  <Input
                    id="packageName"
                    value={formData.packageName || ""}
                    onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                    placeholder="Enter package name"
                    className="bg-white border-gray-300 focus:border-[#FEAC19] focus:ring-[#FEAC19]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination" className="text-sm font-semibold text-gray-700">
                    Destination
                  </Label>
                  <Input
                    id="destination"
                    value={formData.destination || ""}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="Enter destination"
                    className="bg-white border-gray-300 focus:border-[#FEAC19] focus:ring-[#FEAC19]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departureDate" className="text-sm font-semibold text-gray-700">
                      Departure Date
                    </Label>
                    <Input
                      id="departureDate"
                      type="date"
                      value={formData.departureDate || ""}
                      onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                      className="bg-white border-gray-300 focus:border-[#FEAC19] focus:ring-[#FEAC19]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="returnDate" className="text-sm font-semibold text-gray-700">
                      Return Date
                    </Label>
                    <Input
                      id="returnDate"
                      type="date"
                      value={formData.returnDate || ""}
                      onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                      className="bg-white border-gray-300 focus:border-[#FEAC19] focus:ring-[#FEAC19]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxSeats" className="text-sm font-semibold text-gray-700">
                      Max Seats
                    </Label>
                    <Input
                      id="maxSeats"
                      type="number"
                      value={formData.maxSeats || ""}
                      onChange={(e) => setFormData({ ...formData, maxSeats: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="bg-white border-gray-300 focus:border-[#FEAC19] focus:ring-[#FEAC19]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-semibold text-gray-700">
                      Price (€)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price || ""}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="bg-white border-gray-300 focus:border-[#FEAC19] focus:ring-[#FEAC19]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="bg-white border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAvailability}
                className="bg-gradient-to-r from-[#FEAC19] to-orange-400 hover:from-[#FEAC19]/90 hover:to-orange-400/90 text-white font-semibold"
              >
                {editingItem ? "Update" : "Add"} Availability
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
