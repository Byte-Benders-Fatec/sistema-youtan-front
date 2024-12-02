import SideBarLayout from "@/components/SideBar";
import MyTeamTable from "@/components/MyTeamTable";

const MyTeamPage = () => {
    return (
        <div className="flex h-screen bg-gray-100">

        <SideBarLayout />
        <main className="flex-1 p-8 overflow-auto">
            <MyTeamTable />
        </main>
    </div>
    );
};

export default MyTeamPage;