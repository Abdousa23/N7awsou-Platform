"use client";

import { useState } from "react";
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
    Edit,
    Save,
    TrendingUp,
    TrendingDown,
    Plus,
    Search,
    Filter,
    DollarSign,
    Percent,
    Users,
    Calendar,
    Eye,
    Settings
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import ContentCard from "@/components/layout/ContentCard";
import DashboardCard from "@/components/dashboard/DashboardCard";
import useAuthStore from "@/store/store";
import { Role } from "@/types";
import { useTranslations } from "next-intl";

interface PackagePricing {
    id: string;
    name: string;
    destination: string;
    basePrice: number;
    seasonalPrices: {
        high: number;
        medium: number;
        low: number;
    };
    groupDiscounts: {
        groups5to10: number;
        groups11to20: number;
        groups20plus: number;
    };
    lastUpdated: string;
    status: "active" | "inactive";
}

// Mock data
const mockPricing: PackagePricing[] = [
    {
        id: "1",
        name: "Paris Weekend",
        destination: "Paris, France",
        basePrice: 450,
        seasonalPrices: {
            high: 550,
            medium: 450,
            low: 350,
        },
        groupDiscounts: {
            groups5to10: 5,
            groups11to20: 10,
            groups20plus: 15,
        },
        lastUpdated: "2024-01-10",
        status: "active",
    },
    {
        id: "2",
        name: "Rome Discovery",
        destination: "Rome, Italy",
        basePrice: 680,
        seasonalPrices: {
            high: 780,
            medium: 680,
            low: 580,
        },
        groupDiscounts: {
            groups5to10: 5,
            groups11to20: 12,
            groups20plus: 18,
        },
        lastUpdated: "2024-01-08",
        status: "active",
    },
    {
        id: "3",
        name: "Barcelona Tour",
        destination: "Barcelona, Spain",
        basePrice: 590,
        seasonalPrices: {
            high: 690,
            medium: 590,
            low: 490,
        },
        groupDiscounts: {
            groups5to10: 5,
            groups11to20: 10,
            groups20plus: 15,
        },
        lastUpdated: "2024-01-05",
        status: "active",
    },
    {
        id: "4",
        name: "London Explorer",
        destination: "London, UK",
        basePrice: 520,
        seasonalPrices: {
            high: 620,
            medium: 520,
            low: 420,
        },
        groupDiscounts: {
            groups5to10: 5,
            groups11to20: 10,
            groups20plus: 15,
        },
        lastUpdated: "2024-01-01",
        status: "inactive",
    },
];

export default function PricingPage() {
    const t = useTranslations("pricing");
    const { user, isLoading } = useAuthStore();
    const [pricing, setPricing] = useState<PackagePricing[]>(mockPricing);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PackagePricing | null>(null);
    const [formData, setFormData] = useState<Partial<PackagePricing>>({});

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">{t("loading")}</div>
            </div>
        );
    }

    if (!["ADMIN", "VENDEUR"].includes(user?.role!)) {
        return (
            <PageLayout>
                <ContentCard>
                    <div className="text-center py-8">
                        <p className="text-lg text-gray-600">{t("accessDenied")}</p>
                    </div>
                </ContentCard>
            </PageLayout>
        );
    }

    const handleEditPricing = (item: PackagePricing) => {
        setEditingItem(item);
        setFormData(item);
        setIsDialogOpen(true);
    };

    const handleAddPricing = () => {
        setEditingItem(null);
        setFormData({
            seasonalPrices: { high: 0, medium: 0, low: 0 },
            groupDiscounts: { groups5to10: 5, groups11to20: 10, groups20plus: 15 }
        });
        setIsDialogOpen(true);
    };

    const handleSavePricing = () => {
        if (editingItem) {
            // Update existing
            setPricing(
                pricing.map((item) =>
                    item.id === editingItem.id
                        ? {
                            ...item,
                            ...formData,
                            lastUpdated: new Date().toISOString().split('T')[0],
                        }
                        : item
                )
            );
        } else {
            // Add new
            const newItem: PackagePricing = {
                id: Date.now().toString(),
                name: formData.name || "",
                destination: formData.destination || "",
                basePrice: formData.basePrice || 0,
                seasonalPrices: formData.seasonalPrices || { high: 0, medium: 0, low: 0 },
                groupDiscounts: formData.groupDiscounts || { groups5to10: 5, groups11to20: 10, groups20plus: 15 },
                lastUpdated: new Date().toISOString().split('T')[0],
                status: "active",
            };
            setPricing([...pricing, newItem]);
        }
        setIsDialogOpen(false);
    };

    const getStatusBadge = (status: string) => {
        return status === "active"
            ? <Badge className="bg-green-100 text-green-800 border-green-300">{t("statusActive")}</Badge>
            : <Badge variant="secondary">{t("statusInactive")}</Badge>;
    };

    const getPriceChange = (current: number, previous: number) => {
        const change = ((current - previous) / previous) * 100;
        return {
            value: `${change.toFixed(1)}%`,
            isPositive: change >= 0
        };
    };

    const averagePrice = pricing.reduce((sum, item) => sum + item.basePrice, 0) / pricing.length;
    const activePricing = pricing.filter(item => item.status === "active").length;

    return (
        <PageLayout>
            <div className="space-y-8">
                {/* Header */}
                <PageHeader
                    title={t("title")}
                    subtitle={t("subtitle")}
                />

                {/* Action Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleAddPricing}
                        className="bg-gradient-to-r from-[#FEAC19] to-orange-400 hover:from-[#FEAC19]/90 hover:to-orange-400/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        {t("addNewPricing")}
                    </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <DashboardCard
                        title={t("totalPackages")}
                        value={pricing.length}
                        icon={DollarSign}
                        trend={{ value: "+3", isPositive: true }}
                    />
                    <DashboardCard
                        title={t("activePricing")}
                        value={activePricing}
                        icon={Settings}
                        trend={{ value: `${Math.round((activePricing / pricing.length) * 100)}%`, isPositive: true }}
                    />
                    <DashboardCard
                        title={t("averagePrice")}
                        value={`€${Math.round(averagePrice)}`}
                        icon={TrendingUp}
                        trend={{ value: "+8%", isPositive: true }}
                    />
                    <DashboardCard
                        title={t("revenuePotential")}
                        value={`€${Math.round(pricing.reduce((sum, item) => sum + item.seasonalPrices.high, 0))}`}
                        icon={Percent}
                        trend={{ value: "+12%", isPositive: true }}
                    />
                </div>

                {/* Search and Filters */}
                <ContentCard>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <Input
                                placeholder={t("searchPlaceholder")}
                                className="pl-10 bg-white border-gray-300 focus:border-[#FEAC19] focus:ring-[#FEAC19] h-12"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="bg-white border-gray-300 hover:bg-gray-50 h-12">
                                <Filter className="w-5 h-5 mr-2" />
                                {t("filters")}
                            </Button>
                            <Button variant="outline" className="bg-white border-gray-300 hover:bg-gray-50 h-12">
                                <Calendar className="w-5 h-5 mr-2" />
                                {t("export")}
                            </Button>
                        </div>
                    </div>
                </ContentCard>

                {/* Pricing Table */}
                <ContentCard>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">{t("packagePricingTitle")}</h3>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {t("totalPackagesBadge", { count: pricing.length })}
                            </Badge>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/80">
                                        <TableHead className="font-semibold text-gray-700">{t("table.package")}</TableHead>
                                        <TableHead className="font-semibold text-gray-700">{t("table.basePrice")}</TableHead>
                                        <TableHead className="font-semibold text-gray-700">{t("table.seasonalPricing")}</TableHead>
                                        <TableHead className="font-semibold text-gray-700">{t("table.groupDiscounts")}</TableHead>
                                        <TableHead className="font-semibold text-gray-700">{t("table.status")}</TableHead>
                                        <TableHead className="font-semibold text-gray-700">{t("table.lastUpdated")}</TableHead>
                                        <TableHead className="font-semibold text-gray-700">{t("table.actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pricing.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-gray-800">{item.name}</div>
                                                    <div className="text-sm text-gray-600">{item.destination}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4 text-gray-500" />
                                                    <span className="font-semibold text-gray-800">€{item.basePrice}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-red-600">{t("table.highSeason")} €{item.seasonalPrices.high}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-yellow-600">{t("table.mediumSeason")} €{item.seasonalPrices.medium}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-green-600">{t("table.lowSeason")} €{item.seasonalPrices.low}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Users className="h-3 w-3 text-gray-500" />
                                                        <span>{t("table.group5to10")} {item.groupDiscounts.groups5to10}%</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Users className="h-3 w-3 text-gray-500" />
                                                        <span>{t("table.group11to20")} {item.groupDiscounts.groups11to20}%</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Users className="h-3 w-3 text-gray-500" />
                                                        <span>{t("table.group20plus")} {item.groupDiscounts.groups20plus}%</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(item.status)}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-600">
                                                    {new Date(item.lastUpdated).toLocaleDateString()}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditPricing(item)}
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
                    <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-800">
                                {editingItem ? t("dialog.editTitle") : t("dialog.addTitle")}
                            </DialogTitle>
                            <DialogDescription className="text-gray-600">
                                {editingItem
                                    ? t("dialog.editDescription")
                                    : t("dialog.addDescription")
                                }
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4 max-h-96 overflow-y-auto">
                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                                            {t("dialog.packageName")}
                                        </Label>
                                        <Input
                                            id="name"
                                            value={formData.name || ""}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder={t("dialog.packageNamePlaceholder")}
                                            className="bg-white border-gray-300 focus:border-[#FEAC19] focus:ring-[#FEAC19]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="destination" className="text-sm font-semibold text-gray-700">
                                            {t("dialog.destination")}
                                        </Label>
                                        <Input
                                            id="destination"
                                            value={formData.destination || ""}
                                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                            placeholder={t("dialog.destinationPlaceholder")}
                                            className="bg-white border-gray-300 focus:border-[#FEAC19] focus:ring-[#FEAC19]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="basePrice" className="text-sm font-semibold text-gray-700">
                                        {t("dialog.basePrice")}
                                    </Label>
                                    <Input
                                        id="basePrice"
                                        type="number"
                                        value={formData.basePrice || ""}
                                        onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) || 0 })}
                                        placeholder="0"
                                        className="bg-white border-gray-300 focus:border-[#FEAC19] focus:ring-[#FEAC19]"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-800">{t("dialog.seasonalPricingTitle")}</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-red-600">{t("dialog.highSeason")}</Label>
                                            <Input
                                                type="number"
                                                value={formData.seasonalPrices?.high || ""}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    seasonalPrices: {
                                                        high: parseInt(e.target.value) || 0,
                                                        medium: formData.seasonalPrices?.medium || 0,
                                                        low: formData.seasonalPrices?.low || 0
                                                    }
                                                })}
                                                placeholder="0"
                                                className="bg-white border-gray-300 focus:border-[#FEAC19] focus:ring-[#FEAC19]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-yellow-600">{t("dialog.mediumSeason")}</Label>
                                            <Input
                                                type="number"
                                                value={formData.seasonalPrices?.medium || ""}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    seasonalPrices: {
                                                        high: formData.seasonalPrices?.high || 0,
                                                        medium: parseInt(e.target.value) || 0,
                                                        low: formData.seasonalPrices?.low || 0
                                                    }
                                                })}
                                                placeholder="0"
                                                className="bg-white border-gray-300 focus:border-[#FEAC19] focus:ring-[#FEAC19]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-green-600">{t("dialog.lowSeason")}</Label>
                                            <Input
                                                type="number"
                                                value={formData.seasonalPrices?.low || ""}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    seasonalPrices: {
                                                        high: formData.seasonalPrices?.high || 0,
                                                        medium: formData.seasonalPrices?.medium || 0,
                                                        low: parseInt(e.target.value) || 0
                                                    }
                                                })}
                                                placeholder="0"
                                                className="bg-white border-gray-300 focus:border-[#FEAC19] focus:ring-[#FEAC19]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-800">{t("dialog.groupDiscountsTitle")}</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-gray-700">{t("dialog.group5to10")}</Label>
                                            <Input
                                                type="number"
                                                value={formData.groupDiscounts?.groups5to10 || ""}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    groupDiscounts: {
                                                        groups5to10: parseInt(e.target.value) || 0,
                                                        groups11to20: formData.groupDiscounts?.groups11to20 || 0,
                                                        groups20plus: formData.groupDiscounts?.groups20plus || 0
                                                    }
                                                })}
                                                placeholder="5"
                                                className="bg-white border-gray-300 focus:border-[#FEAC19] focus:ring-[#FEAC19]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-gray-700">{t("dialog.group11to20")}</Label>
                                            <Input
                                                type="number"
                                                value={formData.groupDiscounts?.groups11to20 || ""}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    groupDiscounts: {
                                                        groups5to10: formData.groupDiscounts?.groups5to10 || 0,
                                                        groups11to20: parseInt(e.target.value) || 0,
                                                        groups20plus: formData.groupDiscounts?.groups20plus || 0
                                                    }
                                                })}
                                                placeholder="10"
                                                className="bg-white border-gray-300 focus:border-[#FEAC19] focus:ring-[#FEAC19]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-gray-700">{t("dialog.group20plus")}</Label>
                                            <Input
                                                type="number"
                                                value={formData.groupDiscounts?.groups20plus || ""}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    groupDiscounts: {
                                                        groups5to10: formData.groupDiscounts?.groups5to10 || 0,
                                                        groups11to20: formData.groupDiscounts?.groups11to20 || 0,
                                                        groups20plus: parseInt(e.target.value) || 0
                                                    }
                                                })}
                                                placeholder="15"
                                                className="bg-white border-gray-300 focus:border-[#FEAC19] focus:ring-[#FEAC19]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-white border-gray-300 hover:bg-gray-50">
                                {t("dialog.cancel")}
                            </Button>
                            <Button
                                onClick={handleSavePricing}
                                className="bg-gradient-to-r from-[#FEAC19] to-orange-400 hover:from-[#FEAC19]/90 hover:to-orange-400/90 text-white font-semibold shadow-lg"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {t("dialog.save")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </PageLayout>
    );
}
