import { UserModel } from "../models/Users.ts";

export async function migrateOldUsers() {
    try {
        const result = await UserModel.updateMany(
            {
                $or: [
                    { role: { $exists: false } },
                    { isBanned: { $exists: false} }
                ]
            },
            {
                $set: {
                    role: 'User',
                    isBanned: false,
                    bannedUntil: null
                }
            }
        );
        console.log(`[Миграция] Успешно обновлено пользователей в БД: ${result.modifiedCount}`);        
    } catch (err) {
    console.error('[Миграция] Ошибка при обновлении старых пользователей:', err);
  }
}
