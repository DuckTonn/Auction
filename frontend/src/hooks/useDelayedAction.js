import { useState, useRef, useCallback } from 'react';

/**
 * Hook xử lý hành động có độ trễ (Undo)
 * @param {Function} onExecute - Hàm thực thi API sau khi hết giờ
 * @returns {Object} - { pendingIds, triggerAction, cancelAction }
 */
export function useDelayedAction(onExecute) {
  const [pendingIds, setPendingIds] = useState(new Set());
  const timers = useRef({});

  const triggerAction = useCallback((id, ...args) => {
    // 1. Thêm vào danh sách đang chờ (để làm mờ UI)
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    // 2. Set timer 5 giây
    timers.current[id] = setTimeout(async () => {
      // 3. Thực thi hành động thật sự
      await onExecute(id, ...args);

      // 4. Xóa khỏi danh sách chờ
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      delete timers.current[id];
    }, 5000);
  }, [onExecute]);

  const cancelAction = useCallback((id) => {
    // 1. Clear timer
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }

    // 2. Xóa khỏi danh sách chờ (UI sáng lại)
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return { pendingIds, triggerAction, cancelAction };
}