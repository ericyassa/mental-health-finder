import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface Service {
  id: string;
  category_id: string;
  name: string;
  link: string | null;
  type: string | null;
  description: string | null;
  sort_order: number;
}

export interface ServiceContact {
  id: string;
  service_id: string;
  type: string;
  value: string;
  sort_order: number;
}

export interface App {
  id: string;
  category_id: string;
  name: string;
  link: string | null;
  description: string | null;
  app_type: string;
  sort_order: number;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useServices(categoryId: string | null) {
  return useQuery({
    queryKey: ["services", categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("category_id", categoryId)
        .order("sort_order");
      if (error) throw error;
      return data as Service[];
    },
    enabled: !!categoryId,
  });
}

export function useServiceContacts(serviceIds: string[]) {
  return useQuery({
    queryKey: ["service_contacts", serviceIds],
    queryFn: async () => {
      if (!serviceIds.length) return [];
      const { data, error } = await supabase
        .from("service_contacts")
        .select("*")
        .in("service_id", serviceIds)
        .order("sort_order");
      if (error) throw error;
      return data as ServiceContact[];
    },
    enabled: serviceIds.length > 0,
  });
}

export function useApps(categoryId: string | null) {
  return useQuery({
    queryKey: ["apps", categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .eq("category_id", categoryId)
        .order("sort_order");
      if (error) throw error;
      return data as App[];
    },
    enabled: !!categoryId,
  });
}

export function useSearchServices(query: string) {
  return useQuery({
    queryKey: ["search_services", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const { data, error } = await supabase
        .from("services")
        .select("*, categories!inner(name)")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: query.trim().length >= 2,
  });
}
