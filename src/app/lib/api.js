/**
 * API клиент для работы с бэкендом CirrusApprovo
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Получает токен из localStorage
 */
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

/**
 * Сохраняет токен в localStorage
 */
const setToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
};

/**
 * Удаляет токен из localStorage
 */
const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
};

/**
 * Базовый запрос к API
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    // Если 401, удаляем токен и перенаправляем на главную
    if (response.status === 401) {
      removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
      throw new Error("Unauthorized");
    }

    // Для пустых ответов (204)
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

/**
 * Запрос с multipart/form-data для загрузки файлов
 */
const apiRequestFormData = async (endpoint, formData, options = {}) => {
  const token = getToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method: options.method || "POST",
    headers,
    body: formData,
  };

  try {
    const response = await fetch(url, config);
    
    if (response.status === 401) {
      removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
      throw new Error("Unauthorized");
    }

    if (response.status === 204) {
      return null;
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

// ==================== Аутентификация ====================

export const auth = {
  /**
   * Авторизация через Telegram
   */
  telegramLogin: async (initData, refCode = null) => {
    const data = await apiRequest("/auth/telegram-login", {
      method: "POST",
      body: JSON.stringify({
        init_data: initData,
        ref_code: refCode,
      }),
    });
    
    if (data.access_token) {
      setToken(data.access_token);
    }
    
    return data;
  },

  /**
   * Выход
   */
  logout: () => {
    removeToken();
  },

  /**
   * Проверка авторизации
   */
  isAuthenticated: () => {
    return !!getToken();
  },
};

// ==================== Пользователи ====================

export const users = {
  /**
   * Получить профиль текущего пользователя
   */
  getMe: () => apiRequest("/users/me"),

  /**
   * Обновить профиль
   */
  updateMe: (data) =>
    apiRequest("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ==================== Объекты (Проекты) ====================

export const objects = {
  /**
   * Создать объект
   */
  create: (data) =>
    apiRequest("/objects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Получить все объекты пользователя
   */
  getAll: () => apiRequest("/objects"),

  /**
   * Получить объекты, где пользователь владелец
   */
  getOwned: () => apiRequest("/objects/owned"),

  /**
   * Получить объект по ID
   */
  getById: (id) => apiRequest(`/objects/${id}`),

  /**
   * Получить объект с участниками
   */
  getWithMembers: (id) => apiRequest(`/objects/${id}/with-members`),

  /**
   * Обновить объект
   */
  update: (id, data) =>
    apiRequest(`/objects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /**
   * Удалить объект
   */
  delete: (id) =>
    apiRequest(`/objects/${id}`, {
      method: "DELETE",
    }),

  /**
   * Добавить участника в объект
   */
  addMember: (objectId, userId, role) =>
    apiRequest(`/objects/${objectId}/members`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId, role }),
    }),

  /**
   * Удалить участника из объекта
   */
  removeMember: (objectId, userId) =>
    apiRequest(`/objects/${objectId}/members/${userId}`, {
      method: "DELETE",
    }),

  /**
   * Обновить роль участника
   */
  updateMemberRole: (objectId, userId, role) =>
    apiRequest(`/objects/${objectId}/members/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),

  /**
   * Получить всех участников объекта
   */
  getMembers: (objectId) => apiRequest(`/objects/${objectId}/members`),
};

// ==================== Заявки ====================

export const requests = {
  /**
   * Создать заявку
   */
  create: (data) =>
    apiRequest("/requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Получить все заявки пользователя
   */
  getAll: () => apiRequest("/requests"),

  /**
   * Получить заявки объекта
   */
  getByObject: (objectId) => apiRequest(`/requests/object/${objectId}`),

  /**
   * Получить заявку по ID
   */
  getById: (id) => apiRequest(`/requests/${id}`),

  /**
   * Получить заявку с отношениями
   */
  getWithRelations: (id) => apiRequest(`/requests/${id}/with-relations`),

  /**
   * Обновить заявку
   */
  update: (id, data) =>
    apiRequest(`/requests/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /**
   * Удалить заявку
   */
  delete: (id) =>
    apiRequest(`/requests/${id}`, {
      method: "DELETE",
    }),

  /**
   * Обновить статус заявки
   */
  updateStatus: (id, status) =>
    apiRequest(`/requests/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};

// ==================== Документы ====================

export const documents = {
  /**
   * Загрузить документ
   */
  upload: (requestId, file, documentType = null) => {
    const formData = new FormData();
    formData.append("file", file);
    if (documentType) {
      formData.append("document_type", documentType);
    }
    return apiRequestFormData(`/requests/${requestId}/documents`, formData);
  },

  /**
   * Получить документы заявки
   */
  getByRequest: (requestId) => apiRequest(`/requests/${requestId}/documents`),

  /**
   * Получить документ по ID
   */
  getById: (id) => apiRequest(`/documents/${id}`),

  /**
   * Скачать документ
   */
  download: (id) => {
    const token = getToken();
    const url = `${API_BASE_URL}/documents/${id}/download`;
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return fetch(url, { headers }).then((response) => {
      if (!response.ok) throw new Error("Download failed");
      return response.blob();
    });
  },

  /**
   * Удалить документ
   */
  delete: (id) =>
    apiRequest(`/documents/${id}`, {
      method: "DELETE",
    }),
};

// Экспорт утилит
export { getToken, setToken, removeToken };

