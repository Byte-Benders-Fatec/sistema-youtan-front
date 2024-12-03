import SideBarLayout from "@/components/SideBar";
import AnswersTable from "@/components/AnswersTable";

const DashboardsPage = () => {
    return (
        <div className="flex h-screen bg-gray-100">

        <SideBarLayout />

        <main className="flex-1 p-8 overflow-auto">
            <AnswersTable />
        </main>

    </div>
    );
};

export default DashboardsPage;