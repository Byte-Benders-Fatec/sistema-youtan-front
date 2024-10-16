import SideBarLayout from "@/components/SideBar";
import UsersTable from "@/components/UsersTable";

const UsersPage = () => {
    return (
        <div className="flex h-screen bg-gray-100">

            <SideBarLayout />

            <main className="flex-1 p-8 overflow-auto">
                <UsersTable />
            </main>

        </div>
    );
};

export default UsersPage;