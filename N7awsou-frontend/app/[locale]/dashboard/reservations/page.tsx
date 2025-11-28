"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    Eye,
    Edit,
    Trash2,
    Download,
    Filter,
    Calendar,
    Users,
    CreditCard,
    Clock,
    MapPin,
    Phone,
    Mail,
    User,
    FileText
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import ContentCard from "@/components/layout/ContentCard";
import DashboardCard from "@/components/dashboard/DashboardCard";
import useAuthStore from "@/store/store";
import { axiosPrivate } from "@/api/axios";

interface Reservation {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    packageName: string;
    packageId: string;
    bookingDate: string;
    travelDate: string;
    numberOfPeople: number;
    totalAmount: number;
    status: "confirmed" | "pending" | "cancelled" | "completed";
    paymentStatus: "paid" | "pending" | "refunded";
    notes?: string;
}



export default function ReservationsPage() {
    const t = useTranslations("reservations");
    const { user, isLoading } = useAuthStore();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const accessToken = localStorage.getItem("accessToken");

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">{t('loading')}</div>
            </div>
        );
    }


    if (!["ADMIN", "VENDEUR", "MANAGER"].includes(user?.role!)) {
        return (
            <PageLayout>
                <ContentCard>
                    <div className="text-center py-8">
                        <p className="text-lg text-gray-600">{t('accessDenied')}</p>
                    </div>
                </ContentCard>
            </PageLayout>
        );
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            confirmed: { className: "bg-green-100 text-green-800 border-green-300", label: t('status.confirmed') },
            pending: { className: "bg-yellow-100 text-yellow-800 border-yellow-300", label: t('status.pending') },
            cancelled: { className: "bg-red-100 text-red-800 border-red-300", label: t('status.cancelled') },
            completed: { className: "bg-blue-100 text-blue-800 border-blue-300", label: t('status.completed') },
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        return <Badge className={config?.className}>{config?.label}</Badge>;
    };


    const fetchData = async () => {
        const response = await axiosPrivate.get("/tours/", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        })

        if (response) {
            const filteredToursWithBuyers = response.data.filter((tour: any) => tour.Payments.length > 0);
            const reservationsData = filteredToursWithBuyers.flatMap((tour: any) =>
                tour.Payments.map((tt: any) => ({
                    id: tt.id,
                    customerName: tt.user.username,
                    email: tt.user.email || '',
                    phone: tt.user.phone || '',
                    packageName: tour.name || '',
                    packageId: tour.id,
                    bookingDate: tt.createdAt || new Date().toISOString(),
                    travelDate: tour.startDate || new Date().toISOString(),
                    numberOfPeople: tt.numberOfPeople || 1,
                    totalAmount: tour.price * tt.numberOfPeople || 0,
                    status:'confirmed',
                    paymentStatus: "paid",
                    notes: tt.notes || ''
                }))
            );
            setReservations(reservationsData);
        }
    }

    const getPaymentStatusBadge = (status: string) => {
        const statusConfig = {
            paid: { className: "bg-green-100 text-green-800 border-green-300", label: t('paymentStatus.paid') },
            pending: { className: "bg-orange-100 text-orange-800 border-orange-300", label: t('paymentStatus.pending') },
            refunded: { className: "bg-gray-100 text-gray-800 border-gray-300", label: t('paymentStatus.refunded') },
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        return <Badge className={config?.className}>{config?.label}</Badge>;
    };


    const filteredReservations = reservations.filter(reservation => {
        const matchesSearch = reservation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reservation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reservation.packageName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || reservation.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    useEffect(() => {
        fetchData();
    }, [user]);

    const totalRevenue = reservations
        .filter(r => r.paymentStatus === "paid")
        .reduce((sum, r) => sum + r.totalAmount, 0);

    const statusCounts = {
        confirmed: reservations.filter(r => r.status === "confirmed").length,
        pending: reservations.filter(r => r.status === "pending").length,
        completed: reservations.filter(r => r.status === "completed").length,
        cancelled: reservations.filter(r => r.status === "cancelled").length,
    };

    return (
        <PageLayout>
            <div className="space-y-8">
                {/* Header */}
                <PageHeader
                    title={t('title')}
                    subtitle={t('subtitle')}
                />

                {/* Quick Stats */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <DashboardCard
                        title={t('stats.totalReservations')}
                        value={reservations.length}
                        icon={FileText}
                        trend={{ value: "+12%", isPositive: true }}
                    />
                    <DashboardCard
                        title={t('stats.confirmedBookings')}
                        value={statusCounts.confirmed}
                        icon={Calendar}
                        trend={{ value: "+8%", isPositive: true }}
                    />
                    <DashboardCard
                        title={t('stats.totalRevenue')}
                        value={`€${totalRevenue.toLocaleString()}`}
                        icon={CreditCard}
                        trend={{ value: "+15%", isPositive: true }}
                    />
                    <DashboardCard
                        title={t('stats.pendingReservations')}
                        value={statusCounts.pending}
                        icon={Clock}
                        trend={{ value: "-2", isPositive: false }}
                    />
                </div>

                {/* Search and Filters */}
                <ContentCard>
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <Input
                                placeholder={t('searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white border-gray-300 focus:border-[#FEAC19] focus:ring-[#FEAC19] h-12"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40 bg-white border-gray-300 h-12">
                                    <SelectValue placeholder={t('filter.placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('filter.all')}</SelectItem>
                                    <SelectItem value="confirmed">{t('filter.confirmed')}</SelectItem>
                                    <SelectItem value="pending">{t('filter.pending')}</SelectItem>
                                    <SelectItem value="completed">{t('filter.completed')}</SelectItem>
                                    <SelectItem value="cancelled">{t('filter.cancelled')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" className="bg-white border-gray-300 hover:bg-gray-50 h-12">
                                <Filter className="w-5 h-5 mr-2" />
                                {t('moreFilters')}
                            </Button>
                            <Button variant="outline" className="bg-white border-gray-300 hover:bg-gray-50 h-12">
                                <Download className="w-5 h-5 mr-2" />
                                {t('export')}
                            </Button>
                        </div>
                    </div>
                </ContentCard>

                {/* Reservations Table */}
                <ContentCard>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">{t('table.title')}</h3>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {t('table.count', { count: filteredReservations.length })}
                            </Badge>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/80">
                                        <TableHead className="font-semibold text-gray-700">{t('table.headers.reservationId')}</TableHead>
                                        <TableHead className="font-semibold text-gray-700">{t('table.headers.customer')}</TableHead>
                                        <TableHead className="font-semibold text-gray-700">{t('table.headers.package')}</TableHead>
                                        <TableHead className="font-semibold text-gray-700">{t('table.headers.travelDate')}</TableHead>
                                        <TableHead className="font-semibold text-gray-700">{t('table.headers.guests')}</TableHead>
                                        <TableHead className="font-semibold text-gray-700">{t('table.headers.amount')}</TableHead>
                                        <TableHead className="font-semibold text-gray-700">{t('table.headers.status')}</TableHead>
                                        <TableHead className="font-semibold text-gray-700">{t('table.headers.payment')}</TableHead>
                                        <TableHead className="font-semibold text-gray-700">{t('table.headers.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReservations.map((reservation) => (
                                        <TableRow key={reservation.id} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell>
                                                <div className="font-medium text-gray-800">{reservation.id}</div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(reservation.bookingDate).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-gray-500" />
                                                        <span className="font-medium text-gray-800">{reservation.customerName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail className="h-3 w-3" />
                                                        <span>{reservation.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone className="h-3 w-3" />
                                                        <span>{reservation.phone}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-500" />
                                                    <span className="font-medium text-gray-800">{reservation.packageName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-600">
                                                        {new Date(reservation.travelDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-gray-500" />
                                                    <span className="font-medium text-gray-800">{reservation.numberOfPeople}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4 text-gray-500" />
                                                    <span className="font-semibold text-gray-800">
                                                        €{reservation.totalAmount.toLocaleString()}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(reservation.status)}
                                            </TableCell>
                                            <TableCell>
                                                {getPaymentStatusBadge(reservation.paymentStatus)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="bg-white border-gray-300 hover:bg-gray-50"
                                                        title={t('actions.view')}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="bg-white border-gray-300 hover:bg-gray-50"
                                                        title={t('actions.edit')}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    {reservation.status === "pending" && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="bg-white border-red-300 text-red-600 hover:bg-red-50"
                                                            title={t('actions.cancel')}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </ContentCard>
            </div>
        </PageLayout>
    );
}
