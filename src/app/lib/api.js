import axios from 'axios';

// Базовый URL API из переменных окружения
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ab-mind.ru/api/';

// Создание экземпляра axios с базовой конфигурацией
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена авторизации к каждому запросу
apiClient.interceptors.request.use(
  (config) => {
    // Получаем токен из localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если токен истек или невалиден, можно очистить его
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        // Можно перенаправить на страницу входа
        // window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== АУТЕНТИФИКАЦИЯ ====================

/**
 * Авторизация через Telegram Web App
 * @param {string} initData - Данные инициализации от Telegram
 * @param {string} refCode - Реферальный код (опционально)
 * @returns {Promise<{access_token: string, token_type: string, is_new: boolean}>}
 */
export const telegramLogin = async (initData, refCode = null) => {
  const response = await apiClient.post('/auth/telegram-login', {
    init_data: initData,
    ref_code: refCode,
  });
  
  // Сохраняем токен в localStorage
  if (response.data.access_token && typeof window !== 'undefined') {
    localStorage.setItem('access_token', response.data.access_token);
  }
  
  return response.data;
};

// ==================== ПОЛЬЗОВАТЕЛИ ====================

/**
 * Получение профиля текущего пользователя
 * @returns {Promise<Object>}
 */
export const getCurrentUser = async () => {
  const response = await apiClient.get('/users/me');
  return response.data;
};

/**
 * Обновление профиля текущего пользователя
 * @param {Object} userData - Данные для обновления
 * @returns {Promise<Object>}
 */
export const updateCurrentUser = async (userData) => {
  const response = await apiClient.put('/users/me', userData);
  return response.data;
};

/**
 * Поиск пользователей
 * @param {string} query - Поисковый запрос (username, имя, telegram_id)
 * @param {number} limit - Ограничение количества результатов (опционально)
 * @returns {Promise<Array>}
 */
export const searchUsers = async (query, limit = null) => {
  const params = new URLSearchParams({ q: query });
  if (limit) {
    params.append('limit', limit.toString());
  }
  const response = await apiClient.get(`/users/search?${params.toString()}`);
  return response.data;
};

// ==================== ОБЪЕКТЫ (ПРОЕКТЫ) ====================

/**
 * Создание нового объекта
 * @param {Object} objectData - Данные объекта
 * @param {string} objectData.name - Название объекта
 * @param {string} objectData.description - Описание объекта
 * @returns {Promise<Object>}
 */
export const createObject = async (objectData) => {
  const response = await apiClient.post('/objects', objectData);
  return response.data;
};

/**
 * Получение всех объектов текущего пользователя
 * @returns {Promise<Array>}
 */
export const getObjects = async () => {
  const response = await apiClient.get('/objects');
  return response.data;
};

/**
 * Получение всех объектов, где пользователь является владельцем
 * @returns {Promise<Array>}
 */
export const getOwnedObjects = async () => {
  const response = await apiClient.get('/objects/owned');
  return response.data;
};

/**
 * Получение объекта по ID
 * @param {number} objectId - ID объекта
 * @returns {Promise<Object>}
 */
export const getObject = async (objectId) => {
  const response = await apiClient.get(`/objects/${objectId}`);
  return response.data;
};

/**
 * Получение объекта со всеми пользователями и их ролями
 * @param {number} objectId - ID объекта
 * @returns {Promise<Object>}
 */
export const getObjectWithMembers = async (objectId) => {
  const response = await apiClient.get(`/objects/${objectId}/with-members`);
  return response.data;
};

/**
 * Обновление объекта
 * @param {number} objectId - ID объекта
 * @param {Object} objectData - Данные для обновления
 * @returns {Promise<Object>}
 */
export const updateObject = async (objectId, objectData) => {
  const response = await apiClient.put(`/objects/${objectId}`, objectData);
  return response.data;
};

/**
 * Удаление объекта
 * @param {number} objectId - ID объекта
 * @returns {Promise<void>}
 */
export const deleteObject = async (objectId) => {
  await apiClient.delete(`/objects/${objectId}`);
};

/**
 * Добавление пользователя в объект
 * @param {number} objectId - ID объекта
 * @param {number} userId - ID пользователя
 * @param {string} role - Роль пользователя
 * @returns {Promise<Object>}
 */
export const addObjectMember = async (objectId, userId, role) => {
  const response = await apiClient.post(`/objects/${objectId}/members`, {
    user_id: userId,
    role: role,
  });
  return response.data;
};

/**
 * Удаление пользователя из объекта
 * @param {number} objectId - ID объекта
 * @param {number} userId - ID пользователя
 * @returns {Promise<void>}
 */
export const removeObjectMember = async (objectId, userId) => {
  await apiClient.delete(`/objects/${objectId}/members/${userId}`);
};

/**
 * Обновление роли пользователя в объекте
 * @param {number} objectId - ID объекта
 * @param {number} userId - ID пользователя
 * @param {string} role - Новая роль
 * @returns {Promise<Object>}
 */
export const updateObjectMemberRole = async (objectId, userId, role) => {
  const response = await apiClient.put(`/objects/${objectId}/members/${userId}/role`, {
    role: role,
  });
  return response.data;
};

/**
 * Получение всех пользователей объекта с их ролями
 * @param {number} objectId - ID объекта
 * @returns {Promise<Array>}
 */
export const getObjectMembers = async (objectId) => {
  const response = await apiClient.get(`/objects/${objectId}/members`);
  return response.data;
};

// ==================== ЗАЯВКИ ====================

/**
 * Создание новой заявки со списком материалов
 * @param {Object} requestData - Данные заявки
 * @param {string} requestData.number - Номер заявки (опционально)
 * @param {number} requestData.object_id - ID объекта
 * @param {Array} requestData.items - Список материалов
 * @param {string} requestData.delivery_date - Дата доставки (YYYY-MM-DD)
 * @param {string} requestData.notes - Примечания
 * @returns {Promise<Object>}
 */
export const createRequest = async (requestData) => {
  const response = await apiClient.post('/requests', requestData);
  return response.data;
};

/**
 * Получение всех заявок, созданных текущим пользователем
 * @returns {Promise<Array>}
 */
export const getRequests = async () => {
  const response = await apiClient.get('/requests');
  return response.data;
};

/**
 * Получение всех заявок объекта
 * @param {number} objectId - ID объекта
 * @returns {Promise<Array>}
 */
export const getObjectRequests = async (objectId) => {
  const response = await apiClient.get(`/requests/object/${objectId}`);
  return response.data;
};

/**
 * Получение заявки по ID
 * @param {number} requestId - ID заявки
 * @returns {Promise<Object>}
 */
export const getRequest = async (requestId) => {
  const response = await apiClient.get(`/requests/${requestId}`);
  return response.data;
};

/**
 * Получение заявки с информацией об объекте и создателе
 * @param {number} requestId - ID заявки
 * @returns {Promise<Object>}
 */
export const getRequestWithRelations = async (requestId) => {
  const response = await apiClient.get(`/requests/${requestId}/with-relations`);
  return response.data;
};

/**
 * Обновление заявки
 * @param {number} requestId - ID заявки
 * @param {Object} requestData - Данные для обновления
 * @returns {Promise<Object>}
 */
export const updateRequest = async (requestId, requestData) => {
  const response = await apiClient.put(`/requests/${requestId}`, requestData);
  return response.data;
};

/**
 * Удаление заявки
 * @param {number} requestId - ID заявки
 * @returns {Promise<void>}
 */
export const deleteRequest = async (requestId) => {
  await apiClient.delete(`/requests/${requestId}`);
};

/**
 * Обновление статуса заявки
 * @param {number} requestId - ID заявки
 * @param {string} status - Новый статус
 * @returns {Promise<Object>}
 */
export const updateRequestStatus = async (requestId, status) => {
  const response = await apiClient.put(`/requests/${requestId}/status`, {
    status: status,
  });
  return response.data;
};

// ==================== ДОКУМЕНТЫ ====================

/**
 * Загрузка документа для заявки
 * @param {number} requestId - ID заявки
 * @param {File} file - Файл документа
 * @param {string} documentType - Тип документа (опционально)
 * @returns {Promise<Object>}
 */
export const uploadDocument = async (requestId, file, documentType = null) => {
  const formData = new FormData();
  formData.append('file', file);
  if (documentType) {
    formData.append('document_type', documentType);
  }
  
  const response = await apiClient.post(`/requests/${requestId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Получение всех документов заявки
 * @param {number} requestId - ID заявки
 * @returns {Promise<Array>}
 */
export const getRequestDocuments = async (requestId) => {
  const response = await apiClient.get(`/requests/${requestId}/documents`);
  return response.data;
};

/**
 * Получение информации о документе
 * @param {number} documentId - ID документа
 * @returns {Promise<Object>}
 */
export const getDocument = async (documentId) => {
  const response = await apiClient.get(`/documents/${documentId}`);
  return response.data;
};

/**
 * Скачивание документа
 * @param {number} documentId - ID документа
 * @returns {Promise<Blob>}
 */
export const downloadDocument = async (documentId) => {
  const response = await apiClient.get(`/documents/${documentId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Проверяет, доступен ли Telegram WebApp
 */
const isTelegramWebAppAvailable = () => {
  return typeof window !== 'undefined' && window.Telegram?.WebApp;
};

/**
 * Открытие/просмотр документа
 * @param {number} documentId - ID документа
 * @param {string} fileName - Имя файла для скачивания
 * @param {string} fileType - MIME тип файла (опционально)
 * @returns {Promise<void>}
 */
export const openDocument = async (documentId, fileName = null, fileType = null) => {
  if (typeof window === 'undefined') {
    throw new Error('Метод openDocument может быть вызван только в браузере');
  }

  try {
    // Проверяем, запущено ли приложение в Telegram
    const isTelegram = isTelegramWebAppAvailable();
    
    if (isTelegram) {
      // Для Telegram Mini App используем blob URL для открытия документа
      // Telegram откроет документ в своем встроенном просмотрщике
      const blob = await downloadDocument(documentId);
      const blobUrl = window.URL.createObjectURL(blob);
      
      // В Telegram WebApp используем openLink для открытия blob URL
      // Telegram откроет документ в своем встроенном просмотрщике
      window.Telegram.WebApp.openLink(blobUrl);
      
      // Освобождаем память через некоторое время (увеличено для Telegram)
      setTimeout(() => {
        try {
          window.URL.revokeObjectURL(blobUrl);
        } catch (e) {
          console.warn('Не удалось освободить URL:', e);
        }
      }, 5000);
    } else {
      // Стандартный способ для обычных браузеров
      const blob = await downloadDocument(documentId);
      
      // Определяем тип файла для правильного отображения
      const mimeType = fileType || 'application/octet-stream';
      const isPdf = mimeType.includes('pdf');
      const isImage = mimeType.startsWith('image/');
      
      // Создаем URL для blob
      const url = window.URL.createObjectURL(blob);
      
      if (isPdf || isImage) {
        // Для PDF и изображений открываем в новой вкладке
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
          // Если открытие заблокировано, скачиваем файл
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName || `document_${documentId}`;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // Для других файлов скачиваем
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || `document_${documentId}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      // Освобождаем память через некоторое время
      setTimeout(() => {
        try {
          window.URL.revokeObjectURL(url);
        } catch (e) {
          console.warn('Не удалось освободить URL:', e);
        }
      }, 100);
    }
  } catch (error) {
    console.error("Ошибка при открытии документа:", error);
    throw error;
  }
};

/**
 * Удаление документа
 * @param {number} documentId - ID документа
 * @returns {Promise<void>}
 */
export const deleteDocument = async (documentId) => {
  await apiClient.delete(`/documents/${documentId}`);
};

// ==================== КОММЕНТАРИИ ====================

/**
 * Создание комментария к заявке
 * @param {number} requestId - ID заявки
 * @param {string} text - Текст комментария
 * @returns {Promise<Object>}
 */
export const createComment = async (requestId, text) => {
  const response = await apiClient.post(`/requests/${requestId}/comments`, {
    text: text,
  });
  return response.data;
};

/**
 * Получение всех комментариев заявки
 * @param {number} requestId - ID заявки
 * @returns {Promise<Array>}
 */
export const getRequestComments = async (requestId) => {
  const response = await apiClient.get(`/requests/${requestId}/comments`);
  return response.data;
};

/**
 * Получение комментария по ID
 * @param {number} commentId - ID комментария
 * @returns {Promise<Object>}
 */
export const getComment = async (commentId) => {
  const response = await apiClient.get(`/comments/${commentId}`);
  return response.data;
};

/**
 * Обновление комментария
 * @param {number} commentId - ID комментария
 * @param {string} text - Новый текст комментария
 * @returns {Promise<Object>}
 */
export const updateComment = async (commentId, text) => {
  const response = await apiClient.put(`/comments/${commentId}`, {
    text: text,
  });
  return response.data;
};

/**
 * Удаление комментария
 * @param {number} commentId - ID комментария
 * @returns {Promise<void>}
 */
export const deleteComment = async (commentId) => {
  await apiClient.delete(`/comments/${commentId}`);
};

// Экспорт экземпляра клиента для прямого доступа (если нужно)
export default apiClient;
