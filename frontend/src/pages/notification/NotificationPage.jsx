import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";

const NotificationPage = () => {
	const queryClient = useQueryClient();
	// const notifications = [
	// 	{
	// 		_id: "1",
	// 		from: {
	// 			_id: "1",
	// 			username: "johndoe",
	// 			profileImg: "/avatars/boy2.png",
	// 		},
	// 		type: "follow",
	// 	},
	// 	{
	// 		_id: "2",
	// 		from: {
	// 			_id: "2",
	// 			username: "janedoe",
	// 			profileImg: "/avatars/girl1.png",
	// 		},
	// 		type: "like",
	// 	},
	// ];

	//fetch notifications;
	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/notifications");
				const data = await res.json();

				if (!res.ok) throw new Error(data.error || "Something went wrong!");
				// console.log("notification :", data.data);
				return data.data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	const { mutate: deleteAllNotifications, isPending: isDeleting } = useMutation(
		{
			mutationFn: async () => {
				try {
					const res = await fetch("/api/notifications/", {
						method: "DELETE",
					});
					const data = await res.json();
					if (!res.ok) throw new Error(data.error);
					return data;
				} catch (error) {
					throw new Error(error.message);
				}
			},
			onSuccess: (data) => {
				toast.success(data.message);
				queryClient.invalidateQueries({ queryKey: ["notifications"] });
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}
	);
	const deleteNotifications = () => {
		if (isDeleting) return;
		deleteAllNotifications();
		// alert("All notifications deleted");
	};

	return (
		<>
			<div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
				<div className="flex justify-between items-center p-4 border-b border-gray-700">
					<p className="font-bold">Notifications</p>
					<div className="dropdown ">
						<div tabIndex={0} role="button" className="m-1">
							<IoSettingsOutline className="w-4" />
						</div>
						<ul
							tabIndex={0}
							className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
							<li>
								<a onClick={deleteNotifications}>Delete all notifications</a>
							</li>
						</ul>
					</div>
				</div>
				{isLoading && (
					<div className="flex justify-center h-full items-center">
						<LoadingSpinner size="lg" />
					</div>
				)}
				{notifications?.length === 0 && (
					<div className="text-center p-4 font-bold">No notifications 🤔</div>
				)}
				{notifications?.map((notification) => (
					<div className="border-b border-gray-700" key={notification._id}>
						<div className="flex gap-2 p-4">
							{notification.type === "follow" && (
								<FaUser className="w-7 h-7 text-primary" />
							)}
							{notification.type === "like" && (
								<FaHeart className="w-7 h-7 text-red-500" />
							)}
							<Link to={`/profile/${notification.from.username}`}>
								<div className="avatar">
									<div className="w-8 rounded-full">
										<img
											src={
												notification.from.profileImg ||
												"/avatar-placeholder.png"
											}
										/>
									</div>
								</div>
								<div className="flex gap-1">
									<span className="font-bold">
										@{notification.from.username}
									</span>{" "}
									{notification.type === "follow"
										? "followed you"
										: "liked your post"}
								</div>
							</Link>
						</div>
					</div>
				))}
			</div>
		</>
	);
};
export default NotificationPage;
