import { UserModel } from "../models/Users.ts";

export async function migrateOldUsers() {
    try {
        const result = await UserModel.updateMany(
            {
                // Ищем пользователей, у которых отсутствует ХОТЯ БЫ ОДНО из этих полей
                $or: [
                    { isOnline: { $exists: false } },
                    { isBanned: { $exists: false } },
                    { bannReason: { $exists: false } }, // Сверьтесь со схемой (bannReason или bannedReason?)
                    { role: { $exists: false } }
                ]
            },
            {
                // Задаем дефолтные значения для всех недостающих полей
                $set: {
                    isOnline: false,
                    isBanned: false,
                    bannReason: null, // Если в схеме 'bannReason'
                    role: 'User'
                }
            }
        );
        console.log(`[Миграция] Успешно обновлено пользователей в БД: ${result.modifiedCount}`);        
    } catch (err) {
        console.error('[Миграция] Ошибка при обновлении старых пользователей:', err);
    }
}
