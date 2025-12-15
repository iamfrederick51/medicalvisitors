"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { VisitorOnlyRoute } from "@/components/VisitorOnlyRoute";
import { Navigation } from "@/components/Navigation";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";

function NewDoctorContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const createDoctor = useMutation(api.doctors.create);
  const createMedicalCenter = useMutation(api.medicalCenters.create);
  const medicalCenters = useQuery(api.medicalCenters.list);

  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCenterIds, setSelectedCenterIds] = useState<Id<"medicalCenters">[]>([]);
  const [showNewCenterForm, setShowNewCenterForm] = useState(false);
  const [newCenter, setNewCenter] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCenter = (centerId: Id<"medicalCenters"> | string) => {
    if (selectedCenterIds.length >= 2) {
      alert(t("doctors.maxCenters"));
      return;
    }
    const typedId = centerId as Id<"medicalCenters">;
    if (!selectedCenterIds.includes(typedId)) {
      setSelectedCenterIds([...selectedCenterIds, typedId]);
    }
  };

  const handleRemoveCenter = (centerId: Id<"medicalCenters">) => {
    setSelectedCenterIds(selectedCenterIds.filter((id) => id !== centerId));
  };

  const handleCreateCenter = async () => {
    if (!newCenter.name || !newCenter.address || !newCenter.city) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }
    try {
      const centerId = await createMedicalCenter({
        name: newCenter.name,
        address: newCenter.address,
        city: newCenter.city,
        phone: newCenter.phone || undefined,
      });
      setSelectedCenterIds([...selectedCenterIds, centerId]);
      setNewCenter({ name: "", address: "", city: "", phone: "" });
      setShowNewCenterForm(false);
    } catch (error) {
      console.error("Error creating center:", error);
      alert("Error al crear el centro médico");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert("Por favor ingresa el nombre del doctor");
      return;
    }
    if (selectedCenterIds.length > 2) {
      alert(t("doctors.maxCenters"));
      return;
    }

    setIsSubmitting(true);
    try {
      await createDoctor({
        name,
        specialty: specialty || undefined,
        email: email || undefined,
        phone: phone || undefined,
        medicalCenterIds: selectedCenterIds,
      });
      router.push("/doctors");
    } catch (error) {
      console.error("Error creating doctor:", error);
      alert("Error al crear el doctor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <VisitorOnlyRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Link href="/doctors" className="text-gray-600 hover:text-gray-800">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-800">
                {t("doctors.createDoctor")}
              </h1>
            </div>
            <LanguageToggle />
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("doctors.name")} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("doctors.specialty")}
              </label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("doctors.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("doctors.phone")}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("doctors.medicalCenters")} ({t("doctors.maxCenters")})
              </label>
              <div className="space-y-3">
                {selectedCenterIds.map((centerId) => {
                  const center = medicalCenters?.find((c) => c._id === centerId);
                  return (
                    <div
                      key={centerId}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {center?.name || "Unknown"}
                        </p>
                        {center && (
                          <p className="text-xs text-gray-600 mt-1">
                            {center.address}, {center.city}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCenter(centerId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}

                {selectedCenterIds.length < 2 && (
                  <div>
                    {!showNewCenterForm ? (
                      <div className="space-y-2">
                        {((medicalCenters || []) as Array<{
                          _id: Id<"medicalCenters">;
                          name: string;
                          address: string;
                          city: string;
                        }>)
                          .filter((c) => {
                            return !selectedCenterIds.some(id => id === c._id);
                          })
                          .map((center) => {
                            const centerId = center._id;
                            return (
                              <button
                                key={center._id}
                                type="button"
                                onClick={() => handleAddCenter(centerId)}
                                className="w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <p className="font-medium text-gray-800 text-sm">
                                  {center.name}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {center.address}, {center.city}
                                </p>
                              </button>
                            );
                          })}
                        <button
                          type="button"
                          onClick={() => setShowNewCenterForm(true)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          {t("doctors.addMedicalCenter")}
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-300 space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {t("medicalCenters.name")} *
                          </label>
                          <input
                            type="text"
                            value={newCenter.name}
                            onChange={(e) =>
                              setNewCenter({ ...newCenter, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {t("medicalCenters.address")} *
                          </label>
                          <input
                            type="text"
                            value={newCenter.address}
                            onChange={(e) =>
                              setNewCenter({ ...newCenter, address: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {t("medicalCenters.city")} *
                          </label>
                          <input
                            type="text"
                            value={newCenter.city}
                            onChange={(e) =>
                              setNewCenter({ ...newCenter, city: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {t("medicalCenters.phone")}
                          </label>
                          <input
                            type="tel"
                            value={newCenter.phone}
                            onChange={(e) =>
                              setNewCenter({ ...newCenter, phone: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleCreateCenter}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            {t("medicalCenters.save")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewCenterForm(false);
                              setNewCenter({ name: "", address: "", city: "", phone: "" });
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                          >
                            {t("medicalCenters.cancel")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t("common.loading") : t("doctors.save")}
              </button>
              <Link
                href="/doctors"
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
              >
                {t("doctors.cancel")}
              </Link>
            </div>
          </form>
        </div>
      </div>
      </VisitorOnlyRoute>
    </ProtectedRoute>
  );
}

export default function NewDoctorPage() {
  return <NewDoctorContent />;
}

