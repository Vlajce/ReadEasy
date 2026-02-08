import { apiClient } from "@/lib/api-client";
import { getFormattedDate } from "@/lib/utils";
import type { RegisterInput } from "@/schemas/user";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function useRegister() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (credentials: RegisterInput) =>
      apiClient.post("/auth/register", credentials),

    onSuccess: () => {
      toast.success("Your account has been created successfully! 🎉", {
        description: getFormattedDate() + " 📆",
      });

      navigate({ to: "/login" });
    },
  });
}
