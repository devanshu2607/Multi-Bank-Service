import axios from "axios";

const api = axios.create({
  baseURL: "/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error", error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;

export const banks = ["SBI", "HDFC", "ICICI", "AXIS", "PNB", "KOTAK", "BOB"];

export function getSession() {
  const raw = localStorage.getItem("bankingSession");
  return raw ? JSON.parse(raw) : null;
}

export function saveSession(session) {
  localStorage.setItem("bankingSession", JSON.stringify(session));
  if (session?.accessToken) {
    localStorage.setItem("accessToken", session.accessToken);
  }
  if (session?.refreshToken) {
    localStorage.setItem("refreshToken", session.refreshToken);
  }
}

export function clearSession() {
  localStorage.removeItem("bankingSession");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

// --- API Helpers for Microservices ---

// Auth Service
export const authApi = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },
  register: async (fullName, email, phoneNumber, password) => {
    const response = await api.post("/auth/register", { fullName, email, phoneNumber, password });
    return response.data;
  },
  changePassword: async (email, oldPassword, newPassword) => {
    const response = await api.post("/auth/change-password", { email, oldPassword, newPassword });
    return response.data;
  }
};

// User Profile Service
export const userApi = {
  getProfile: async (authUserId) => {
    const response = await api.get(`/users/me?authUserId=${authUserId}`);
    return response.data;
  },
  createProfile: async (authUserId, fullName, email, phoneNumber) => {
    const response = await api.post("/users", { authUserId, fullName, email, phoneNumber });
    return response.data;
  },
  updateProfile: async (authUserId, fullName, email, phoneNumber) => {
    const response = await api.put(`/users/me?authUserId=${authUserId}`, { fullName, email, phoneNumber });
    return response.data;
  }
};

// Bank Account Service
export const bankApi = {
  getAccounts: async (userId) => {
    const response = await api.get(`/accounts?userId=${userId}`);
    return response.data;
  },
  createAccount: async (userId, bankCode, accountHolderName, openingBalance) => {
    const response = await api.post("/accounts", { userId, bankCode, accountHolderName, openingBalance });
    return response.data;
  },
  getAccountDetails: async (accountNumber) => {
    const response = await api.get(`/accounts/${accountNumber}`);
    return response.data;
  },
  deleteAccount: async (accountNumber, userId) => {
    const response = await api.delete(`/accounts/${accountNumber}?userId=${userId}`);
    return response.data;
  },
  debit: async (accountNumber, amount, narration, type = "INTER_BANK") => {
    const response = await api.post(`/accounts/${accountNumber}/debit`, { amount, type, narration });
    return response.data;
  },
  credit: async (accountNumber, amount, narration, type = "INTER_BANK") => {
    const response = await api.post(`/accounts/${accountNumber}/credit`, { amount, type, narration });
    return response.data;
  }
};

// UPI Service
export const upiApi = {
  getProfiles: async (userId) => {
    const response = await api.get(`/upi?userId=${userId}`);
    return response.data;
  },
  createProfile: async (userId, handle, phoneNumber, defaultAccountNumber) => {
    const response = await api.post("/upi", { userId, handle, phoneNumber, defaultAccountNumber });
    return response.data;
  },
  updateDefaultAccount: async (upiId, defaultAccountNumber, userId) => {
    const response = await api.put(`/upi/${upiId}/default-account`, { defaultAccountNumber, userId });
    return response.data;
  },
  resolveUpi: async (upiId) => {
    const response = await api.get(`/upi/resolve/upi/${upiId}`);
    return response.data;
  },
  resolvePhone: async (phoneNumber) => {
    const response = await api.get(`/upi/resolve/phone/${phoneNumber}`);
    return response.data;
  }
};

// Payment Service
export const paymentApi = {
  initiate: async (sourceIdentifier, destinationIdentifier, amount, type, narration = "") => {
    const response = await api.post("/payments", {
      sourceIdentifier,
      destinationIdentifier,
      amount,
      type,
      narration
    });
    return response.data;
  }
};

// Ledger Service
export const ledgerApi = {
  getLedger: async (accountNumber) => {
    const response = await api.get(`/ledger/${accountNumber}`);
    return response.data;
  }
};

// Notification Service
export const notificationApi = {
  getNotifications: async (userId) => {
    const response = await api.get(`/notifications?userId=${userId}`);
    return response.data;
  }
};
