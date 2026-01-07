import { toast } from "react-toastify";

export default function ToastNotification(message, type = "success", timeClose = 3) {
  const colorMap = {
    success: "green",
    error: "red",
    warning: "yellow"
  };

  const color = colorMap[type] || "blue";

  const iconMap = {
    success: "ri-checkbox-circle-fill",
    error: "ri-error-warning-fill",
    warning: "ri-alert-fill"
  };

  const icon = iconMap[type] || "ri-information-fill";

  const toastFunc = {
    success: toast.success,
    error: toast.error,
    warning: toast.warning
  }[type] || toast.info;

  return toastFunc(
    <div className="flex items-center gap-2">
      <i className={`${icon} text-${color}-500 text-xl`} />
      <span>{message}</span>
    </div>,
    {
      position: "bottom-right",
      autoClose: timeClose * 1000,
      className: `rounded-xl shadow-lg bg-white text-gray-800 border border-${color}-100`
    }
  );
}
