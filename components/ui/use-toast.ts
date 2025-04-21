import { useToast as useSonnerToast } from 'sonner';

export const useToast = () => {
  const { toast } = useSonnerToast();
  return { toast };
};