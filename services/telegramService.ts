/**
 * TelegramService - Утилиты для работы с Telegram Mini App API
 */

export const telegramService = {
    /**
     * Вызывает тактильную отдачу (вибрацию)
     */
    haptic: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
        }
    },

    /**
     * Вызывает уведомление с вибрацией (успех, ошибка, предупреждение)
     */
    notification: (type: 'error' | 'success' | 'warning') => {
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
        }
    },

    /**
     * Возвращает данные пользователя, если приложение запущено в Telegram
     */
    getUser: () => {
        return window.Telegram?.WebApp?.initDataUnsafe?.user;
    },

    /**
     * Закрывает приложение
     */
    close: () => {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.close();
        }
    }
};
