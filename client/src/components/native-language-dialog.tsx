import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useUpdateNativeLanguage } from "@/mutations/use-update-native-language";
import { Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserQueryOptions } from "@/query-options/get-current-user-query-options";

// ISO 639-1 language codes with names
const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "sr", name: "Serbian" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "tr", name: "Turkish" },
  { code: "vi", name: "Vietnamese" },
  { code: "th", name: "Thai" },
  { code: "id", name: "Indonesian" },
  { code: "sv", name: "Swedish" },
  { code: "no", name: "Norwegian" },
  { code: "da", name: "Danish" },
  { code: "fi", name: "Finnish" },
  { code: "hu", name: "Hungarian" },
  { code: "cs", name: "Czech" },
  { code: "sk", name: "Slovak" },
  { code: "uk", name: "Ukrainian" },
  { code: "el", name: "Greek" },
  { code: "he", name: "Hebrew" },
  { code: "ro", name: "Romanian" },
  { code: "bg", name: "Bulgarian" },
  { code: "hr", name: "Croatian" },
  { code: "sl", name: "Slovenian" },
  { code: "et", name: "Estonian" },
  { code: "lv", name: "Latvian" },
  { code: "lt", name: "Lithuanian" },
];

type NativeLanguageDialogProps = React.ComponentProps<typeof Dialog> & {
  onLanguageSelected?: () => void;
  isDismissible?: boolean; // Allow closing dialog without selecting language (default: false for mandatory)
};

export function NativeLanguageDialog({
  onLanguageSelected,
  isDismissible = false,
  ...props
}: NativeLanguageDialogProps) {
  const { data: user } = useQuery(getCurrentUserQueryOptions());
  // Only track the user's input override, always sync with user?.nativeLanguage
  const [selectedLanguageOverride, setSelectedLanguageOverride] = useState<string | null>(null);
  const selectedLanguage = selectedLanguageOverride !== null ? selectedLanguageOverride : (user?.nativeLanguage || "");
  const updateNativeLanguage = useUpdateNativeLanguage();

  const handleSelectChange = (value: string) => {
    setSelectedLanguageOverride(value);
  };

  const handleSubmit = async () => {
    if (!selectedLanguage) return;
    await updateNativeLanguage.mutateAsync(selectedLanguage);
    onLanguageSelected?.();
    // Reset the override so dropdown shows fresh data from React Query
    setSelectedLanguageOverride(null);
    // Close dialog after successful save in dismissible mode
    if (isDismissible && props.onOpenChange) {
      props.onOpenChange(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isDismissible) {
      // Prevent closing if dialog is mandatory and no language selected
      return;
    }
    if (props.onOpenChange) {
      props.onOpenChange(open);
    }
  };

  return (
    <Dialog {...props} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={isDismissible}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <DialogTitle>
              {isDismissible
                ? "Change Your Language"
                : "Choose Your Native Language"}
            </DialogTitle>
          </div>
          <DialogDescription>
            Select the language you'd like translations in. You can change this
            later in settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={selectedLanguage} onValueChange={handleSelectChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a language..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Languages</SelectLabel>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!selectedLanguage || updateNativeLanguage.isPending}
            className="w-full"
          >
            {updateNativeLanguage.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
