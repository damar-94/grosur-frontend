"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminService } from "@/services/adminService";

interface Store {
  id: string;
  name: string;
}

interface StoreAdmin {
  id: string;
  name: string;
  email: string;
  managedStoreId: string;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  managedStoreId: z.string().uuid("Please select a valid store"),
});

interface StoreAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin?: StoreAdmin | null; // If present, we are in Edit mode
  onSuccess: () => void;
}

export function StoreAdminModal({
  isOpen,
  onClose,
  admin,
  onSuccess,
}: StoreAdminModalProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);

  const isEdit = !!admin;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      managedStoreId: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      fetchStores();
      if (isEdit && admin) {
        form.reset({
          name: admin.name || "",
          email: admin.email || "",
          password: "", // Don't fill password on edit
          managedStoreId: admin.managedStoreId || "",
        });
      } else {
        form.reset({
          name: "",
          email: "",
          password: "",
          managedStoreId: "",
        });
      }
    }
  }, [isOpen, admin, isEdit, form]);

  const fetchStores = async () => {
    try {
      const data = await adminService.getStores();
      setStores(data.data || []);
    } catch (error) {
      console.error("Failed to fetch stores", error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      if (isEdit && admin) {
        // Update
        const { password: _unused, ...updateData } = values;
        await adminService.updateStoreAdmin(admin.id, updateData);
        toast.success("Admin updated successfully");
      } else {
        // Create
        if (!values.password) {
          form.setError("password", { message: "Password is required for new accounts" });
          setLoading(false);
          return;
        }
        await adminService.createStoreAdmin(values);
        toast.success("Admin created successfully");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Store Admin" : "Add New Store Admin"}</DialogTitle>
          <DialogDescription>
            {isEdit 
              ? "Update the details for this admin account." 
              : "Create a new admin account and assign them to a store."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isEdit && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="managedStoreId"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Assign to Store</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a store" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : (isEdit ? "Update Admin" : "Create Admin")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
