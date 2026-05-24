export const normalizeStatus = (value = "") => value.toString().trim().toLowerCase();

export const statusConfigMap = {
  active: { tone: "approved", label: "Aktif" },
  approved: { tone: "approved", label: "Disetujui" },
  cancelled: { tone: "rejected", label: "Dibatalkan" },
  completed: { tone: "approved", label: "Selesai" },
  failed: { tone: "rejected", label: "Gagal" },
  pending: { tone: "pending", label: "Menunggu" },
  pending_payment: { tone: "pending", label: "Menunggu Pembayaran" },
  pending_review: { tone: "pending", label: "Menunggu Review" },
  pending_verification: { tone: "pending", label: "Menunggu Verifikasi" },
  processing: { tone: "pending", label: "Sedang Diproses" },
  rejected: { tone: "rejected", label: "Ditolak" },
  reviewing: { tone: "pending", label: "Sedang Direview" },
  verified: { tone: "approved", label: "Terverifikasi" },
};

export const getStatusTone = (status) => {
  const normalized = normalizeStatus(status);

  return statusConfigMap[normalized]?.tone || "neutral";
};

export const getStatusLabel = (value) =>
  statusConfigMap[normalizeStatus(value)]?.label ||
  (value
    ? value
        .toString()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase())
    : "-");
