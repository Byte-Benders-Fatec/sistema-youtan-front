import SideBarLayout from "@/components/SideBar";
import TeamsTable from "@/components/TeamsTable";
import React from "react";


const TeamsPage = () => {
    return (
        <div className="flex h-screen bg-gray-100">

        <SideBarLayout />

        <main className="flex-1 p-8 overflow-auto">
            <TeamsTable />
        </main>

    </div>
    );
};

export default TeamsPage;