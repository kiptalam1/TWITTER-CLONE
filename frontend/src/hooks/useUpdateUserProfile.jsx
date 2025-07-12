import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useUpdateUserProfile = () => {
	const queryClient = useQueryClient();
	const { mutateAsync: updateProfile, isPending: isUpdating } = useMutation({
		mutationFn: async (formData) => {
			try {
				const res = await fetch("/api/users/update", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
		onSuccess: () => {
			Promise.all([
				queryClient.invalidateQueries(["authUser"]),
				queryClient.invalidateQueries(["userProfile"]),
			]);
			toast.success("Profile updated successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update profile");
		},
	});
	return { updateProfile, isUpdating };
};

export default useUpdateUserProfile;
