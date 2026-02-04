// Роли пользователей в объекте
export const ObjectRole = {
  DIRECTOR: 'director',                    // Директор (создатель проекта)
  DEPUTY_DIRECTOR: 'deputy_director',      // Заместитель директора
  FOREMAN: 'foreman',                      // Прораб
  SUPPLY_SPECIALIST: 'supply_specialist',  // Специалист отдела снабжения
  ACCOUNTANT: 'accountant',                // Бухгалтер
  CHIEF_ENGINEER: 'chief_engineer',        // Главный инженер
  WAREHOUSE_PICKER: 'warehouse_picker',    // Комплектощик на складе
};

// Отображаемые названия ролей
export const ObjectRoleDisplay = {
  [ObjectRole.DIRECTOR]: 'Директор',
  [ObjectRole.DEPUTY_DIRECTOR]: 'Заместитель директора',
  [ObjectRole.FOREMAN]: 'Прораб',
  [ObjectRole.SUPPLY_SPECIALIST]: 'Специалист отдела снабжения',
  [ObjectRole.ACCOUNTANT]: 'Бухгалтер',
  [ObjectRole.CHIEF_ENGINEER]: 'Главный инженер',
  [ObjectRole.WAREHOUSE_PICKER]: 'Комплектощик на складе',
};

// Статусы заявки
export const RequestStatus = {
  CREATED: 'created',                                    // 1. Создана
  APPROVED_FOR_SUPPLY: 'approved_for_supply',            // 2. Утверждено для снабжения
  SUPPLY_ADDED_INVOICE: 'supply_added_invoice',          // 3. Отдел снабжения добавил счёт
  DIRECTOR_APPROVED: 'director_approved',                // 4. Директор/зам подтвердил счёт
  ACCOUNTANT_PAID: 'accountant_paid',                    // 5. Бухгалтер отметил как оплачено
  FOREMAN_CONFIRMED_RECEIPT: 'foreman_confirmed_receipt', // 6. Прораб подтвердил получение
  DOCUMENTS_SHIPPED: 'documents_shipped',                // 7. Отгрузка документов
  REJECTED: 'rejected',                                  // 8. Отклонена (финальный статус)
};

// Отображаемые названия статусов
export const RequestStatusDisplay = {
  [RequestStatus.CREATED]: 'Создана',
  [RequestStatus.APPROVED_FOR_SUPPLY]: 'Утверждено для снабжения',
  [RequestStatus.SUPPLY_ADDED_INVOICE]: 'Отдел снабжения добавил счёт',
  [RequestStatus.DIRECTOR_APPROVED]: 'Директор/зам подтвердил счёт',
  [RequestStatus.ACCOUNTANT_PAID]: 'Бухгалтер отметил как оплачено',
  [RequestStatus.FOREMAN_CONFIRMED_RECEIPT]: 'Прораб подтвердил получение материалов',
  [RequestStatus.DOCUMENTS_SHIPPED]: 'Документы отгружены',
  [RequestStatus.REJECTED]: 'Отклонена',
};

// Матрица переходов статусов (кто может изменить статус)
export const StatusTransitionMatrix = {
  [RequestStatus.CREATED]: {
    nextStatus: RequestStatus.APPROVED_FOR_SUPPLY,
    allowedRoles: [ObjectRole.DIRECTOR, ObjectRole.DEPUTY_DIRECTOR, ObjectRole.CHIEF_ENGINEER],
  },
  [RequestStatus.APPROVED_FOR_SUPPLY]: {
    nextStatus: RequestStatus.SUPPLY_ADDED_INVOICE,
    allowedRoles: [ObjectRole.SUPPLY_SPECIALIST],
  },
  [RequestStatus.SUPPLY_ADDED_INVOICE]: {
    nextStatus: RequestStatus.DIRECTOR_APPROVED,
    allowedRoles: [ObjectRole.DIRECTOR, ObjectRole.DEPUTY_DIRECTOR],
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
  [RequestStatus.REJECTED]: {
    nextStatus: null, // Финальный статус
    allowedRoles: null,
  },
};

// Типы документов
export const DocumentType = {
  INVOICE: 'invoice',
  CONTRACT: 'contract',
};
