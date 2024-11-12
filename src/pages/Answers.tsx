import FormsTable from "@/components/FormsTable";
import SideBarLayout from "@/components/SideBar";
import UserAnswersTable from "@/components/UserAnswersTable";
import { Outlet, useLocation  } from "react-router-dom";


const AnswersPage = () => {
    return (
        <div className="flex h-screen bg-gray-100">

        <SideBarLayout />
        <main className="flex-1 p-8 overflow-auto">
            <UserAnswersTable/>
        </main>
    </div>
    );
};

export default AnswersPage;