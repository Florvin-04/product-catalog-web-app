import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors={true}
      style={
        {
          "--normal-bg": "var(--background)",
          "--normal-border": "var(--border)",
          "--normal-text": "var(--foreground)",
          "--success-bg": "#22c55e", // green-500
          "--success-border": "#16a34a", // green-600
          "--success-text": "white",
          "--error-bg": "#ef4444", // red-500
          "--error-border": "#dc2626", // red-600
          "--error-text": "white",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
