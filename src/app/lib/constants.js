// Роли пользователей в объекте
export const ObjectRole = {
  DIRECTOR: 'director',                    // Директор (создатель проекта)
  FOREMAN: 'foreman',                      // Прораб
  SUPPLY_SPECIALIST: 'supply_specialist',  // Специалист отдела снабжения
  ACCOUNTANT: 'accountant',                // Бухгалтер
  CHIEF_ENGINEER: 'chief_engineer',        // Главный инженер
  WAREHOUSE_PICKER: 'warehouse_picker',    // Комплектощик на складе
};

// Отображаемые названия ролей
export const ObjectRoleDisplay = {
  [ObjectRole.DIRECTOR]: 'Директор',
  [ObjectRole.FOREMAN]: 'Прораб',
  [ObjectRole.SUPPLY_SPECIALIST]: 'Специалист отдела снабжения',
  [ObjectRole.ACCOUNTANT]: 'Бухгалтер',
  [ObjectRole.CHIEF_ENGINEER]: 'Главный инженер',
  [ObjectRole.WAREHOUSE_PICKER]: 'Комплектощик на складе',
};

// Статусы заявки
export const RequestStatus = {
  CREATED: 'created',                                    // 1. Создана
  SUPPLY_ADDED_INVOICE: 'supply_added_invoice',          // 2. Отдел снабжения добавляет счёт
  DIRECTOR_APPROVED: 'director_approved',                // 3. Директор подтверждает счёт
  ACCOUNTANT_PAID: 'accountant_paid',                    // 4. Бухгалтер нажимает, что оплачено
  FOREMAN_CONFIRMED_RECEIPT: 'foreman_confirmed_receipt', // 5. Прораб подтверждает получения списка
  DOCUMENTS_SHIPPED: 'documents_shipped',                // 6. Отгрузка документов
};

// Отображаемые названия статусов
export const RequestStatusDisplay = {
  [RequestStatus.CREATED]: 'Создана',
  [RequestStatus.SUPPLY_ADDED_INVOICE]: 'Отдел снабжения добавил счёт',
  [RequestStatus.DIRECTOR_APPROVED]: 'Директор подтвердил счёт',
  [RequestStatus.ACCOUNTANT_PAID]: 'Бухгалтер отметил как оплачено',
  [RequestStatus.FOREMAN_CONFIRMED_RECEIPT]: 'Прораб подтвердил получение материалов',
  [RequestStatus.DOCUMENTS_SHIPPED]: 'Документы отгружены',
};

// Матрица переходов статусов (кто может изменить статус)
export const StatusTransitionMatrix = {
  [RequestStatus.CREATED]: {
    nextStatus: RequestStatus.SUPPLY_ADDED_INVOICE,
    allowedRoles: [ObjectRole.SUPPLY_SPECIALIST],
  },
  [RequestStatus.SUPPLY_ADDED_INVOICE]: {
    nextStatus: RequestStatus.DIRECTOR_APPROVED,
    allowedRoles: [ObjectRole.DIRECTOR],
  },
  [RequestStatus.DIRECTOR_APPROVED]: {
    nextStatus: RequestStatus.ACCOUNTANT_PAID,
    allowedRoles: [ObjectRole.ACCOUNTANT],
  },
  [RequestStatus.ACCOUNTANT_PAID]: {
    nextStatus: RequestStatus.FOREMAN_CONFIRMED_RECEIPT,
    allowedRoles: [ObjectRole.FOREMAN],
  },
  [RequestStatus.FOREMAN_CONFIRMED_RECEIPT]: {
    nextStatus: RequestStatus.DOCUMENTS_SHIPPED,
    allowedRoles: null, // Любой участник объекта
  },
  [RequestStatus.DOCUMENTS_SHIPPED]: {
    nextStatus: null, // Финальный статус
    allowedRoles: null,
  },
};

// Типы документов
export const DocumentType = {
  INVOICE: 'invoice',
  CONTRACT: 'contract',
};
