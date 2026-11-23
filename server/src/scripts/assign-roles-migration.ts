import { CategoryModel } from "../models/Category.ts";
import { UserModel } from "../models/Users.ts";

async function assignAdminRoles() {
  try {
    // 1. Указываем email тех пользователей, кому хотим выдать права
    const adminEmails = [
      'nickandrianov134@gmail.com', 
      ''
    ];

    const moderatorEmails = [
      'moderator-void@gmail.com'  
    ];

    // 1. Всем существующим категориям ставим false
    await CategoryModel.updateMany(
      { isAdminOnly: { $exists: false } },
      { $set: { isAdminOnly: false } }
    );

    // 2. Нужным разделам включаем true по их slug
    await CategoryModel.updateMany(
      { slug: { $in: ['news', 'guides', 'banned'] } },
      { $set: { isAdminOnly: true } }
    );
    // 2. Назначаем роль Admin
    const adminResult = await UserModel.updateMany(
      { email: { $in: adminEmails } },
      { $set: { role: 'Admin' } } // 'Admin' строго с большой буквы, как в схеме
    );
    console.log(`[Роли] Успешно назначено администраторов: ${adminResult.modifiedCount}`);

    // 3. Назначаем роль Moderator
    const modResult = await UserModel.updateMany(
      { email: { $in: moderatorEmails } },
      { $set: { role: 'Moderator' } }
    );
    console.log(`[Роли] Успешно назначено модераторов: ${modResult.modifiedCount}`);

  } catch (err) {
    console.error('[Роли] Ошибка при назначении административных прав:', err);
  }
}
// Экспортируем функцию для вызова в index.ts
export { assignAdminRoles };
