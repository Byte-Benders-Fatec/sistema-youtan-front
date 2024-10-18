import FormsTable from "@/components/FormsTable";
import SideBarLayout from "@/components/SideBar";
import { Outlet, useLocation  } from "react-router-dom";


const FormsPage = () => {
    const location = useLocation();

    const isFormulariosRoot = location.pathname === "/formularios";

    return (
        <div className="flex h-screen bg-gray-100">

        <SideBarLayout />

        <main className="flex-1 p-8 overflow-auto">
            {isFormulariosRoot && <FormsTable />}
            <Outlet />
        </main>

    </div>
    );
};

export default FormsPage;